import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { DashboardPage } from './pages/Dashboard';
import { HabitsPage } from './pages/Habits';
import { FinancesPage } from './pages/Finances';
import { MoodPage } from './pages/Mood';
import { KanbanPage } from './pages/Kanban';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/habits"
        element={
          <PrivateRoute>
            <HabitsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/finances"
        element={
          <PrivateRoute>
            <FinancesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/mood"
        element={
          <PrivateRoute>
            <MoodPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/kanban"
        element={
          <PrivateRoute>
            <KanbanPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
