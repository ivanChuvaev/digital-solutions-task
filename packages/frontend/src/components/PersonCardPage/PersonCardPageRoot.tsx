import type { PersonCardPageStateRefObject } from './types'
import type { Person } from '../../types'
import {
  type ReactNode,
  type Ref,
  type FC,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react'
import { PersonCardPageRootContext } from './PersonCardPageRootContext'
import { useQuery } from '@tanstack/react-query'

export type PersonCardPageRootProps = {
  range: [number, number]
  stateRef?: Ref<PersonCardPageStateRefObject>
  children?: ReactNode
  enabled?: boolean
  search?: string
  onDrop?: (aPersonId: number, bPersonId: number) => void
  onToggle?: (id: number) => void
}

export const PersonCardPageRoot: FC<PersonCardPageRootProps> = (props) => {
  const {
    stateRef,
    children,
    range,
    search,
    enabled = true,
    onToggle,
    onDrop,
  } = props

  const {
    data: fetchedPersons,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['data-page', range, search],
    staleTime: Number.POSITIVE_INFINITY,
    enabled,
    queryFn: async () => {
      const url = new URL(
        '/data',
        import.meta.env.VITE_API_URL || window.origin,
      )
      url.searchParams.set('range', JSON.stringify(range))
      if (search) {
        url.searchParams.set('search', search)
      }
      const res = await fetch(url)
      return await (res.json() as Promise<Person[]>)
    },
  })

  const [persons, setPersons] = useState<Person[]>([])

  const onToggleRef = useRef(onToggle)
  const onDropRef = useRef(onDrop)

  onToggleRef.current = onToggle
  onDropRef.current = onDrop

  const toggleHandler = useCallback((index: number) => {
    onToggleRef.current?.(index)
  }, [])

  const dropHandler = useCallback((aIndex: number, bIndex: number) => {
    onDropRef.current?.(aIndex, bIndex)
  }, [])

  const provideValue = useMemo(
    () => ({
      onToggle: toggleHandler,
      onDrop: dropHandler,
      isLoading,
      persons,
      error,
    }),
    [persons, dropHandler, toggleHandler, isLoading, error],
  )

  useImperativeHandle(
    stateRef,
    () => ({
      setPersons,
      persons,
    }),
    [persons, setPersons],
  )

  useEffect(() => {
    if (fetchedPersons) {
      setPersons(fetchedPersons)
    }
  }, [fetchedPersons])

  return (
    <PersonCardPageRootContext.Provider value={provideValue}>
      {children}
    </PersonCardPageRootContext.Provider>
  )
}
