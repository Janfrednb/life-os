import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits, useToggleHabit, useCreateHabit } from '../../hooks/useHabits';

export function HabitsCard() {
  const { data: habits, isLoading } = useHabits();
  const { mutate: toggle } = useToggleHabit();
  const { mutate: createHabit, isPending: creating } = useCreateHabit();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  if (isLoading) {
    return (
      <CardShell>
        <Skeleton />
      </CardShell>
    );
  }

  function submitNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createHabit({ name: newName.trim() }, {
      onSuccess: () => { setNewName(''); setAdding(false); },
    });
  }

  const safeHabits = habits ?? [];
  const done = safeHabits.filter((h) => h.completedToday).length;

  return (
    <CardShell>
      <div className="flex items-center justify-between mb-3">
        <p className="text-text-muted text-xs font-mono">
          {safeHabits.length > 0 ? `${done}/${safeHabits.length} hoy` : 'Sin hábitos'}
        </p>
        {done === safeHabits.length && safeHabits.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs text-green font-medium"
          >
            ✓ Todo hecho
          </motion.span>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {safeHabits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() =>
                  toggle({ id: habit.id, completedToday: habit.completedToday })
                }
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  habit.completedToday
                    ? 'bg-green border-green'
                    : 'border-bg-4 hover:border-green-dim'
                }`}
              >
                {habit.completedToday && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-bg-0 text-xs font-bold"
                  >
                    ✓
                  </motion.span>
                )}
              </button>

              <span
                className={`flex-1 text-sm transition-colors ${
                  habit.completedToday ? 'text-text-muted line-through' : 'text-text-base'
                }`}
              >
                {habit.name}
              </span>

              {habit.streak > 0 && (
                <span className="text-xs font-mono text-green-dim">
                  🔥{habit.streak}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Formulario inline para nuevo hábito */}
      <AnimatePresence>
        {adding ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitNew}
            className="mt-3 flex gap-2 overflow-hidden"
          >
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre del hábito"
              className="flex-1 input-field py-1.5 text-sm"
            />
            <button
              type="submit"
              disabled={creating}
              className="px-3 py-1.5 rounded-lg bg-green text-bg-0 text-xs font-semibold disabled:opacity-50"
            >
              {creating ? '...' : 'OK'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setNewName(''); }}
              className="px-2 py-1.5 rounded-lg border border-bg-3 text-text-muted text-xs"
            >
              ×
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="add-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setAdding(true)}
            className="mt-3 w-full text-xs text-text-dim hover:text-text-muted transition-colors text-left"
          >
            + Nuevo hábito
          </motion.button>
        )}
      </AnimatePresence>
    </CardShell>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-1 border border-bg-3 rounded-2xl p-4">
      <p className="text-text-dim text-xs font-mono uppercase tracking-widest mb-3">
        hábitos
      </p>
      {children}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-6 bg-bg-2 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}
