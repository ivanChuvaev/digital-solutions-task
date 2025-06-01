import type { PersonCardChunkStateRefObject } from './types'
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
import { PersonCardChunkRootContext } from './PersonCardChunkRootContext'

export type PersonCardChunkRootProps = {
  chunkIndex: number
  chunk: Person[]
  stateRef?: Ref<PersonCardChunkStateRefObject>
  children?: ReactNode
  onDrop?: (
    aChunkIndex: number,
    aPersonId: number,
    bChunkIndex: number,
    bPersonId: number,
  ) => void
  onToggle?: (id: number, value: boolean) => void
}

export const PersonCardChunkRoot: FC<PersonCardChunkRootProps> = (props) => {
  const { chunkIndex, stateRef, chunk, children, onToggle, onDrop } = props

  const [persons, setPersons] = useState(chunk)

  const onToggleRef = useRef(onToggle)
  const onDropRef = useRef(onDrop)
  onToggleRef.current = onToggle
  onDropRef.current = onDrop

  const swapPerson = useCallback(
    (aId: number, bId: number) => {
      setPersons((prev) => {
        const copy = [...prev]
        const aIndex = copy.findIndex((person) => person.id === aId)
        const bIndex = copy.findIndex((person) => person.id === bId)
        ;[copy[aIndex], copy[bIndex]] = [copy[bIndex], copy[aIndex]]
        return copy
      })
    },
    [setPersons],
  )

  const togglePerson = useCallback((id: number, value: boolean) => {
    setPersons((prev) => {
      return prev.map((person) =>
        person.id === id ? { ...person, checked: value } : person,
      )
    })
  }, [])

  const handleDrop = useCallback(
    (
      aChunkIndex: number,
      aPersonId: number,
      bChunkIndex: number,
      bPersonId: number,
    ) => {
      onDropRef.current?.(aChunkIndex, aPersonId, bChunkIndex, bPersonId)
    },
    [],
  )

  const handleToggle = useCallback(
    (id: number, value: boolean) => {
      togglePerson(id, value)
      onToggleRef.current?.(id, value)
    },
    [togglePerson],
  )

  const replacePerson = useCallback(
    (id: number, newPerson: Person) => {
      setPersons((prev) => {
        return prev.map((person) => (person.id === id ? newPerson : person))
      })
    },
    [setPersons],
  )

  const provideValue = useMemo(
    () => ({
      onToggle: handleToggle,
      onDrop: handleDrop,
      chunkIndex,
      persons,
    }),
    [chunkIndex, persons, handleDrop, handleToggle],
  )

  useImperativeHandle(
    stateRef,
    () => ({
      replace: replacePerson,
      toggle: togglePerson,
      swap: swapPerson,
      persons,
    }),
    [persons, swapPerson, replacePerson, togglePerson],
  )

  useEffect(() => {
    setPersons(chunk)
  }, [chunk])

  return (
    <PersonCardChunkRootContext.Provider value={provideValue}>
      {children}
    </PersonCardChunkRootContext.Provider>
  )
}
