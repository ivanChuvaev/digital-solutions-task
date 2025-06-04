import type { PersonCardPageRootContextType } from './types'
import { createContext } from 'react'

export const PersonCardPageRootContext =
  createContext<PersonCardPageRootContextType | null>(null)
