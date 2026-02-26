import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TalangPage from './pages/TalangPage';
import SensorPage from './pages/SensorPage';
import HarvestPage from './pages/HarvestPage';
import AlertPage from './pages/AlertPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greenhouse-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="talang" element={<TalangPage />} />
        <Route path="sensor" element={<SensorPage />} />
        <Route path="harvest" element={<HarvestPage />} />
        <Route path="alert" element={<AlertPage />} />
        <Route path="talang/:id" element={<div>Talang Detail Page - Coming Soon</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
