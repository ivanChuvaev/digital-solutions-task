import { useEffect, useRef, type FC } from 'react'

type IntersectionTriggerProps = {
  onIntersect: () => void
  className?: string
  rootMargin?: string
  threshold?: number
  mountDelay?: number
}

export const IntersectionTrigger: FC<IntersectionTriggerProps> = (props) => {
  const { onIntersect, className, rootMargin, threshold, mountDelay } = props
  const ref = useRef<HTMLDivElement>(null)

  const handleIntersectRef = useRef(onIntersect)
  handleIntersectRef.current = onIntersect

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observerHandler = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting) {
        handleIntersectRef.current()
      }
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const observer = new IntersectionObserver(observerHandler, {
      rootMargin,
      threshold,
    })

    if (mountDelay) {
      timeoutId = setTimeout(() => {
        observer.observe(element)
      }, mountDelay)
    } else {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [rootMargin, threshold, mountDelay])

  return <div ref={ref} className={className} />
}
