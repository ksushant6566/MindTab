import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query'
import SuperJSON from 'superjson'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
        gcTime: Infinity,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  })

  if (typeof window !== 'undefined') {
    setTimeout(() => {
    // Persist the query client using local storage
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
    })

    persistQueryClient({
      queryClient: queryClient,
      persister: localStoragePersister,
      maxAge: Infinity,
      dehydrateOptions: {
        serializeData: SuperJSON.serialize,
          shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        },
      })
    },25)
  }

  return queryClient
}
