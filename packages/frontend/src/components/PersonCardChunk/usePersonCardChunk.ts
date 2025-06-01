import { PersonCardChunkRootContext } from './PersonCardChunkRootContext'
import { useContext } from 'react'

export const usePersonCardChunk = () => {
  const context = useContext(PersonCardChunkRootContext)
  if (!context) {
    throw new Error('usePersonCardChunk out of context')
  }
  return context
}
