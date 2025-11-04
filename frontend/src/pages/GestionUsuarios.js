import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Users, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LINEAS = ['A', 'B', 'C', 'D', 'E', 'H', 'Premetro'];

const GestionUsuarios = () => {
  const navigate = useNavigate();
  const { getAuthHeaders, user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await axios.get(`${API}/users`, {
        headers: getAuthHeaders()
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${API}/users/create`, formData, {
        headers: getAuthHeaders()
      });
      
      // Show success message with credentials
      const credentialsMessage = `
Usuario creado exitosamente:
━━━━━━━━━━━━━━━━━━━━
👤 Usuario: ${formData.username}
🔑 Contraseña: ${formData.password}
━━━━━━━━━━━━━━━━━━━━
⚠️ Guarda estas credenciales y compártelas con el usuario de forma segura.
      `;
      
      // Create a custom alert/modal
      alert(credentialsMessage);
      toast.success(`Usuario ${formData.username} creado exitosamente`);
      
      setFormData({ username: '', email: '', password: '' });
      setShowCreateForm(false);
      cargarUsuarios();
    } catch (error) {
      console.error('Error creando usuario:', error);
      toast.error(error.response?.data?.detail || 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`¿Está seguro de eliminar al usuario ${username}?`)) {
      return;
    }

    try {
      await axios.delete(`${API}/users/${userId}`, {
        headers: getAuthHeaders()
      });
      toast.success('Usuario eliminado');
      cargarUsuarios();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error(error.response?.data?.detail || 'Error al eliminar usuario');
    }
  };

  const asignarLinea = async (userId, linea) => {
    try {
      await axios.patch(`${API}/users/${userId}/assign-line?linea=${linea}`, {}, {
        headers: getAuthHeaders()
      });
      toast.success(`Línea ${linea} asignada correctamente`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error asignando línea:', error);
      toast.error('Error al asignar línea');
    }
  };

  const cambiarRol = async (userId, nuevoRol) => {
    try {
      await axios.patch(`${API}/users/${userId}/role?role=${nuevoRol}`, {}, {
        headers: getAuthHeaders()
      });
      toast.success(`Rol actualizado a ${nuevoRol}`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error cambiando rol:', error);
      toast.error('Error al cambiar rol');
    }
  };

  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
    } catch {
      return fecha;
    }
  };

  return (
    <div>
      <header className="header-uta">
        <div className="header-content">
          <div className="header-title" data-testid="usuarios-title">
            <Users size={28} />
            <span>Gestión de Usuarios</span>
          </div>
          <button 
            className="nav-button" 
            onClick={() => navigate('/')}
            data-testid="back-to-dashboard-btn"
          >
            <ArrowLeft size={16} style={{display: 'inline', marginRight: '4px'}} />
            Volver al Dashboard
          </button>
        </div>
      </header>

      <div className="page-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando usuarios...</div>
        ) : (
          <div>
            {/* Formulario de crear usuario */}
            {showCreateForm && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1.5rem' }}>
                  Crear Nuevo Usuario Emisor
                </h3>
                <form onSubmit={handleCreateUser} data-testid="create-user-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="new-username">Usuario *</label>
                      <input
                        id="new-username"
                        type="text"
                        className="form-input"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        required
                        data-testid="new-username"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="new-email">Email *</label>
                      <input
                        id="new-email"
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        data-testid="new-email"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="new-password">Contraseña * (mínimo 6 caracteres)</label>
                    <input
                      id="new-password"
                      type="text"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={6}
                      placeholder="Contraseña para el nuevo usuario"
                      data-testid="new-password"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn-primary" disabled={creating} data-testid="submit-create-user">
                      {creating ? 'Creando...' : 'Crear Usuario'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setFormData({ username: '', email: '', password: '' });
                      }}
                      data-testid="cancel-create-user"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e3a5f' }}>
                  Total de Usuarios: {usuarios.length}
                </h2>
                {!showCreateForm && (
                  <button 
                    className="btn-primary" 
                    onClick={() => setShowCreateForm(true)}
                    data-testid="show-create-form-btn"
                  >
                    + Crear Usuario
                  </button>
                )}
              </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Usuario</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Rol</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Línea Asignada</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Registro</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#475569' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr 
                      key={usuario.id} 
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      data-testid={`usuario-row-${usuario.id}`}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{usuario.username}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b' }}>{usuario.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={usuario.role}
                          onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                          disabled={usuario.id === currentUser?.id}
                          className="form-select"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                          data-testid={`select-rol-${usuario.id}`}
                        >
                          <option value="EMISOR_RECLAMO">Emisor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {usuario.role === 'EMISOR_RECLAMO' ? (
                          <select
                            value={usuario.linea_asignada || ''}
                            onChange={(e) => asignarLinea(usuario.id, e.target.value)}
                            className="form-select"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
                            data-testid={`select-linea-${usuario.id}`}
                          >
                            <option value="">Sin asignar</option>
                            {LINEAS.map(linea => (
                              <option key={linea} value={linea}>Línea {linea}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                        {formatearFecha(usuario.created_at)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {usuario.linea_asignada && usuario.role === 'EMISOR_RECLAMO' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
                              <Check size={16} />
                              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Configurado</span>
                            </div>
                          )}
                          {usuario.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDeleteUser(usuario.id, usuario.username)}
                              style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}
                              data-testid={`delete-user-${usuario.id}`}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUsuarios;