import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Train, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success('Inicio de sesión exitoso');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
      <div style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 8px 20px rgba(30, 58, 95, 0.3)' }}>
              <Train size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.5rem' }} data-testid="login-title">
              Sistema UTA
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Reclamos Gremiales</p>
          </div>

          <form onSubmit={handleSubmit} data-testid="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                autoComplete="username"
                data-testid="login-username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="current-password"
                data-testid="login-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
              data-testid="login-submit-btn"
            >
              <LogIn size={18} style={{ display: 'inline', marginRight: '8px' }} />
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
            <span style={{ color: '#64748b' }}>¿No tienes cuenta? </span>
            <Link to="/register" style={{ color: '#1e3a5f', fontWeight: '600', textDecoration: 'none' }} data-testid="register-link">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;