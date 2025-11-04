import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Train, CheckCircle, Clock, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AceptarInvitacion = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const response = await axios.get(`${API}/invitations/${token}`);
      setInvitation(response.data);
      // Save credentials for later display
      setCredentials({
        username: response.data.username,
        email: response.data.email,
        linea: response.data.linea_asignada
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Invitación no válida o expirada');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await axios.post(`${API}/invitations/${token}/accept`);
      setAccepted(true);
      toast.success('¡Cuenta activada exitosamente!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al activar la cuenta');
      setAccepting(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/emisor-login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
        <div style={{ fontSize: '1.2rem', color: '#64748b' }}>Cargando invitación...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
        <div style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2rem' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#dc2626', marginBottom: '1rem' }}>Invitación No Válida</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/emisor-login')}>
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)' }}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%)', borderRadius: '16px', marginBottom: '1rem', boxShadow: '0 8px 20px rgba(30, 58, 95, 0.3)' }}>
              <Train size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.5rem' }}>
              Invitación Recibida
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>Sistema de Reclamos Gremiales UTA</p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', border: '2px solid #3b82f6' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e40af', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={24} />
              Detalles de tu Cuenta
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <UserIcon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Usuario</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', fontFamily: 'monospace' }}>
                    {invitation.username}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Mail size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Email</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                    {invitation.email}
                  </div>
                </div>
              </div>

              {invitation.linea_asignada && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                    <Train size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>Línea Asignada</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b' }}>
                      Línea {invitation.linea_asignada}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', border: '2px solid #fbbf24' }}>
            <p style={{ fontSize: '0.9rem', color: '#92400e', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} />
              <span>Esta invitación expira en 7 días</span>
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={handleAccept}
            disabled={accepting}
            style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            data-testid="accept-invitation-btn"
          >
            {accepting ? 'Activando cuenta...' : '✓ Aceptar Invitación y Activar Cuenta'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem' }}>
            Al aceptar, podrás acceder al sistema con tus credenciales
          </p>
        </div>
      </div>
    </div>
  );
};

export default AceptarInvitacion;