import type { MutationAction, SyncStatus } from '../../types'
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
  type PersonCardPageStateRefObject,
  PersonCardPage,
} from '../PersonCardPage'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useIsWindowScrolled } from '../../hooks/useIsWindowScrolled'
import { useQueryParamNumber } from '../../hooks/useQueryParamNumber'
import { togglePersonFactory } from './helpers/togglePersonFactory'
import { movePersonFactory } from './helpers/movePersonFactory'
import { swapPersonFactory } from './helpers/swapPersonFactory'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { IntersectionTrigger } from '../IntersectionTrigger'
import { translateSyncStatus } from './translateSyncStatus'
import { useQueryParam } from '../../hooks/useQueryParam'
import { debounce } from '../../utils/debounce'
import styles from './SearchPage.module.css'
import { PatternBox } from '../PatternBox'
import { Virtual } from '../Virtual'
import cn from 'classnames'

export const SearchPage = () => {
  const [search, setSearch] = useQueryParam('search')
  const [pageSize, setPageSize] = useQueryParamNumber('pageSize', 20)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced')
  const [pageCount, setPageCount] = useState(1)
  const isWindowScrolled = useIsWindowScrolled()
  const [dropAction, setDropAction] = useLocalStorage<'SWAP' | 'MOVE'>(
    'drop-action',
    'MOVE',
  )

  const queryClient = useQueryClient()

  const syncStatusRef = useRef<SyncStatus>(syncStatus)
  const actionsOnSyncedRef = useRef<Array<() => void>>([])
  const uniqueIdRef = useRef(Math.random().toString(36).substring(2, 15))
  const searchInputRef = useRef<HTMLInputElement>(null)

  syncStatusRef.current = syncStatus

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

  const {
    data: totalCount,
    isLoading: isLodingTotalCount,
    error: errorTotalCount,
  } = useQuery({
    queryKey: ['data-total-count', search],
    queryFn: async () => {
      const url = new URL(
        '/data',
        import.meta.env.VITE_API_URL || window.origin,
      )
      if (search) {
        url.searchParams.set('search', search)
      }
      url.searchParams.set('range', JSON.stringify([0, 0]))
      const res = await fetch(url)
      return parseInt(res.headers.get('total-count') ?? '0')
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
    onError: () => {
      setSyncStatus('error')
      runActionWhenSynced(() => {
        queryClient.invalidateQueries({
          queryKey: ['data-page'],
          refetchType: 'active',
        })
      })
    },
    onSuccess: () => {
      setSyncStatus('synced')
    },
  })

  useQuery({
    refetchIntervalInBackground: true,
    queryKey: ['data-long-polling'],
    refetchInterval: 1,
    retryDelay: 10000,
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
        runActionWhenSynced(() => {
          queryClient.invalidateQueries({
            queryKey: ['data-page'],
            refetchType: 'active',
          })
        })
      }
      return response
    },
  })

  const maxPageCount = useMemo(() => {
    if (!totalCount) return 0
    return Math.ceil(totalCount / pageSize)
  }, [totalCount, pageSize])

  const pages = useMemo(() => {
    return Array.from({ length: pageCount }, (_, index) => ({
      range: [index * pageSize, (index + 1) * pageSize] as [number, number],
      stateRef: createRef<PersonCardPageStateRefObject>(),
    }))
  }, [pageCount, pageSize])

  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const runActionWhenSynced = useCallback((action: () => void) => {
    if (
      syncStatusRef.current === 'synced' ||
      syncStatusRef.current === 'error'
    ) {
      action()
      return
    }
    actionsOnSyncedRef.current.push(action)
  }, [])

  const addNewPageDebounced = useMemo(
    () => debounce(() => setPageCount(pageCount + 1), 500, { leading: true }),
    [pageCount],
  )

  const swapPersonLocal = useMemo(() => swapPersonFactory(pagesRef), [])
  const movePersonLocal = useMemo(() => movePersonFactory(pagesRef), [])
  const togglePersonLocal = useMemo(() => togglePersonFactory(pagesRef), [])

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

  const togglePerson = useCallback(
    (id: number) => {
      togglePersonLocal(id)
      actionAccumulativeFetch({
        type: 'toggle',
        payload: id,
      })
    },
    [actionAccumulativeFetch, togglePersonLocal],
  )

  const swapPerson = useCallback(
    (aIndex: number, bIndex: number) => {
      swapPersonLocal(aIndex, bIndex)
      actionAccumulativeFetch({
        payload: [aIndex, bIndex],
        type: 'swap',
      })
    },
    [actionAccumulativeFetch, swapPersonLocal],
  )

  const movePerson = useCallback(
    (oldIndex: number, newIndex: number) => {
      movePersonLocal(oldIndex, newIndex)
      actionAccumulativeFetch({
        payload: [oldIndex, newIndex],
        type: 'move',
      })
    },
    [actionAccumulativeFetch, movePersonLocal],
  )

  const dropActionFn = useMemo(() => {
    if (dropAction === 'MOVE') {
      return movePerson
    }
    return swapPerson
  }, [dropAction, movePerson, swapPerson])

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.value = search ?? ''
    }
  }, [search])

  useEffect(() => {
    if (syncStatus === 'synced' || syncStatus === 'error') {
      actionsOnSyncedRef.current.forEach((action) => action())
      actionsOnSyncedRef.current = []
    }
  }, [syncStatus])

  useEffect(() => {
    setPageCount(1)
  }, [totalCount, pageSize])

  let content: ReactNode = null

  if (isLodingTotalCount) {
    content = <div className={styles['page-message']}>Loading...</div>
  } else if (totalCount === 0) {
    content = <div className={styles['page-message']}>No data</div>
  } else if (errorTotalCount) {
    content = (
      <div className={styles['page-message']}>
        Error: {errorTotalCount.message}
      </div>
    )
  } else {
    content = (
      <>
        <ul className={styles['person-list']}>
          <Virtual.Root rootMargin="300px 0px 300px 0px">
            {pages.map((page, index) => (
              <Virtual.Item
                key={`${index}-${pageSize}-${totalCount}`}
                initialHeight={500}
                as="li"
              >
                {(isVisible) => (
                  <PersonCardPage.Root
                    stateRef={page.stateRef}
                    search={search ?? undefined}
                    enabled={isVisible}
                    range={page.range}
                    onToggle={togglePerson}
                    onDrop={dropActionFn}
                  >
                    {isVisible && (
                      <PersonCardPage.Consumer>
                        {({ isLoading, error }) => {
                          if (isLoading) {
                            return (
                              <PatternBox
                                className={styles['person-page-message']}
                              >
                                Loading page {index + 1}...
                              </PatternBox>
                            )
                          }
                          if (error) {
                            return (
                              <PatternBox
                                className={styles['person-page-message']}
                              >
                                Error loading page {index + 1}: {error.message}
                              </PatternBox>
                            )
                          }
                          return (
                            <>
                              {index > 0 && (
                                <PatternBox
                                  className={styles['person-page-title']}
                                >
                                  Page {index + 1}
                                </PatternBox>
                              )}
                              <PersonCardPage.List
                                className={styles['person-page']}
                              />
                              {index === pageCount - 1 &&
                                pageCount < maxPageCount && (
                                  <IntersectionTrigger
                                    key={pageCount}
                                    rootMargin="0px 0px 1000px 0px"
                                    mountDelay={200}
                                    onIntersect={addNewPageDebounced}
                                  />
                                )}
                            </>
                          )
                        }}
                      </PersonCardPage.Consumer>
                    )}
                  </PersonCardPage.Root>
                )}
              </Virtual.Item>
            ))}
          </Virtual.Root>
        </ul>
      </>
    )
  }

  return (
    <>
      <search
        className={cn(styles.search, {
          [styles['search--scrolled']]: isWindowScrolled,
        })}
      >
        <svg className={styles['search-svg-pattern']}>
          <rect fill="url(#square-pattern)" height="100%" width="100%" />
        </svg>
        <div className={cn(styles['search-container'], 'container')}>
          <input
            ref={searchInputRef}
            className={styles['search-input']}
            placeholder="Search by ID"
            type="search"
            onChange={(e) => setSearchDebounced(e.target.value)}
          />
          <select
            value={pageSize?.toString() ?? ''}
            id="search-page-size-select"
            onChange={(e) => {
              const value = parseInt(e.target.value)
              if (Number.isNaN(value)) {
                setPageSize(null)
              } else {
                setPageSize(value)
              }
            }}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <select
            value={dropAction}
            onChange={(e) => {
              setDropAction(e.target.value as 'SWAP' | 'MOVE')
            }}
          >
            <option value="MOVE">MOVE</option>
            <option value="SWAP">SWAP</option>
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
