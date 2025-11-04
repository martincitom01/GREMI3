import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Train, Plus, BarChart3, ClipboardList, LogOut, Users } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LINEAS = [
  { id: 'A', nombre: 'Línea A', color: '#00A7E1' },
  { id: 'B', nombre: 'Línea B', color: '#DC241F' },
  { id: 'C', nombre: 'Línea C', color: '#2C3592' },
  { id: 'D', nombre: 'Línea D', color: '#00B050' },
  { id: 'E', nombre: 'Línea E', color: '#9D5AB7' },
  { id: 'H', nombre: 'Línea H', color: '#FFD700' },
  { id: 'Premetro', nombre: 'Premetro', color: '#85BC22' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = async () => {
    try {
      const response = await axios.get(`${API}/reclamos`);
      setReclamos(response.data);
    } catch (error) {
      console.error('Error cargando reclamos:', error);
    } finally {
      setLoading(false);
    }
  };

  const contarReclamosPorLinea = (lineaId) => {
    return reclamos.filter(r => r.linea === lineaId).length;
  };

  const contarPendientesPorLinea = (lineaId) => {
    return reclamos.filter(r => r.linea === lineaId && r.estado !== 'Resuelto').length;
  };

  return (
    <div>
      <header className="header-uta">
        <div className="header-content">
          <div className="header-title" data-testid="header-title">
            <Train size={32} />
            <span>Sistema de Reclamos Gremiales UTA</span>
          </div>
          <div className="header-nav">
            <button 
              className="nav-button active" 
              onClick={() => navigate('/')}
              data-testid="nav-dashboard-btn"
            >
              Dashboard
            </button>
            <button 
              className="nav-button" 
              onClick={() => navigate('/nuevo-reclamo')}
              data-testid="nav-nuevo-reclamo-btn"
            >
              <Plus size={16} style={{display: 'inline', marginRight: '4px'}} />
              Nuevo Reclamo
            </button>
            <button 
              className="nav-button" 
              onClick={() => navigate('/administracion')}
              data-testid="nav-admin-btn"
            >
              <ClipboardList size={16} style={{display: 'inline', marginRight: '4px'}} />
              Administración
            </button>
            <button 
              className="nav-button" 
              onClick={() => navigate('/estadisticas')}
              data-testid="nav-stats-btn"
            >
              <BarChart3 size={16} style={{display: 'inline', marginRight: '4px'}} />
              Estadísticas
            </button>
          </div>
        </div>
      </header>

      <div className="page-container">
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e3a5f', marginBottom: '0.5rem' }} data-testid="dashboard-title">
          Panel Principal
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2rem' }}>
          Seleccione una línea para ver los reclamos gremiales
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando...</div>
        ) : (
          <div className="lineas-grid">
            {LINEAS.map((linea) => (
              <div
                key={linea.id}
                className="linea-card"
                style={{ '--linea-color': linea.color }}
                onClick={() => navigate(`/administracion?linea=${linea.id}`)}
                data-testid={`linea-card-${linea.id}`}
              >
                <div className="linea-header">
                  <div className="linea-icon" style={{ background: linea.color }}>
                    {linea.id}
                  </div>
                  <div className="linea-info">
                    <h3>{linea.nombre}</h3>
                  </div>
                </div>
                <div className="linea-stats">
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: linea.color }}>
                      {contarReclamosPorLinea(linea.id)}
                    </div>
                    <div className="stat-label">Total</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value" style={{ color: linea.color }}>
                      {contarPendientesPorLinea(linea.id)}
                    </div>
                    <div className="stat-label">Activos</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;