import type { PersonCardChunkRootContextType } from './types'
import { createContext } from 'react'

export const PersonCardChunkRootContext =
  createContext<PersonCardChunkRootContextType | null>(null)
