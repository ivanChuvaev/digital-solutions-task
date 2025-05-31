import {
  type ComponentProps,
  type SetStateAction,
  type ComponentType,
  type ReactNode,
  type Dispatch,
  type JSX,
  type Ref,
  useImperativeHandle,
  useLayoutEffect,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react'
import styles from './VirtualItem.module.css'
import { useVirtual } from './useVirtual'
import cn from 'classnames'

export type VirtualItemStateRefObject = {
  setVisible: Dispatch<SetStateAction<boolean>>
  saveHeight: () => void
}

export type VirtualItemProps<T extends keyof JSX.IntrinsicElements> = {
  children: ReactNode
  initialHeight?: number
  className?: string
  as?: T
} & Omit<ComponentProps<T>, 'children' | 'ref'>

export const VirtualItem = <T extends keyof JSX.IntrinsicElements>(
  props: VirtualItemProps<T>,
) => {
  const {
    initialHeight = 0,
    as = 'div',
    className,
    children,
    ...restProps
  } = props

  const Component = as as unknown as ComponentType<
    typeof restProps & {
      ref: Ref<HTMLElement>
      children: ReactNode
      className: string
    }
  >

  const ref = useRef<HTMLElement>(null)

  const { registerItem } = useVirtual()

  const [visible, setVisible] = useState(false)

  const saveHeight = useCallback(() => {
    if (!ref.current) return
    ref.current.style.setProperty('--height', `${ref.current.clientHeight}px`)
  }, [])

  const stateRef = useRef<VirtualItemStateRefObject>({
    saveHeight,
    setVisible,
  })

  useImperativeHandle(stateRef, () => {
    return {
      saveHeight,
      setVisible,
    }
  }, [setVisible, saveHeight])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    return registerItem(element, stateRef)
  }, [registerItem])

  useLayoutEffect(() => {
    ref.current?.style.setProperty('--initial-height', `${initialHeight}px`)
  }, [initialHeight])

  return (
    <Component
      {...restProps}
      ref={ref}
      className={cn(className, styles.item, visible && styles['item--visible'])}
    >
      {visible ? children : null}
    </Component>
  )
}
