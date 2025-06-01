import type { Person } from '../../types'

export type PersonCardChunkRootContextType = {
  chunkIndex: number
  persons: Person[]
  onDrop: (
    aChunkIndex: number,
    aPersonId: number,
    bChunkIndex: number,
    bPersonId: number,
  ) => void
  onToggle: (id: number, value: boolean) => void
}

export type PersonCardChunkStateRefObject = {
  persons: Person[]
  replace: (id: number, newPerson: Person) => void
  toggle: (id: number, value: boolean) => void
  swap: (aId: number, bId: number) => void
}
