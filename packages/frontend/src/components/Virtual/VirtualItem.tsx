import {
  useRef,
  type ReactNode,
  useState,
  useEffect,
  type JSX,
  type ComponentProps,
  type ComponentType,
  type Ref,
} from 'react'

import { useVirtual } from './useVirtual'
import cn from 'classnames'
import styles from './VirtualItem.module.css'

type VirtualItemProps<T extends keyof JSX.IntrinsicElements> = {
  children: ReactNode
  className?: string
  initialHeight?: number
  as?: T
} & Omit<ComponentProps<T>, 'children' | 'ref'>

export const VirtualItem = <T extends keyof JSX.IntrinsicElements>(
  props: VirtualItemProps<T>,
) => {
  const {
    children,
    className,
    initialHeight = 0,
    as = 'div',
    ...restProps
  } = props

  const Component = as as unknown as ComponentType<
    typeof restProps & {
      className: string
      children: ReactNode
      ref: Ref<HTMLElement>
    }
  >

  const ref = useRef<HTMLElement>(null)

  const [isVisible, setIsVisible] = useState(false)

  const { registerItem } = useVirtual()

  useEffect(() => {
    const element = ref.current
    if (!element) return

    return registerItem(element, setIsVisible)
  }, [registerItem])

  useEffect(() => {
    const element = ref.current
    if (!element || !isVisible) return

    const handler = () => {
      element.style.setProperty('--height', `${element.clientHeight}px`)
    }

    handler()

    const observer = new ResizeObserver(handler)

    observer.observe(element)

    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    ref.current?.style.setProperty('--initial-height', `${initialHeight}px`)
  }, [initialHeight])

  return (
    <Component
      {...restProps}
      ref={ref}
      className={cn(
        className,
        styles.item,
        isVisible && styles['item--visible'],
      )}
    >
      {isVisible ? children : null}
    </Component>
  )
}
