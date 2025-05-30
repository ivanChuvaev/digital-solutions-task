import {
  useCallback,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useLayoutEffect,
} from 'react'
import { VirtualContext, type VirtualContextType } from './VirtualContext'

type VirtualRootProps = {
  children?: ReactNode
  rootMargin?: string
  threshold?: number
}

export const VirtualRoot = (props: VirtualRootProps) => {
  const { children, rootMargin, threshold } = props

  const observerRef = useRef<IntersectionObserver | null>(null)

  const itemsRef = useRef<
    Map<
      Element,
      { element: Element; setVisible: Dispatch<SetStateAction<boolean>> }
    >
  >(new Map())

  const registerItem = useCallback(
    (element: HTMLElement, setVisible: Dispatch<SetStateAction<boolean>>) => {
      itemsRef.current.set(element, { element, setVisible })
      observerRef.current?.observe(element)

      return () => {
        itemsRef.current.delete(element)
        observerRef.current?.unobserve(element)
      }
    },
    [],
  )

  useLayoutEffect(() => {
    const handler = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const { isIntersecting, target } = entry
        const item = itemsRef.current.get(target)
        if (!item) return
        item.setVisible(isIntersecting)
      })
    }

    observerRef.current = new IntersectionObserver(handler, {
      rootMargin,
      threshold,
    })

    return () => {
      observerRef.current?.disconnect()
    }
  }, [rootMargin, threshold])

  const providerValue = useMemo<VirtualContextType>(
    () => ({ registerItem }),
    [registerItem],
  )

  return (
    <VirtualContext.Provider value={providerValue}>
      {children}
    </VirtualContext.Provider>
  )
}
