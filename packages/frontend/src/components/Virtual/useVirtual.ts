import { VirtualContext } from './VirtualContext'
import { useContext } from 'react'

export const useVirtual = () => {
  const context = useContext(VirtualContext)

  if (!context) {
    throw new Error('useVirtual out of context')
  }

  return context
}
