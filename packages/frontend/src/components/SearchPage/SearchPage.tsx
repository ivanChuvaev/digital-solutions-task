import type { MutationAction, Person } from '../../types'
import {
  type ReactNode,
  createRef,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import {
  type PersonCardChunkStateRefObject,
  PersonCardChunk,
} from '../PersonCardChunk'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
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
  const [syncStatus, setSyncStatus] = useState<
    'error' | 'timeout' | 'pending' | 'synced'
  >('synced')
  const [isScrolled, setIsScrolled] = useState(false)

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
    const options = [20, 50, 100, 200, 500, 1000]

    if (!options.includes(pageSize)) {
      options.push(pageSize)
      options.sort((a, b) => a - b)
    }

    return options
  }, [pageSize])

  const searchInputRef = useRef<HTMLInputElement>(null)

  const setSearchDebounced = useMemo(
    () => debounce(setSearch, 500),
    [setSearch],
  )

  const { fetchNextPage, hasNextPage, isLoading, error, data } =
    useInfiniteQuery({
      queryKey: ['data', search, pageSize],
      refetchOnWindowFocus: false,
      initialPageParam: 0,
      queryFn: async ({ pageParam }) => {
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
        const res = await fetch(url)
        return await (res.json() as Promise<Person[]>)
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.length === pageSize ? pages.length + 1 : undefined
      },
    })

  const { mutate: actionFetch } = useMutation({
    onError: (_, actions) => {
      setSyncStatus('error')
      for (const action of actions.reverse()) {
        switch (action.type) {
          case 'toggle': {
            const [id, value] = action.payload

            const chunk = chunks?.find((chunk) =>
              chunk.stateRef.current?.persons.find(
                (person) => person.id === id,
              ),
            )

            if (chunk) {
              chunk.stateRef.current?.toggle(id, !value)
            }

            break
          }
          case 'swap': {
            const [aId, bId] = action.payload

            const aChunk = chunks?.find((chunk) =>
              chunk.stateRef.current?.persons.find(
                (person) => person.id === aId,
              ),
            )
            const bChunk = chunks?.find((chunk) =>
              chunk.stateRef.current?.persons.find(
                (person) => person.id === bId,
              ),
            )

            if (aChunk && bChunk) {
              if (aChunk === bChunk) {
                aChunk.stateRef.current?.swap(aId, bId)
              } else {
                const aPerson = aChunk.stateRef?.current?.persons.find(
                  (person) => person.id === aId,
                )
                const bPerson = bChunk.stateRef?.current?.persons.find(
                  (person) => person.id === bId,
                )
                if (aPerson && bPerson) {
                  aChunk.stateRef.current?.replace(aId, bPerson)
                  bChunk.stateRef.current?.replace(bId, aPerson)
                }
              }
            }

            break
          }
        }
      }
    },
    mutationFn: async (entries: MutationAction[]) => {
      const url = new URL(
        '/action',
        import.meta.env.VITE_API_URL || window.origin,
      )
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
    onSuccess: () => {
      setSyncStatus('synced')
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

  const fetchNextPageDebounced = useMemo(
    () => debounce(fetchNextPage, 300, { leading: true }),
    [fetchNextPage],
  )

  const swapPersonLocal = (
    aChunkIndex: number,
    aId: number,
    bChunkIndex: number,
    bId: number,
  ) => {
    if (!chunks) return
    const aItem = chunks[aChunkIndex].stateRef.current?.persons.find(
      (item) => item.id === aId,
    )
    const bItem = chunks[bChunkIndex].stateRef.current?.persons.find(
      (item) => item.id === bId,
    )
    if (!aItem || !bItem) return
    if (aChunkIndex === bChunkIndex) {
      chunks[aChunkIndex].stateRef.current?.swap(aId, bId)
    } else {
      chunks[aChunkIndex].stateRef.current?.replace(aId, bItem)
      chunks[bChunkIndex].stateRef.current?.replace(bId, aItem)
    }
  }

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

  const togglePersonAccumulativeFetch = useMemo(() => {
    return (id: number, value: boolean) => {
      actionAccumulativeFetch({
        payload: [id, value],
        type: 'toggle',
      })
    }
  }, [actionAccumulativeFetch])

  const swapPersonAccumulativeFetch = useMemo(() => {
    return (aId: number, bId: number) => {
      actionAccumulativeFetch({
        payload: [aId, bId],
        type: 'swap',
      })
    }
  }, [actionAccumulativeFetch])

  const swapPerson = (
    aChunkIndex: number,
    aId: number,
    bChunkIndex: number,
    bId: number,
  ) => {
    swapPersonAccumulativeFetch(aId, bId)
    swapPersonLocal(aChunkIndex, aId, bChunkIndex, bId)
  }

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = search ?? ''
    }
  }, [search])

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
        <Virtual.Root rootMargin="300px 0px 300px 0px">
          <ul className={styles['person-list']}>
            {chunks.map((chunk, index) => (
              <Virtual.Item
                key={chunk.chunk[0]?.id}
                initialHeight={500}
                as="li"
              >
                {index > 0 && (
                  <div className={styles['page-counter']}>Page {index + 1}</div>
                )}
                <PersonCardChunk
                  stateRef={chunk.stateRef}
                  className={styles['person-chunk']}
                  chunk={chunk.chunk}
                  chunkIndex={index}
                  onToggle={togglePersonAccumulativeFetch}
                  onDrop={swapPerson}
                />
              </Virtual.Item>
            ))}
          </ul>
        </Virtual.Root>
        {hasNextPage && (
          <IntersectionTrigger
            key={data?.pages.length}
            className={styles['page-load-trigger']}
            rootMargin="0px 0px 500px 0px"
            mountDelay={200}
            onIntersect={fetchNextPageDebounced}
          />
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
