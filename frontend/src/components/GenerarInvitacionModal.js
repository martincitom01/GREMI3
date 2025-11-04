import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LINEAS = ['A', 'B', 'C', 'D', 'E', 'H', 'Premetro'];

const GenerarInvitacionModal = ({ isOpen, onClose, onSuccess, getAuthHeaders }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    linea_asignada: ''
  });
  const [generating, setGenerating] = useState(false);
  const [invitationLink, setInvitationLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API}/invitations/create`, formData, {
        headers: getAuthHeaders()
      });
      setInvitationLink(response.data.invitation_link);
      toast.success('Link de invitación generado exitosamente');
    } catch (error) {
      console.error('Error generando invitación:', error);
      toast.error(error.response?.data?.detail || 'Error al generar invitación');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setFormData({ username: '', email: '', password: '', linea_asignada: '' });
    setInvitationLink(null);
    setCopied(false);
    onClose();
    if (invitationLink) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }} onClick={handleClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a5f', margin: 0 }}>
            {invitationLink ? '¡Link Generado!' : 'Generar Link de Invitación'}
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: '#64748b'
            }}
            data-testid="close-modal-btn"
          >
            <X size={24} />
          </button>
        </div>

        {!invitationLink ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="inv-username">Usuario *</label>
              <input
                id="inv-username"
                type="text"
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
                data-testid="inv-username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-email">Email *</label>
              <input
                id="inv-email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                data-testid="inv-email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-password">Contraseña * (mínimo 6 caracteres)</label>
              <input
                id="inv-password"
                type="text"
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
                data-testid="inv-password"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="inv-linea">Línea Asignada</label>
              <select
                id="inv-linea"
                className="form-select"
                value={formData.linea_asignada}
                onChange={(e) => setFormData({...formData, linea_asignada: e.target.value})}
                data-testid="inv-linea"
              >
                <option value="">Sin asignar (puede asignarse después)</option>
                {LINEAS.map(linea => (
                  <option key={linea} value={linea}>Línea {linea}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn-secondary" onClick={handleClose} style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={generating} style={{ flex: 1 }} data-testid="generate-link-btn">
                {generating ? 'Generando...' : 'Generar Link'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '2px solid #10b981', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '1rem', color: '#065f46', marginBottom: '1rem', fontWeight: '600' }}>
                ✓ Link de invitación generado para <strong>{formData.username}</strong>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#047857', marginBottom: '0' }}>
                Copia y comparte este link con el emisor. El link expira en 7 días.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Link de Invitación</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={invitationLink}
                  readOnly
                  style={{ paddingRight: '3rem', fontFamily: 'monospace', fontSize: '0.9rem' }}
                  data-testid="invitation-link"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: copied ? '#10b981' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  data-testid="copy-link-btn"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #fbbf24' }}>
              <p style={{ fontSize: '0.85rem', color: '#92400e', margin: 0 }}>
                <strong>Credenciales del usuario:</strong><br/>
                Usuario: <code style={{ background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{formData.username}</code><br/>
                Contraseña: <code style={{ background: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{formData.password}</code>
              </p>
            </div>

            <button className="btn-primary" onClick={handleClose} style={{ width: '100%' }} data-testid="close-success-btn">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerarInvitacionModal;