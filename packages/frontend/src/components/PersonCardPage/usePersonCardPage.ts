import { PersonCardPageRootContext } from './PersonCardPageRootContext'
import { useContext } from 'react'

export const usePersonCardPage = () => {
  const context = useContext(PersonCardPageRootContext)
  if (!context) {
    throw new Error('usePersonCardPage out of context')
  }
  return context
}
