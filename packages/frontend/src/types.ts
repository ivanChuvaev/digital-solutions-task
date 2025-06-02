export type Person = {
  checked: boolean
  id: number
}

export type MutationAction =
  | {
      payload: [number, boolean]
      type: 'toggle'
    }
  | {
      payload: [number, number]
      type: 'swap'
    }

export type SyncStatus = 'error' | 'timeout' | 'pending' | 'synced'
