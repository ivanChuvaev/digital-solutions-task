export type Person = {
  id: number
  avatar: string
  first_name: string
  last_name: string
  email: string
  phone: string
  checked: boolean
}

export type MutationAction =
  | {
      type: 'toggle'
      payload: [number, boolean]
    }
  | {
      type: 'swap'
      payload: [number, number]
    }

  
export type SyncStatus = 'error' | 'timeout' | 'pending' | 'synced'
