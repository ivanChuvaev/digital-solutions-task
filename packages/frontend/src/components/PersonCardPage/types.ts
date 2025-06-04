import type { SetStateAction } from 'react'
import type { Person } from '../../types'

export type PersonCardPageRootContextType = {
  error: Error | null
  isLoading: boolean
  persons: Person[]
  onDrop: (aPersonId: number, bPersonId: number) => void
  onToggle: (id: number) => void
}

export type PersonCardPageStateRefObject = {
  persons: Person[]
  setPersons: (persons: SetStateAction<Person[]>) => void
}
