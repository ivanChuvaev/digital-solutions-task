export type Person = {
  first_name: string
  last_name: string
  checked: boolean
  avatar: string
  email: string
  phone: string
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
