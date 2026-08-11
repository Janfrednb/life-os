import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { QuickCapture } from '../FAB/QuickCapture';

interface Props {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: 'Hoy', icon: '◈' },
  { to: '/habits', label: 'Habitos', icon: '◉' },
  { to: '/finances', label: 'Finanzas', icon: '◎' },
  { to: '/mood', label: 'Animo', icon: '◌' },
  { to: '/kanban', label: 'Trabajo', icon: '◍' },
];

export function Layout({ children }: Props) {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-bg-0 text-text-base font-sans">
      {/* Top Nav */}
      <nav className="sticky top-0 z-20 bg-bg-0/90 backdrop-blur border-b border-bg-2">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green font-mono font-semibold text-lg tracking-tight">
              life<span className="text-text-dim">.</span>os
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-text-muted text-sm hidden sm:block">{user?.name}</span>
            <button
              onClick={logout}
              className="text-text-dim text-xs hover:text-text-muted transition-colors border border-bg-3 rounded-lg px-2.5 py-1"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-36">{children}</main>

      {/* FAB */}
      <QuickCapture />

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-bg-0/95 backdrop-blur border-t border-bg-2">
        <div className="max-w-2xl mx-auto flex">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs transition-colors ${
                  isActive ? 'text-green' : 'text-text-dim hover:text-text-muted'
                }`
              }
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
