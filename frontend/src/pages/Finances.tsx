import { Layout } from '../components/Layout/Layout';
import { useEntries } from '../hooks/useEntries';
import { DebtCard } from '../components/Finances/DebtCard';
import type { DeudaMeta } from '../types';

function fmt(n: number) {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function FinancesPage() {
  const { data: debts, isLoading, isError } = useEntries({ type: 'DEUDA' });

  const totals = debts?.reduce(
    (acc, e) => {
      const m = e.metadata as DeudaMeta | null;
      if (!m) return acc;
      return {
        total: acc.total + m.monto,
        pagado: acc.pagado + m.montoPagado,
      };
    },
    { total: 0, pagado: 0 },
  ) ?? { total: 0, pagado: 0 };

  const pendiente = Math.max(0, totals.total - totals.pagado);
  const pendientes = debts?.filter((e) => {
    const m = e.metadata as DeudaMeta | null;
    return m && m.montoPagado < m.monto;
  });
  const pagadas = debts?.filter((e) => {
    const m = e.metadata as DeudaMeta | null;
    return m && m.montoPagado >= m.monto;
  });

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        {/* Title */}
        <h1 className="text-xl font-semibold text-text-base">Finanzas</h1>

        {/* Summary */}
        {debts && debts.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg-1 border border-bg-3 rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-text-dim uppercase tracking-wider">Total deuda</span>
              <span className="font-mono text-sm text-text-base font-semibold">{fmt(totals.total)}</span>
            </div>
            <div className="bg-bg-1 border border-bg-3 rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-text-dim uppercase tracking-wider">Pagado</span>
              <span className="font-mono text-sm text-green font-semibold">{fmt(totals.pagado)}</span>
            </div>
            <div className="bg-bg-1 border border-bg-3 rounded-2xl p-3 flex flex-col gap-1">
              <span className="text-[10px] text-text-dim uppercase tracking-wider">Pendiente</span>
              <span className="font-mono text-sm text-warn font-semibold">{fmt(pendiente)}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-text-muted py-12 text-sm">Cargando...</div>
        )}
        {isError && (
          <div className="text-center text-danger py-12 text-sm">Error al cargar deudas</div>
        )}

        {debts && debts.length === 0 && (
          <div className="text-center py-16 flex flex-col gap-2">
            <span className="text-4xl">💰</span>
            <p className="text-text-muted text-sm">Sin deudas registradas.</p>
            <p className="text-text-dim text-xs">Usa el + para registrar una deuda.</p>
          </div>
        )}

        {/* Pendientes */}
        {pendientes && pendientes.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs text-text-dim uppercase tracking-widest">Pendientes</h2>
            {pendientes.map((e) => <DebtCard key={e.id} entry={e} />)}
          </section>
        )}

        {/* Pagadas */}
        {pagadas && pagadas.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xs text-text-dim uppercase tracking-widest">Pagadas</h2>
            {pagadas.map((e) => <DebtCard key={e.id} entry={e} />)}
          </section>
        )}
      </div>
    </Layout>
  );
}
