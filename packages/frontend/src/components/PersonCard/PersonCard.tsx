import type { Person } from '../../types'
import type { FC } from 'react'
import styles from './PersonCard.module.css'
import { Checkbox } from '../Checkbox'

type PersonCardProps = {
  person: Person
  onToggleCheckbox: (id: number, value: boolean) => void
}

export const PersonCard: FC<PersonCardProps> = ({
  person,
  onToggleCheckbox,
}) => {
  return (
    <article className={styles['person-card']}>
      <Checkbox
        className={styles['person-card-checkbox']}
        checked={person.checked}
        onChange={() => onToggleCheckbox(person.id, !person.checked)}
      />
      <img
        className={styles['person-card-avatar']}
        alt={person.first_name}
        src={person.avatar}
      />
      <div className={styles['person-card-content']}>
        <b>
          {person.first_name} {person.last_name}
          <div className={styles['person-card-content-id']}>{person.id}</div>
        </b>
        <div>{person.email}</div>
        <div>{person.phone}</div>
      </div>
    </article>
  )
}
