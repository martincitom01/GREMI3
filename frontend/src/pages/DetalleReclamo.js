import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Upload, Send, FileText, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ESTADOS = ['Pendiente', 'En gestión', 'En negociación', 'Resuelto'];

const DetalleReclamo = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, getAuthHeaders } = useAuth();
  const [reclamo, setReclamo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [autor, setAutor] = useState(user?.username || '');
  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState({
    estado: '',
    responsable: '',
    solucion: '',
    responsable_cierre: ''
  });

  useEffect(() => {
    cargarReclamo();
  }, [id]);

  useEffect(() => {
    if (user?.username) {
      setAutor(user.username);
    }
  }, [user]);

  const cargarReclamo = async () => {
    try {
      const response = await axios.get(`${API}/reclamos/${id}`, {
        headers: getAuthHeaders()
      });
      setReclamo(response.data);
      setFormEdit({
        estado: response.data.estado,
        responsable: response.data.responsable || '',
        solucion: response.data.solucion || '',
        responsable_cierre: response.data.responsable_cierre || ''
      });
    } catch (error) {
      console.error('Error cargando reclamo:', error);
      toast.error(error.response?.data?.detail || 'Error al cargar el reclamo');
      if (error.response?.status === 403) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) {
      toast.error('Complete el comentario');
      return;
    }

    try {
      await axios.post(`${API}/reclamos/${id}/comentarios`, {
        text: nuevoComentario,
        author: autor || user?.username
      }, {
        headers: getAuthHeaders()
      });
      setNuevoComentario('');
      toast.success('Comentario agregado');
      cargarReclamo();
    } catch (error) {
      console.error('Error agregando comentario:', error);
      toast.error('Error al agregar comentario');
    }
  };

  const handleSubirArchivo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/reclamos/${id}/archivos`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Archivo subido');
      cargarReclamo();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      toast.error('Error al subir archivo');
    }
  };

  const handleActualizar = async () => {
    try {
      await axios.patch(`${API}/reclamos/${id}`, formEdit, {
        headers: getAuthHeaders()
      });
      toast.success('Reclamo actualizado');
      setEditando(false);
      cargarReclamo();
    } catch (error) {
      console.error('Error actualizando reclamo:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar');
    }
  };

  const getEstadoClass = (estado) => {
    const map = {
      'Pendiente': 'estado-pendiente',
      'En gestión': 'estado-gestion',
      'En negociación': 'estado-negociacion',
      'Resuelto': 'estado-resuelto'
    };
    return map[estado] || 'estado-pendiente';
  };

  const formatearFecha = (fecha) => {
    try {
      return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
      return fecha;
    }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando...</div>;
  }

  if (!reclamo) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Reclamo no encontrado</div>;
  }

  return (
    <div>
      <header className="header-uta">
        <div className="header-content">
          <div className="header-title" data-testid="detalle-title">
            Detalle del Reclamo
          </div>
          <button 
            className="nav-button" 
            onClick={() => navigate('/administracion')}
            data-testid="back-to-admin-btn"
          >
            <ArrowLeft size={16} style={{display: 'inline', marginRight: '4px'}} />
            Volver a Administración
          </button>
        </div>
      </header>

      <div className="page-container">
        <div className="form-container" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.5rem' }} data-testid="reclamo-numero">
                {reclamo.numero_reclamo}
              </h2>
              <span className={`estado-badge ${getEstadoClass(reclamo.estado)}`} data-testid="reclamo-estado">
                {reclamo.estado}
              </span>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setEditando(!editando)}
              data-testid="toggle-edit-btn"
            >
              {editando ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>Línea</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f' }}>Línea {reclamo.linea}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>Categoría</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f' }}>{reclamo.categoria}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>Sector/Estación</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f' }}>{reclamo.sector_estacion}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>
                <Calendar size={14} style={{display: 'inline', marginRight: '4px'}} />
                Fecha de Creación
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f' }}>{formatearFecha(reclamo.fecha_creacion)}</div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label">Descripción</label>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', lineHeight: '1.6', color: '#334155' }}>
              {reclamo.descripcion}
            </div>
          </div>

          {editando ? (
            <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '2px solid #bfdbfe' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1rem' }}>Actualizar Reclamo</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-estado">Estado</label>
                <select
                  id="edit-estado"
                  className="form-select"
                  value={formEdit.estado}
                  onChange={(e) => setFormEdit({...formEdit, estado: e.target.value})}
                  data-testid="edit-estado"
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-responsable">Responsable/Delegado</label>
                <input
                  id="edit-responsable"
                  type="text"
                  className="form-input"
                  value={formEdit.responsable}
                  onChange={(e) => setFormEdit({...formEdit, responsable: e.target.value})}
                  placeholder="Nombre del responsable"
                  data-testid="edit-responsable"
                />
              </div>

              {formEdit.estado === 'Resuelto' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-solucion">Solución/Respuesta</label>
                    <textarea
                      id="edit-solucion"
                      className="form-textarea"
                      value={formEdit.solucion}
                      onChange={(e) => setFormEdit({...formEdit, solucion: e.target.value})}
                      placeholder="Descripción de la solución o acuerdo alcanzado"
                      data-testid="edit-solucion"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-responsable-cierre">Responsable del Cierre</label>
                    <input
                      id="edit-responsable-cierre"
                      type="text"
                      className="form-input"
                      value={formEdit.responsable_cierre}
                      onChange={(e) => setFormEdit({...formEdit, responsable_cierre: e.target.value})}
                      placeholder="Nombre del responsable del cierre"
                      data-testid="edit-responsable-cierre"
                    />
                  </div>
                </>
              )}

              <button 
                className="btn-primary" 
                onClick={handleActualizar}
                data-testid="guardar-cambios-btn"
              >
                Guardar Cambios
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '2rem' }}>
              {reclamo.responsable && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginBottom: '0.25rem' }}>
                    <User size={14} style={{display: 'inline', marginRight: '4px'}} />
                    Responsable
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f' }}>{reclamo.responsable}</div>
                </div>
              )}
              {reclamo.solucion && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Solución</label>
                  <div style={{ background: '#d1fae5', padding: '1rem', borderRadius: '8px', lineHeight: '1.6', color: '#065f46', border: '1px solid #86efac' }}>
                    {reclamo.solucion}
                  </div>
                </div>
              )}
              {reclamo.fecha_cierre && (
                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Cerrado el {formatearFecha(reclamo.fecha_cierre)}
                  {reclamo.responsable_cierre && ` por ${reclamo.responsable_cierre}`}
                </div>
              )}
            </div>
          )}

          {reclamo.archivos && reclamo.archivos.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <label className="form-label">
                <FileText size={16} style={{display: 'inline', marginRight: '4px'}} />
                Archivos Adjuntos
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {reclamo.archivos.map((archivo, index) => (
                  <a
                    key={index}
                    href={`${BACKEND_URL}${archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      padding: '0.5rem 1rem', 
                      background: '#eff6ff', 
                      borderRadius: '8px', 
                      color: '#1e40af',
                      textDecoration: 'none',
                      border: '1px solid #bfdbfe',
                      fontSize: '0.9rem',
                      fontWeight: '500'
                    }}
                    data-testid={`archivo-${index}`}
                  >
                    Ver archivo {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '2rem' }}>
            <label className="form-label">Subir Nuevo Archivo</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="file"
                onChange={handleSubirArchivo}
                style={{ flex: 1 }}
                accept="image/*,.pdf,.doc,.docx"
                data-testid="upload-archivo-input"
              />
              <Upload size={20} style={{ color: '#4a90e2' }} />
            </div>
          </div>

          <div className="comentarios-section">
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e3a5f', marginBottom: '1rem' }}>
              Comentarios y Seguimiento
            </h3>

            {reclamo.comentarios && reclamo.comentarios.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                {reclamo.comentarios.map((comentario) => (
                  <div key={comentario.id} className="comentario-item" data-testid={`comentario-${comentario.id}`}>
                    <div className="comentario-header">
                      <span className="comentario-author">{comentario.author}</span>
                      <span>{formatearFecha(comentario.timestamp)}</span>
                    </div>
                    <div className="comentario-text">{comentario.text}</div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAgregarComentario}>
              <div className="form-group">
                <label className="form-label" htmlFor="autor">Tu Nombre</label>
                <input
                  id="autor"
                  type="text"
                  className="form-input"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  data-testid="comentario-autor-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="comentario">Nuevo Comentario</label>
                <textarea
                  id="comentario"
                  className="form-textarea"
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  placeholder="Agregue comentarios sobre avances, reuniones, etc."
                  data-testid="comentario-texto-input"
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary"
                data-testid="agregar-comentario-btn"
              >
                <Send size={16} style={{display: 'inline', marginRight: '4px'}} />
                Agregar Comentario
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleReclamo;