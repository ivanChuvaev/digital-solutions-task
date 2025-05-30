import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type FC } from 'react'
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
