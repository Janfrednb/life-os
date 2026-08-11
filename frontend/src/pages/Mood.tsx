import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout/Layout';
import { useEntries } from '../hooks/useEntries';
import { MoodChart } from '../components/Mood/MoodChart';
import { fetchMoodSuggestion } from '../lib/api';
import type { MoodMeta } from '../types';

const MOOD_LABEL: Record<number, string> = {
  1: 'Muy bajo', 2: 'Bajo', 3: 'Neutral', 4: 'Bueno', 5: 'Excelente',
};
const MOOD_COLOR: Record<number, string> = {
  1: 'text-danger', 2: 'text-warn', 3: 'text-text-muted', 4: 'text-green-dim', 5: 'text-green',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function MoodPage() {
  const { data: entries, isLoading } = useEntries({ type: 'MOOD' });

  const { data: suggestion } = useQuery({
    queryKey: ['mood-suggestion'],
    queryFn: fetchMoodSuggestion,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const recent = entries?.slice(0, 7) ?? [];

  // Promedio últimos 7 días
  const avgMood = recent.length
    ? Math.round(
        recent.reduce((acc, e) => {
          const m = e.metadata as MoodMeta | null;
          return acc + (m?.escalaAnimo ?? 3);
        }, 0) / recent.length,
      )
    : null;

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-base">Estado de animo</h1>
          {avgMood !== null && (
            <span className={`text-sm font-medium ${MOOD_COLOR[avgMood] ?? 'text-text-muted'}`}>
              {MOOD_LABEL[avgMood]} (prom. 7d)
            </span>
          )}
        </div>

        {/* Sugerencia de Claude */}
        {suggestion?.suggestion && (
          <div className={`bg-bg-1 border rounded-2xl p-4 flex flex-col gap-2 ${suggestion.isStreak ? 'border-green/30' : 'border-bg-3'}`}>
            <div className="flex items-center gap-2 text-xs text-text-dim uppercase tracking-widest">
              <span>{suggestion.isStreak ? '🔥' : '💡'}</span>
              <span>Sugerencia</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">{suggestion.suggestion}</p>
          </div>
        )}

        {/* Grafico */}
        <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4">
          <h2 className="text-xs text-text-dim uppercase tracking-widest mb-4">Ultimos 30 dias</h2>
          {isLoading ? (
            <div className="text-center py-8 text-text-muted text-sm">Cargando...</div>
          ) : (
            <MoodChart entries={entries ?? []} />
          )}
        </div>

        {/* Lista reciente */}
        {recent.length === 0 && !isLoading && (
          <div className="text-center py-12 flex flex-col gap-2">
            <span className="text-4xl">😶</span>
            <p className="text-text-muted text-sm">Sin registros de animo aun.</p>
            <p className="text-text-dim text-xs">Usa el + para registrar como te sientes.</p>
          </div>
        )}

        {recent.length > 0 && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xs text-text-dim uppercase tracking-widest">Recientes</h2>
            {recent.map((e) => {
              const m = e.metadata as MoodMeta | null;
              const val = m?.escalaAnimo ?? 3;
              return (
                <div key={e.id} className="bg-bg-1 border border-bg-3 rounded-xl px-4 py-3 flex items-start gap-3">
                  <div className={`text-lg font-bold shrink-0 tabular-nums ${MOOD_COLOR[val] ?? 'text-text-muted'}`}>
                    {val}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${MOOD_COLOR[val] ?? 'text-text-muted'}`}>
                      {MOOD_LABEL[val]}
                    </div>
                    {e.content && (
                      <div className="text-xs text-text-muted mt-0.5 truncate">{e.content}</div>
                    )}
                  </div>
                  <div className="text-xs text-text-dim shrink-0">{formatDate(e.createdAt)}</div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </Layout>
  );
}
