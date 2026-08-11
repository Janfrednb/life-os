import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '../components/Layout/Layout';
import { useHabits, useCreateHabit, useDeleteHabit } from '../hooks/useHabits';
import { HabitCard } from '../components/Habits/HabitCard';

export function HabitsPage() {
  const { data: habits, isLoading, isError } = useHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [targetPerWeek, setTargetPerWeek] = useState(7);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createHabit.mutate(
      { name: name.trim(), targetPerWeek },
      {
        onSuccess: () => {
          setName('');
          setTargetPerWeek(7);
          setShowForm(false);
        },
      },
    );
  }

  const completedCount = habits?.filter((h) => h.completedToday).length ?? 0;
  const totalCount = habits?.length ?? 0;

  return (
    <Layout>
    <div className="flex flex-col gap-6">
      {/* Title + summary */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-base">Habitos</h1>
          {totalCount > 0 && (
            <p className="text-sm text-text-muted mt-0.5">
              {completedCount}/{totalCount} completados hoy
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-9 h-9 rounded-xl bg-bg-3 text-text-base flex items-center justify-center text-xl hover:bg-bg-4 transition-colors"
          aria-label="Agregar habito"
        >
          {showForm ? '×' : '+'}
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            onSubmit={handleCreate}
            className="bg-bg-1 border border-bg-3 rounded-2xl p-4 flex flex-col gap-3"
          >
            <input
              className="input-field"
              placeholder="Nombre del habito"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-text-muted shrink-0">Veces/semana</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setTargetPerWeek(n)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                      targetPerWeek === n
                        ? 'bg-green text-bg-0 font-semibold'
                        : 'bg-bg-3 text-text-muted hover:bg-bg-4'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!name.trim() || createHabit.isPending}
              className="py-2.5 rounded-xl bg-green text-bg-0 font-semibold text-sm disabled:opacity-40 transition-opacity"
            >
              {createHabit.isPending ? 'Guardando...' : 'Crear habito'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* States */}
      {isLoading && (
        <div className="text-center text-text-muted py-12 text-sm">Cargando...</div>
      )}
      {isError && (
        <div className="text-center text-danger py-12 text-sm">Error al cargar habitos</div>
      )}

      {/* Habit list */}
      {habits && habits.length === 0 && !showForm && (
        <div className="text-center py-16 flex flex-col gap-2">
          <span className="text-4xl">🌱</span>
          <p className="text-text-muted text-sm">No hay habitos aun.</p>
          <p className="text-text-dim text-xs">Toca + para crear uno.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {habits?.map((habit) => (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              layout
            >
              <div className="relative group">
                <HabitCard habit={habit} />
                <button
                  onClick={() => deleteHabit.mutate(habit.id)}
                  className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-danger text-sm px-1"
                  aria-label="Eliminar habito"
                >
                  ×
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
    </Layout>
  );
}
