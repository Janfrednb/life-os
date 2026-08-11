import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { Entry, DeudaMeta } from '../../types';
import { useUpdateEntry, useDeleteEntry } from '../../hooks/useEntries';
import { CircularProgress } from './CircularProgress';

interface Props {
  entry: Entry;
}

function fmt(n: number) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function daysLeft(fechaLimite: string | null | undefined): number | null {
  if (!fechaLimite) return null;
  const diff = new Date(fechaLimite).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function DebtCard({ entry }: Props) {
  const meta = entry.metadata as DeudaMeta | null;
  if (!meta) return null;

  const { monto, acreedor, montoPagado, fechaLimite, moneda } = meta;
  const paid = montoPagado >= monto;
  const percent = monto > 0 ? (montoPagado / monto) * 100 : 0;
  const remaining = Math.max(0, monto - montoPagado);
  const curr = moneda ?? 'COP';

  const [pagoStr, setPagoStr] = useState('');
  const [showPago, setShowPago] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();

  function triggerConfetti() {
    const rect = btnRef.current?.getBoundingClientRect();
    const x = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const y = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.5;
    confetti({ particleCount: 120, spread: 70, origin: { x, y }, colors: ['#22c55e', '#4ade80', '#86efac', '#f59e0b'] });
  }

  function handlePago(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(pagoStr);
    if (!amount || amount <= 0) return;

    const newPagado = Math.min(monto, montoPagado + amount);
    const willBePaid = newPagado >= monto;

    updateEntry.mutate(
      {
        id: entry.id,
        metadata: { ...meta, montoPagado: newPagado },
      },
      {
        onSuccess: () => {
          setPagoStr('');
          setShowPago(false);
          if (willBePaid) triggerConfetti();
        },
      },
    );
  }

  const days = daysLeft(fechaLimite);

  return (
    <div className={`bg-bg-1 border rounded-2xl p-4 flex flex-col gap-3 transition-colors ${paid ? 'border-green/30' : 'border-bg-3'}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Circle */}
        <div className="relative shrink-0 flex items-center justify-center">
          <CircularProgress percent={percent} paid={paid} />
          <span className="absolute text-[11px] font-semibold text-text-base" style={{ transform: 'none' }}>
            {Math.round(percent)}%
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-base truncate">{acreedor}</span>
            {paid && (
              <span className="text-[10px] bg-green/20 text-green px-2 py-0.5 rounded-full font-medium shrink-0">
                Pagado
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-text-muted space-y-0.5">
            <div>
              <span className="text-text-base font-mono">{fmt(montoPagado)}</span>
              <span className="text-text-dim"> / {fmt(monto)} {curr}</span>
            </div>
            {!paid && (
              <div className="text-text-dim">
                Pendiente: <span className="font-mono text-warn">{fmt(remaining)} {curr}</span>
              </div>
            )}
            {days !== null && !paid && (
              <div className={days < 0 ? 'text-danger' : days <= 7 ? 'text-warn' : 'text-text-dim'}>
                {days < 0 ? `Vencida hace ${-days}d` : days === 0 ? 'Vence hoy' : `${days}d restantes`}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 shrink-0">
          {!paid && (
            <button
              ref={btnRef}
              onClick={() => setShowPago((v) => !v)}
              className="text-xs bg-bg-3 hover:bg-bg-4 text-text-muted px-2.5 py-1 rounded-lg transition-colors"
            >
              {showPago ? 'Cancelar' : 'Pagar'}
            </button>
          )}
          <button
            onClick={() => deleteEntry.mutate(entry.id)}
            className="text-xs text-text-dim hover:text-danger px-2.5 py-1 rounded-lg transition-colors"
          >
            Borrar
          </button>
        </div>
      </div>

      {/* Payment form */}
      {showPago && (
        <motion.form
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handlePago}
          className="flex gap-2"
        >
          <input
            type="number"
            value={pagoStr}
            onChange={(e) => setPagoStr(e.target.value)}
            placeholder={`Monto a pagar (max ${fmt(remaining)})`}
            className="flex-1 input-field font-mono text-sm"
            autoFocus
            min={1}
            max={remaining}
          />
          <button
            type="submit"
            disabled={!pagoStr || updateEntry.isPending}
            className="bg-green text-bg-0 px-4 rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            OK
          </button>
        </motion.form>
      )}
    </div>
  );
}
