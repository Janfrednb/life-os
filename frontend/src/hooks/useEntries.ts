import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEntries, createEntry, updateEntry, deleteEntry } from '../lib/api';
import type { Entry, EntryType } from '../types';

export function useEntries(params?: {
  type?: EntryType;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['entries', params],
    queryFn: () => fetchEntries(params),
    staleTime: 30_000,
  });
}

export function useTodayEntries(type: EntryType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  return useQuery({
    queryKey: ['entries', 'today', type],
    queryFn: () =>
      fetchEntries({
        type,
        from: today.toISOString(),
        to: tomorrow.toISOString(),
      }),
    staleTime: 30_000,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createEntry,
    onMutate: async (newEntry) => {
      await qc.cancelQueries({ queryKey: ['entries'] });
      const prevSnapshots = qc.getQueriesData<Entry[]>({ queryKey: ['entries'] });

      const optimistic: Entry = {
        id: `temp-${Date.now()}`,
        ...newEntry,
        metadata: newEntry.metadata ?? null,
        createdAt: new Date().toISOString(),
        userId: '',
      };

      qc.setQueriesData<Entry[]>({ queryKey: ['entries'] }, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );

      return { prevSnapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.prevSnapshots.forEach(([key, data]) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['entries'] });
    },
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; content?: string; metadata?: Record<string, unknown> }) =>
      updateEntry(id, body),
    onSettled: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEntry,
    onSettled: () => qc.invalidateQueries({ queryKey: ['entries'] }),
  });
}
