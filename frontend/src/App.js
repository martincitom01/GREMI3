import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Dashboard from '@/pages/Dashboard';
import NuevoReclamo from '@/pages/NuevoReclamo';
import Administracion from '@/pages/Administracion';
import DetalleReclamo from '@/pages/DetalleReclamo';
import Estadisticas from '@/pages/Estadisticas';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import GestionUsuarios from '@/pages/GestionUsuarios';
import { Toaster } from '@/components/ui/sonner';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Cargando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Cargando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/nuevo-reclamo" element={<ProtectedRoute><NuevoReclamo /></ProtectedRoute>} />
            <Route path="/administracion" element={<ProtectedRoute><Administracion /></ProtectedRoute>} />
            <Route path="/reclamo/:id" element={<ProtectedRoute><DetalleReclamo /></ProtectedRoute>} />
            <Route path="/estadisticas" element={<ProtectedRoute><Estadisticas /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute adminOnly={true}><GestionUsuarios /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;