import type { SyncStatus } from '../../types'

export const translateSyncStatus = (status: SyncStatus) => {
  switch (status) {
    case 'error':
      return 'ERROR'
    case 'timeout':
      return 'WAITING'
    case 'pending':
      return 'PENDING'
    case 'synced':
      return 'SYNCED'
    default:
      return 'UNKNOWN'
  }
}
