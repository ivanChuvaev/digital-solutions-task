import { type SetStateAction, useCallback, useEffect, useState } from 'react'

export const useQueryParam = (key: string) => {
  const [value, setValue] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get(key)
  })

  const setParam = useCallback(
    (newValue: SetStateAction<string | null>) => {
      const searchParams = new URLSearchParams(window.location.search)

      setValue((prev) => {
        let value: string | null

        if (typeof newValue === 'function') {
          value = newValue(prev)
        } else {
          value = newValue
        }

        if (value === null) {
          searchParams.delete(key)
        } else {
          searchParams.set(key, value)
        }

        window.history.pushState(
          {},
          '',
          window.location.pathname + '?' + searchParams.toString(),
        )

        return value
      })
    },
    [key],
  )

  useEffect(() => {
    const hanlder = () => {
      const searchParams = new URLSearchParams(window.location.search)
      setValue(searchParams.get(key))
    }

    window.addEventListener('popstate', hanlder)
    window.addEventListener('pushstate', hanlder)

    return () => {
      window.removeEventListener('popstate', hanlder)
      window.removeEventListener('pushstate', hanlder)
    }
  }, [key])

  return [value, setParam] as const
}
