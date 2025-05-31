import type { FC } from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { SearchPage } from './components/SearchPage'

const queryClient = new QueryClient()

export const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <main>
        <SearchPage />
      </main>
    </QueryClientProvider>
  )
}
