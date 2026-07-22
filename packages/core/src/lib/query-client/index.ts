/**
 * The single shared React Query client and cache-inspection helpers.
 *
 * All server state for the app lives in {@link AppQueryClient}; mutations
 * reconcile the cache through it. The helpers below let any component observe
 * fetch/mutation state or read cached data without triggering a fetch.
 */
import {
  QueryClient,
  skipToken,
  useIsFetching,
  useMutationState,
  useQuery,
  type MutationKey,
  type QueryKey,
} from '@tanstack/react-query';

/** App-wide QueryClient. One instance, provided once by {@link AppCoreProvider}. */
export const AppQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

/** `true` while any query matching `queryKey` is fetching. */
export const useIsFetchingStatus = (queryKey: QueryKey): boolean =>
  useIsFetching({ queryKey }) > 0;

/**
 * Subscribe to cached data for `queryKey` *without* ever fetching it (uses
 * `skipToken`). Returns `undefined` until some other query populates the entry.
 */
export function useQueryState<T>(queryKey: QueryKey): T | undefined {
  const { data } = useQuery({ queryKey, queryFn: skipToken });
  return data as T | undefined;
}

/** The status of the most recent mutation matching `mutationKey`, if any. */
export function useMutationStatus(
  mutationKey: MutationKey,
): string | undefined {
  const statuses = useMutationState({
    filters: { mutationKey },
    select: (mutation) => mutation.state.status,
  });
  return statuses[statuses.length - 1];
}
