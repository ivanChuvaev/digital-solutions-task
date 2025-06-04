export type Person = {
  first_name: string
  last_name: string
  checked: boolean
  avatar: string
  email: string
  index: number
  id: number
}

export type MutationAction =
  | {
      payload: number
      type: 'toggle'
    }
  | {
      payload: [number, number]
      type: 'swap'
    }
  | {
      payload: [number, number]
      type: 'move'
    }

export type SyncStatus = 'error' | 'timeout' | 'pending' | 'synced'
