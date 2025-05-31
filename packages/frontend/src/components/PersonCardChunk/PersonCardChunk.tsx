import type { Person } from '../../types'
import {
  dragEnterHandler,
  dragLeaveHandler,
  dragStartHandler,
  dragOverHandler,
  dragEndHandler,
  dropHandler,
} from './handlers'
import {
  type Ref,
  type FC,
  useImperativeHandle,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react'
import { PersonCard } from '../PersonCard/PersonCard'
import style from './PersonCardChunk.module.css'

export type PersonCardChunkStateRefObject = {
  persons: Person[]
  replace: (id: number, newPerson: Person) => void
  toggle: (id: number, value: boolean) => void
  swap: (aId: number, bId: number) => void
}

export type PersonCardChunkProps = {
  chunkIndex: number
  chunk: Person[]
  stateRef?: Ref<PersonCardChunkStateRefObject>
  className?: string
  onDrop?: (
    aChunkIndex: number,
    aPersonId: number,
    bChunkIndex: number,
    bPersonId: number,
  ) => void
  onToggle?: (id: number, value: boolean) => void
}

export const PersonCardChunk: FC<PersonCardChunkProps> = (props) => {
  const { chunkIndex, className, onToggle, stateRef, onDrop, chunk } = props

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
    <ul className={className}>
      {persons.map((person, index) => (
        <li
          key={`${person.id}-${index}`}
          draggable
          onDrop={(event) =>
            dropHandler(
              event,
              person.id,
              chunkIndex,
              style['dragged-over'],
              onDrop,
            )
          }
          onDragStart={(event) =>
            dragStartHandler(event, person.id, chunkIndex, style['dragged'])
          }
          onDragLeave={(event) =>
            dragLeaveHandler(event, style['dragged-over'])
          }
          onDragEnter={(event) =>
            dragEnterHandler(event, style['dragged-over'])
          }
          onDragEnd={(event) => dragEndHandler(event, style['dragged'])}
          onDragOver={dragOverHandler}
        >
          <PersonCard
            className={style['person-card']}
            person={person}
            onToggleCheckbox={togglePerson}
          />
        </li>
      ))}
    </ul>
  )
}
