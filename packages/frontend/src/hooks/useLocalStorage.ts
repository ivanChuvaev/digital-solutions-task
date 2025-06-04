import {
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react'

const STORAGE_EVENT_KEY = 'custom-storage-event'

export const useLocalStorage = <T extends string | null>(
  key: string,
  initialValue: T = null as T,
) => {
  const initialValueRef = useRef(initialValue)
  initialValueRef.current = initialValue

  const [value, setValue] = useState<T>(() => {
    const item = localStorage.getItem(key)
    return (item ? JSON.parse(item) : initialValueRef.current) as T
  })

  const handleSetValue = useCallback(
    (value: SetStateAction<T>) => {
      setValue((prev) => {
        let newValue

        if (typeof value === 'function') {
          newValue = value(prev)
        } else {
          newValue = value
        }

        localStorage.setItem(key, JSON.stringify(newValue))

        window.dispatchEvent(
          new StorageEvent(STORAGE_EVENT_KEY, {
            key,
          }),
        )

        return newValue as T
      })
    },
    [key],
  )

  useEffect(() => {
    const handleStorage = (event: Event) => {
      if ((event as StorageEvent).key !== key) return
      const item = localStorage.getItem(key)
      setValue((item ? JSON.parse(item) : initialValueRef.current) as T)
    }

    window.addEventListener(STORAGE_EVENT_KEY, handleStorage)

    return () => {
      window.removeEventListener(STORAGE_EVENT_KEY, handleStorage)
    }
  }, [key])

  return [value, handleSetValue] as const
}
