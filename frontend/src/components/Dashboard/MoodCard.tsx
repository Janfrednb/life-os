import { motion } from 'framer-motion';
import { useTodayEntries } from '../../hooks/useEntries';
import { useQuery } from '@tanstack/react-query';
import { fetchMoodSuggestion } from '../../lib/api';
import type { MoodMeta } from '../../types';

const MOOD_MAP: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😞', label: 'Muy bajo', color: '#ef4444' },
  2: { emoji: '😟', label: 'Bajo', color: '#f59e0b' },
  3: { emoji: '😐', label: 'Regular', color: '#6b8f6b' },
  4: { emoji: '😊', label: 'Bien', color: '#22c55e' },
  5: { emoji: '😄', label: 'Excelente', color: '#4ade80' },
};

export function MoodCard() {
  const { data: entries, isLoading } = useTodayEntries('MOOD');
  const todayMood = entries?.[0] ?? null;
  const moodValue = todayMood
    ? ((todayMood.metadata as MoodMeta | null)?.escalaAnimo ?? null)
    : null;

  const isLowMood = moodValue !== null && moodValue <= 2;

  const { data: suggestion, isLoading: loadingSuggestion } = useQuery({
    queryKey: ['moodSuggestion'],
    queryFn: fetchMoodSuggestion,
    enabled: isLowMood,
    staleTime: 60_000 * 5,
  });

  if (isLoading) {
    return <CardShell><Skeleton /></CardShell>;
  }

  return (
    <CardShell>
      {todayMood && moodValue !== null ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-4xl"
            >
              {MOOD_MAP[moodValue]?.emoji ?? '😐'}
            </motion.span>
            <div>
              <p className="text-text-base font-semibold">{MOOD_MAP[moodValue]?.label}</p>
              <p className="text-text-muted text-xs font-mono">{moodValue}/5 hoy</p>
            </div>
            <div
              className="ml-auto w-2 h-8 rounded-full"
              style={{ backgroundColor: MOOD_MAP[moodValue]?.color }}
            />
          </div>

          {todayMood.content && (
            <p className="text-text-muted text-sm italic">"{todayMood.content}"</p>
          )}

          {isLowMood && (
            <div className="bg-bg-2 rounded-xl p-3 border border-bg-3">
              {loadingSuggestion ? (
                <p className="text-text-muted text-xs">Generando sugerencia...</p>
              ) : suggestion?.suggestion ? (
                <>
                  {suggestion.isStreak && (
                    <p className="text-warn text-xs mb-1 font-medium">
                      Llevas varios dias con ánimo bajo.
                    </p>
                  )}
                  <p className="text-text-muted text-xs leading-relaxed">
                    {suggestion.suggestion}
                  </p>
                  <p className="text-text-dim text-xs mt-2">
                    No es terapia, es un recordatorio amable.
                  </p>
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 text-text-muted">
          <span className="text-3xl opacity-40">🎭</span>
          <p className="text-sm">No registraste tu ánimo hoy. Usa el botón + para hacerlo.</p>
        </div>
      )}
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4">
      <p className="text-text-dim text-xs font-mono uppercase tracking-widest mb-3">
        estado de ánimo
      </p>
      {children}
    </div>
  );
}

function Skeleton() {
  return <div className="h-12 bg-bg-2 rounded-xl animate-pulse" />;
}
