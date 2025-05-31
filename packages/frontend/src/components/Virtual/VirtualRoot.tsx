import type { VirtualItemStateRefObject } from './VirtualItem'
import {
  type ReactNode,
  type RefObject,
  useLayoutEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { type VirtualContextType, VirtualContext } from './VirtualContext'

type VirtualRootProps = {
  children?: ReactNode
  rootMargin?: string
  threshold?: number
}

export const VirtualRoot = (props: VirtualRootProps) => {
  const { rootMargin, threshold, children } = props

  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const itemsRef = useRef<Map<Element, RefObject<VirtualItemStateRefObject>>>(
    new Map(),
  )

  const registerItem = useCallback(
    (element: HTMLElement, stateRef: RefObject<VirtualItemStateRefObject>) => {
      itemsRef.current.set(element, stateRef)
      intersectionObserverRef.current?.observe(element)
      resizeObserverRef.current?.observe(element)

      return () => {
        itemsRef.current.delete(element)
        intersectionObserverRef.current?.unobserve(element)
        resizeObserverRef.current?.unobserve(element)
      }
    },
    [],
  )

  useLayoutEffect(() => {
    const intersectionObserverHandler = (
      entries: IntersectionObserverEntry[],
    ) => {
      entries.forEach((entry) => {
        const { isIntersecting, target } = entry
        itemsRef.current.get(target)?.current?.setVisible(isIntersecting)
      })
    }

    const resizeObserverHandler = (entries: ResizeObserverEntry[]) => {
      entries.forEach((entry) => {
        const { target } = entry
        itemsRef.current.get(target)?.current?.saveHeight()
      })
    }

    intersectionObserverRef.current = new IntersectionObserver(
      intersectionObserverHandler,
      {
        rootMargin,
        threshold,
      },
    )

    resizeObserverRef.current = new ResizeObserver(resizeObserverHandler)

    return () => {
      intersectionObserverRef.current?.disconnect()
      resizeObserverRef.current?.disconnect()
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
