import type { VirtualItemStateRefObject } from './VirtualItem'
import { type RefObject, createContext } from 'react'

export type VirtualContextType = {
  registerItem: (
    element: HTMLElement,
    stateRef: RefObject<VirtualItemStateRefObject>,
  ) => () => void
}

export const VirtualContext = createContext<VirtualContextType | null>(null)
