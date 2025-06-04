import type { FC } from 'react'
import {
  dragEnterHandler,
  dragLeaveHandler,
  dragStartHandler,
  dragOverHandler,
  dragEndHandler,
  dropHandler,
} from './handlers'
import { usePersonCardPage } from './usePersonCardPage'
import { PersonCard } from '../PersonCard/PersonCard'
import style from './PersonCardPageList.module.css'

export type PersonCardPageListProps = {
  className?: string
}

export const PersonCardPageList: FC<PersonCardPageListProps> = (props) => {
  const { className } = props
  const { persons, onToggle, onDrop } = usePersonCardPage()

  if (!persons || persons.length === 0) {
    return null
  }

  return (
    <ul className={className}>
      {persons.map((person) => (
        <li
          key={person.id}
          draggable
          onDrop={(event) =>
            dropHandler(event, person.index, style['dragged-over'], onDrop)
          }
          onDragStart={(event) =>
            dragStartHandler(event, person.index, style['dragged'])
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
            onToggleCheckbox={onToggle}
          />
        </li>
      ))}
    </ul>
  )
}
