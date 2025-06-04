import { type SetStateAction, useCallback, useMemo } from 'react'
import { useQueryParam } from './useQueryParam'

const parseValue = (value: string | null) => {
  if (!value) return null
  const parsed = parseInt(value)
  return Number.isNaN(parsed) ? null : parsed
}

export const useQueryParamNumber = <T extends number | undefined>(
  key: string,
  defaultValue: T = undefined as T,
) => {
  const [value, setValue] = useQueryParam(key)

  const valueNumber = useMemo(
    () => parseValue(value) ?? defaultValue,
    [value, defaultValue],
  )

  const setValueNumber = useCallback(
    (newValue: SetStateAction<number | null>) => {
      setValue((prev) => {
        let value: number | null

        if (typeof newValue === 'function') {
          value = newValue(parseValue(prev))
        } else {
          value = newValue
        }

        return value?.toString() ?? null
      })
    },
    [setValue],
  )

  return [valueNumber, setValueNumber] as const
}
