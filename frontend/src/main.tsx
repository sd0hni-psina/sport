import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { routeTree } from './routeTree.gen'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
  interface HistoryState {
    from?: string
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster
            position="bottom-right"
            richColors
            toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '13px' } }}
          />
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
)