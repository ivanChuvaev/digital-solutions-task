/* eslint-disable @typescript-eslint/no-explicit-any */

type DebounceOptions = {
  leading?: boolean
}

export function debounce<P extends any[], T extends (...args: P) => void>(
  func: T,
  wait: number,
  options: DebounceOptions = {},
): (...args: P) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let pendingTimeoutId: ReturnType<typeof setTimeout> | undefined
  let lastArgs: P | undefined

  const { leading = false } = options

  function invokeFunc() {
    const args = lastArgs!
    lastArgs = undefined
    func(...args)
  }

  function cancelTimer() {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  function debounced(...args: P) {
    lastArgs = args

    if (leading) {
      if (pendingTimeoutId === undefined && timeoutId === undefined) {
        invokeFunc()
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = undefined
        }, wait)
        return
      }

      cancelTimer()

      timeoutId = setTimeout(() => {
        invokeFunc()
        timeoutId = undefined
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = undefined
        }, wait)
      }, wait)

      return
    }

    cancelTimer()

    timeoutId = setTimeout(() => {
      invokeFunc()
      timeoutId = undefined
    }, wait)
  }

  debounced.cancel = function () {
    cancelTimer()
    lastArgs = undefined
  }

  return debounced
}
