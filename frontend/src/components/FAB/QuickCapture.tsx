import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TypeSelector } from './TypeSelector';
import { MoodSlider, getMoodBg } from './MoodSlider';
import { useCreateEntry } from '../../hooks/useEntries';
import type { EntryType, Priority } from '../../types';

const FIELD_LABELS: Partial<Record<EntryType, string>> = {
  MOOD: 'Nota opcional (¿qué pasó hoy?)',
  DEUDA: 'Descripción de la deuda',
  PAGO: 'Descripción del pago',
  PENDIENTE_TRABAJO: 'Nombre de la tarea',
  ENTRENO: 'Notas del entreno (opcional)',
  NOTA_LIBRE: 'Escribe lo que quieras...',
};

interface FormState {
  content: string;
  moodValue: number;
  monto: string;
  acreedor: string;
  fechaLimite: string;
  cliente: string;
  prioridad: Priority;
  tipoEntreno: string;
  duracionMin: string;
}

const defaultForm: FormState = {
  content: '',
  moodValue: 3,
  monto: '',
  acreedor: '',
  fechaLimite: '',
  cliente: '',
  prioridad: 'media',
  tipoEntreno: '',
  duracionMin: '',
};

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EntryType | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saved, setSaved] = useState(false);

  const { mutate: createEntry, isPending } = useCreateEntry();

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function buildMetadata(): Record<string, unknown> | undefined {
    switch (type) {
      case 'MOOD':
        return { escalaAnimo: form.moodValue };
      case 'DEUDA':
        return {
          monto: parseFloat(form.monto) || 0,
          acreedor: form.acreedor,
          fechaLimite: form.fechaLimite || null,
          montoPagado: 0,
        };
      case 'PAGO':
        return { monto: parseFloat(form.monto) || 0 };
      case 'PENDIENTE_TRABAJO':
        return {
          estado: 'TODO',
          cliente: form.cliente || null,
          prioridad: form.prioridad,
          fechaLimite: form.fechaLimite || null,
        };
      case 'ENTRENO':
        return {
          tipo: form.tipoEntreno || null,
          duracionMin: form.duracionMin ? parseInt(form.duracionMin, 10) : null,
        };
      default:
        return undefined;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;

    const needsContent = type !== 'MOOD' && type !== 'ENTRENO';
    if (needsContent && !form.content.trim()) return;

    createEntry(
      {
        type,
        content: form.content.trim(),
        metadata: buildMetadata(),
      },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            setOpen(false);
            setType(null);
            setForm(defaultForm);
          }, 900);
        },
      },
    );
  }

  const moodBg = type === 'MOOD' ? getMoodBg(form.moodValue) : undefined;

  return (
    <>
      {/* Overlay de fondo cuando MOOD activo */}
      <AnimatePresence>
        {open && type === 'MOOD' && (
          <motion.div
            key="mood-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: moodBg }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 pointer-events-none z-30"
          />
        )}
      </AnimatePresence>

      {/* Overlay para cerrar */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setOpen(false);
              setType(null);
              setForm(defaultForm);
            }}
          />
        )}
      </AnimatePresence>

      {/* Panel de captura */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto"
          >
            <form
              onSubmit={handleSubmit}
              className="bg-bg-1 border border-bg-3 rounded-t-2xl p-5 space-y-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-text-base font-semibold text-base">Captura rápida</h2>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setType(null);
                    setForm(defaultForm);
                  }}
                  className="text-text-muted hover:text-text-base transition-colors text-xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Selector de tipo */}
              <TypeSelector selected={type} onSelect={setType} />

              {/* Campos condicionales */}
              <AnimatePresence mode="wait">
                {type && (
                  <motion.div
                    key={type}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {type === 'MOOD' && (
                      <MoodSlider
                        value={form.moodValue}
                        onChange={(v) => set('moodValue', v)}
                      />
                    )}

                    {/* Campo de contenido principal */}
                    <textarea
                      value={form.content}
                      onChange={(e) => set('content', e.target.value)}
                      placeholder={FIELD_LABELS[type] ?? 'Descripción...'}
                      rows={type === 'NOTA_LIBRE' ? 4 : 2}
                      className="w-full bg-bg-2 border border-bg-3 rounded-xl px-3 py-2.5 text-sm text-text-base placeholder:text-text-dim focus:outline-none focus:border-green-dim resize-none transition-colors"
                    />

                    {/* Campos extra por tipo */}
                    {(type === 'DEUDA' || type === 'PAGO') && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={form.monto}
                          onChange={(e) => set('monto', e.target.value)}
                          placeholder="Monto"
                          className="flex-1 input-field font-mono"
                          required
                        />
                        {type === 'DEUDA' && (
                          <input
                            type="text"
                            value={form.acreedor}
                            onChange={(e) => set('acreedor', e.target.value)}
                            placeholder="Acreedor"
                            className="flex-1 input-field"
                          />
                        )}
                      </div>
                    )}

                    {(type === 'DEUDA' || type === 'PENDIENTE_TRABAJO') && (
                      <input
                        type="date"
                        value={form.fechaLimite}
                        onChange={(e) => set('fechaLimite', e.target.value)}
                        placeholder="Fecha límite"
                        className="w-full input-field"
                      />
                    )}

                    {type === 'PENDIENTE_TRABAJO' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.cliente}
                          onChange={(e) => set('cliente', e.target.value)}
                          placeholder="Cliente (opcional)"
                          className="flex-1 input-field"
                        />
                        <select
                          value={form.prioridad}
                          onChange={(e) => set('prioridad', e.target.value as Priority)}
                          className="input-field"
                        >
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </div>
                    )}

                    {type === 'ENTRENO' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={form.tipoEntreno}
                          onChange={(e) => set('tipoEntreno', e.target.value)}
                          placeholder="Tipo (Pesas, Cardio...)"
                          className="flex-1 input-field"
                        />
                        <input
                          type="number"
                          value={form.duracionMin}
                          onChange={(e) => set('duracionMin', e.target.value)}
                          placeholder="Min"
                          className="w-20 input-field font-mono"
                        />
                      </div>
                    )}

                    {/* Botón guardar */}
                    <button
                      type="submit"
                      disabled={isPending || saved}
                      className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        saved
                          ? 'bg-green text-bg-0'
                          : 'bg-green text-bg-0 hover:bg-green-glow disabled:opacity-50'
                      }`}
                    >
                      {saved ? '✓ Guardado' : isPending ? 'Guardando...' : 'Guardar'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-green text-bg-0 shadow-lg shadow-green/30 flex items-center justify-center text-2xl font-light transition-shadow hover:shadow-green/50"
        aria-label="Captura rápida"
      >
        +
      </motion.button>
    </>
  );
}
