import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Train, UserPlus } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      toast.success('Registro exitoso. Esperando asignación de línea por el administrador.');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrarse');
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
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.5rem' }} data-testid="register-title">
              Registro
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Crea tu cuenta de emisor de reclamos</p>
          </div>

          <form onSubmit={handleSubmit} data-testid="register-form">
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
                data-testid="register-username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                autoComplete="email"
                data-testid="register-email"
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
                autoComplete="new-password"
                minLength={6}
                data-testid="register-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
                data-testid="register-confirm-password"
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem' }}
              data-testid="register-submit-btn"
            >
              <UserPlus size={18} style={{ display: 'inline', marginRight: '8px' }} />
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
            <span style={{ color: '#64748b' }}>¿Ya tienes cuenta? </span>
            <Link to="/login" style={{ color: '#1e3a5f', fontWeight: '600', textDecoration: 'none' }} data-testid="login-link">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;