import { createContext, type SetStateAction, type Dispatch } from 'react'

export type VirtualContextType = {
  registerItem: (
    element: HTMLElement,
    setVisible: Dispatch<SetStateAction<boolean>>,
  ) => () => void
}

export const VirtualContext = createContext<VirtualContextType | null>(null)
