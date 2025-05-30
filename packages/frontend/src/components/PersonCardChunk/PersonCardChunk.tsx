import {
  useState,
  useImperativeHandle,
  useEffect,
  useCallback,
  useRef,
  type Ref,
  type FC,
} from 'react'
import type { Person } from '../../types'
import { PersonCard } from '../PersonCard/PersonCard'
import { dragStartHandler, dragOverHandler, dropHandler } from './handlers'

export type PersonCardChunkStateRefObject = {
  persons: Person[]
  swap: (aId: number, bId: number) => void
  replace: (id: number, newPerson: Person) => void
  toggle: (id: number, value: boolean) => void
}

export type PersonCardChunkProps = {
  chunk: Person[]
  chunkIndex: number
  className?: string
  stateRef?: Ref<PersonCardChunkStateRefObject>
  onToggle?: (id: number, value: boolean) => void
  onDrop?: (
    aChunkIndex: number,
    aPersonId: number,
    bChunkIndex: number,
    bPersonId: number,
  ) => void
}

export const PersonCardChunk: FC<PersonCardChunkProps> = (props) => {
  const { chunk, chunkIndex, stateRef, className, onToggle, onDrop } = props

  const [persons, setPersons] = useState(chunk)

  const onToggleRef = useRef(onToggle)
  onToggleRef.current = onToggle

  const togglePerson = useCallback((id: number, value: boolean) => {
    setPersons((prev) => {
      return prev.map((person) =>
        person.id === id ? { ...person, checked: value } : person,
      )
    })
    onToggleRef.current?.(id, value)
  }, [])

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

  const replacePerson = useCallback(
    (id: number, newPerson: Person) => {
      setPersons((prev) => {
        return prev.map((person) => (person.id === id ? newPerson : person))
      })
    },
    [setPersons],
  )

  useImperativeHandle(
    stateRef,
    () => ({
      persons,
      swap: swapPerson,
      replace: replacePerson,
      toggle: togglePerson,
    }),
    [persons, swapPerson, replacePerson, togglePerson],
  )

  useEffect(() => {
    setPersons(chunk)
  }, [chunk])

  return (
    <ul className={className}>
      {persons.map((person) => (
        <li
          key={person.id}
          draggable
          onDragStart={(event) =>
            dragStartHandler(event, person.id, chunkIndex)
          }
          onDragOver={dragOverHandler}
          onDrop={(event) => dropHandler(event, person.id, chunkIndex, onDrop)}
        >
          <PersonCard person={person} onToggleCheckbox={togglePerson} />
        </li>
      ))}
    </ul>
  )
}
