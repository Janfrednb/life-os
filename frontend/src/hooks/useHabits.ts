import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHabits, createHabit, completeHabit, uncompleteHabit, deleteHabit } from '../lib/api';
import type { Habit } from '../types';

export function useHabits() {
  return useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    staleTime: 30_000,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHabit,
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useToggleHabit() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completedToday }: { id: string; completedToday: boolean }) =>
      completedToday ? uncompleteHabit(id) : completeHabit(id),
    onMutate: async ({ id, completedToday }) => {
      await qc.cancelQueries({ queryKey: ['habits'] });
      const prev = qc.getQueryData<Habit[]>(['habits']);

      qc.setQueryData<Habit[]>(['habits'], (old) =>
        old?.map((h) =>
          h.id === id
            ? {
                ...h,
                completedToday: !completedToday,
                streak: !completedToday ? h.streak + 1 : Math.max(0, h.streak - 1),
                maxStreak: !completedToday
                  ? Math.max(h.maxStreak, h.streak + 1)
                  : h.maxStreak,
              }
            : h,
        ),
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['habits'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}
