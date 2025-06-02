import type { MutationAction, SyncStatus, Person } from '../../types'
import {
  type ReactNode,
  useCallback,
  createRef,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import {
  useInfiniteQuery,
  useQueryClient,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import {
  type PersonCardChunkStateRefObject,
  PersonCardChunk,
} from '../PersonCardChunk'
import { IntersectionTrigger } from '../IntersectionTrigger'
import { translateSyncStatus } from './translateSyncStatus'
import { useQueryParam } from '../../hooks/useQueryParam'
import { debounce } from '../../utils/debounce'
import styles from './SearchPage.module.css'
import { Virtual } from '../Virtual'
import cn from 'classnames'

export const SearchPage = () => {
  const [search, setSearch] = useQueryParam('search')
  const [pageSizeStr, setPageSizeStr] = useQueryParam('pageSize')
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [isScrolled, setIsScrolled] = useState(false)
  const queryClient = useQueryClient()

  const syncStatusRef = useRef<SyncStatus>(syncStatus)
  const actionsOnSyncedRef = useRef<Array<() => void>>([])
  const uniqueIdRef = useRef(Math.random().toString(36).substring(2, 15))
  const searchInputRef = useRef<HTMLInputElement>(null)

  syncStatusRef.current = syncStatus

  const pageSize = useMemo(() => {
    try {
      if (!pageSizeStr) throw new Error()
      const parsed = parseInt(pageSizeStr)
      if (Number.isNaN(parsed)) throw new Error()
      return parsed
    } catch {
      return 20
    }
  }, [pageSizeStr])

  const pageSizeOptions = useMemo(() => {
    const options = [20, 50, 100]

    if (!options.includes(pageSize)) {
      options.push(pageSize)
      options.sort((a, b) => a - b)
    }

    return options
  }, [pageSize])

  const setSearchDebounced = useMemo(
    () => debounce(setSearch, 500),
    [setSearch],
  )

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ['data', search, pageSize],
      staleTime: Number.POSITIVE_INFINITY,
      initialPageParam: 0,
      queryFn: async ({ pageParam, signal }) => {
        const url = new URL(
          '/data',
          import.meta.env.VITE_API_URL || window.origin,
        )
        if (search) {
          url.searchParams.set('search', search)
        }
        url.searchParams.set(
          'range',
          JSON.stringify([pageParam * pageSize, (pageParam + 1) * pageSize]),
        )
        const res = await fetch(url, { signal })
        return await (res.json() as Promise<Person[]>)
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === pageSize ? pages.length : undefined
      },
    })

  const { mutate: actionFetch } = useMutation({
    mutationFn: async (entries: MutationAction[]) => {
      const url = new URL(
        '/action',
        import.meta.env.VITE_API_URL || window.origin,
      )
      url.searchParams.set('id', uniqueIdRef.current)
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entries),
        method: 'POST',
      })
      if (res.status !== 200) {
        throw new Error()
      }
      return res
    },
    onError: (_, actions) => {
      setSyncStatus('error')
      const reversedActions = actions.reverse().map((action) => {
        if (action.type === 'toggle') {
          action.payload[1] = !action.payload[1]
        }
        return action
      })
      runActionWhenSynced(() => applyActionsLocally(reversedActions))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        refetchType: 'none',
        queryKey: ['data'],
      })
      setSyncStatus('synced')
    },
  })

  useQuery({
    refetchIntervalInBackground: true,
    queryKey: ['data-long-polling'],
    refetchInterval: 1,
    queryFn: async (context) => {
      const url = new URL(
        '/is-data-changed-long-polling',
        import.meta.env.VITE_API_URL || window.origin,
      )
      url.searchParams.set('id', uniqueIdRef.current)
      const res = await fetch(url, { signal: context.signal })
      const response = (await res.json()) as {
        actions: MutationAction[]
      }
      if (response.actions.length > 0) {
        runActionWhenSynced(() => applyActionsLocally(response.actions))
        context.client.invalidateQueries({
          refetchType: 'none',
          queryKey: ['data'],
        })
      }
      return response
    },
  })

  const chunks = useMemo(() => {
    if (!data || data.pages.length === 0 || data.pages[0].length === 0) {
      return null
    }

    let pages = data.pages

    if (data.pages[data.pages.length - 1].length === 0) {
      pages = pages.slice(0, -1)
    }

    return pages.map((page) => ({
      stateRef: createRef<PersonCardChunkStateRefObject>(),
      chunk: page,
    }))
  }, [data])

  const chunksRef = useRef(chunks)
  chunksRef.current = chunks

  const runActionWhenSynced = useCallback((action: () => void) => {
    if (syncStatusRef.current === 'synced') {
      action()
      return
    }
    actionsOnSyncedRef.current.push(action)
  }, [])

  const fetchNextPageDebounced = useMemo(
    () => debounce(fetchNextPage, 300, { leading: true }),
    [fetchNextPage],
  )

  const swapPersonLocal = useCallback(
    (aChunkIndex: number, aId: number, bChunkIndex: number, bId: number) => {
      if (!chunksRef.current) return
      if (aChunkIndex === bChunkIndex) {
        chunksRef.current[aChunkIndex].stateRef.current?.swap(aId, bId)
      } else {
        const aPerson = chunksRef.current[
          aChunkIndex
        ].stateRef.current?.persons.find((item) => item.id === aId)
        const bPerson = chunksRef.current[
          bChunkIndex
        ].stateRef.current?.persons.find((item) => item.id === bId)
        if (!aPerson || !bPerson) return
        chunksRef.current[aChunkIndex].stateRef.current?.replace(aId, bPerson)
        chunksRef.current[bChunkIndex].stateRef.current?.replace(bId, aPerson)
      }
    },
    [],
  )

  const actionAccumulativeFetch = useMemo(() => {
    let entries: MutationAction[] = []
    let timeout: ReturnType<typeof setTimeout> | null = null

    return (action: MutationAction) => {
      entries.push(action)

      if (timeout) {
        clearTimeout(timeout)
      }

      setSyncStatus('timeout')

      timeout = setTimeout(() => {
        setSyncStatus('pending')
        actionFetch(entries)
        entries = []
      }, 1000)
    }
  }, [actionFetch])

  const applyActionsLocally = useCallback(
    (actions: MutationAction[]) => {
      for (const action of actions) {
        switch (action.type) {
          case 'toggle': {
            const [id, value] = action.payload

            const chunk = chunksRef.current?.find((chunk) =>
              chunk.stateRef.current?.persons.find(
                (person) => person.id === id,
              ),
            )

            if (chunk) {
              chunk.stateRef.current?.toggle(id, value)
            }

            break
          }
          case 'swap': {
            const [aId, bId] = action.payload

            const aChunkIndex =
              chunksRef.current?.findIndex((chunk) =>
                chunk.stateRef.current?.persons.find(
                  (person) => person.id === aId,
                ),
              ) ?? -1

            const bChunkIndex =
              chunksRef.current?.findIndex((chunk) =>
                chunk.stateRef.current?.persons.find(
                  (person) => person.id === bId,
                ),
              ) ?? -1

            if (aChunkIndex !== -1 && bChunkIndex !== -1) {
              swapPersonLocal(aChunkIndex, aId, bChunkIndex, bId)
            }

            break
          }
        }
      }
    },
    [swapPersonLocal],
  )

  const togglePersonAccumulativeFetch = useCallback(
    (id: number, value: boolean) => {
      actionAccumulativeFetch({
        payload: [id, value],
        type: 'toggle',
      })
    },
    [actionAccumulativeFetch],
  )

  const swapPersonAccumulativeFetch = useCallback(
    (aId: number, bId: number) => {
      actionAccumulativeFetch({
        payload: [aId, bId],
        type: 'swap',
      })
    },
    [actionAccumulativeFetch],
  )

  const swapPerson = useCallback(
    (aChunkIndex: number, aId: number, bChunkIndex: number, bId: number) => {
      swapPersonAccumulativeFetch(aId, bId)
      swapPersonLocal(aChunkIndex, aId, bChunkIndex, bId)
    },
    [swapPersonAccumulativeFetch, swapPersonLocal],
  )

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = search ?? ''
    }
  }, [search])

  useEffect(() => {
    if (syncStatus === 'synced') {
      actionsOnSyncedRef.current.forEach((action) => action())
      actionsOnSyncedRef.current = []
    }
  }, [syncStatus])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  let content: ReactNode = null

  if (isLoading) {
    content = <div className={styles['page-message']}>Loading...</div>
  } else if (!chunks) {
    content = <div className={styles['page-message']}>No data</div>
  } else if (error) {
    content = (
      <div className={styles['page-message']}>Error: {error.message}</div>
    )
  } else {
    content = (
      <>
        <ul className={styles['person-list']}>
          <Virtual.Root rootMargin="300px 0px 300px 0px">
            {chunks.map((chunk, index) => (
              <PersonCardChunk.Root
                key={`${index}-${pageSize}`}
                stateRef={chunk.stateRef}
                chunk={chunk.chunk}
                chunkIndex={index}
                onToggle={togglePersonAccumulativeFetch}
                onDrop={swapPerson}
              >
                <Virtual.Item initialHeight={500} as="li">
                  {index > 0 && (
                    <div className={styles['page-counter']}>
                      <svg className={styles['page-counter-svg-pattern']}>
                        <rect
                          fill="url(#square-pattern)"
                          height="100%"
                          width="100%"
                        />
                      </svg>
                      Page {index + 1}
                    </div>
                  )}
                  <PersonCardChunk.List className={styles['person-chunk']} />
                </Virtual.Item>
              </PersonCardChunk.Root>
            ))}
          </Virtual.Root>
        </ul>
        {hasNextPage && (
          <>
            <IntersectionTrigger
              key={data?.pages.length}
              rootMargin="0px 0px 1000px 0px"
              mountDelay={200}
              onIntersect={fetchNextPageDebounced}
            />
            <div className={styles['next-page-loader']}>
              <svg className={styles['next-page-loader-svg-pattern']}>
                <rect fill="url(#square-pattern)" height="100%" width="100%" />
              </svg>
              Loading...
            </div>
          </>
        )}
      </>
    )
  }

  return (
    <>
      <search
        className={cn(styles.search, {
          [styles['search--scrolled']]: isScrolled,
        })}
      >
        <svg className={styles['search-svg-pattern']}>
          <rect fill="url(#square-pattern)" height="100%" width="100%" />
        </svg>
        <div className={cn(styles['search-container'], 'container')}>
          <input
            ref={searchInputRef}
            className={styles['search-input']}
            placeholder="Search"
            type="search"
            onChange={(e) => setSearchDebounced(e.target.value)}
          />
          <select
            id="search-page-size-select"
            value={pageSize}
            onChange={(e) => setPageSizeStr(e.target.value)}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className={styles['sync-status']}>
            {translateSyncStatus(syncStatus)}
          </div>
        </div>
      </search>
      <div className={cn(styles['page-content'], 'container')}>{content}</div>
    </>
  )
}
