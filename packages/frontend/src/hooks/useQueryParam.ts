import { useCallback, useEffect, useState } from 'react'

export const useQueryParam = (key: string) => {
  const [value, setValue] = useState<string | null>(() => {
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get(key)
  })

  const setParam = useCallback(
    (newValue: string) => {
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set(key, newValue)
      window.history.pushState(
        {},
        '',
        window.location.pathname + '?' + searchParams.toString(),
      )
      setValue(newValue)
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
