import type { FC } from 'react'
import {
  dragEnterHandler,
  dragLeaveHandler,
  dragStartHandler,
  dragOverHandler,
  dragEndHandler,
  dropHandler,
} from './handlers'
import { usePersonCardChunk } from './usePersonCardChunk'
import { PersonCard } from '../PersonCard/PersonCard'
import style from './PersonCardChunkList.module.css'

export type PersonCardChunkListProps = {
  className?: string
}

export const PersonCardChunkList: FC<PersonCardChunkListProps> = (props) => {
  const { className } = props
  const {
    persons,
    chunkIndex,
    onToggle: togglePerson,
    onDrop,
  } = usePersonCardChunk()

  return (
    <ul className={className}>
      {persons.map((person) => (
        <li
          key={person.id}
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
