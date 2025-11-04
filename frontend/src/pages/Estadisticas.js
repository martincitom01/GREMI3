import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, TrendingUp, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Estadisticas = () => {
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get(`${API}/estadisticas`);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !estadisticas) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando estadísticas...</div>;
  }

  const getMaxValue = (obj) => Math.max(...Object.values(obj));

  const renderBarChart = (data, title) => {
    const max = getMaxValue(data);
    return (
      <div className="chart-container">
        <h3 className="chart-title">{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>{key}</span>
                <span style={{ fontWeight: '700', color: '#1e3a5f' }}>{value}</span>
              </div>
              <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    background: 'linear-gradient(135deg, #1e3a5f 0%, #4a90e2 100%)', 
                    height: '100%', 
                    width: `${(value / max) * 100}%`,
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totalActivos = estadisticas.total_reclamos - (estadisticas.reclamos_por_estado['Resuelto'] || 0);

  return (
    <div>
      <header className="header-uta">
        <div className="header-content">
          <div className="header-title" data-testid="stats-title">
            Panel de Estadísticas
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
        <div className="stats-grid">
          <div className="stat-card" style={{ '--color': '#1e3a5f' }}>
            <div className="stat-card-title">
              <TrendingUp size={16} style={{display: 'inline', marginRight: '4px'}} />
              Total de Reclamos
            </div>
            <div className="stat-card-value" data-testid="total-reclamos">{estadisticas.total_reclamos}</div>
          </div>

          <div className="stat-card" style={{ '--color': '#dc2626' }}>
            <div className="stat-card-title">
              <AlertCircle size={16} style={{display: 'inline', marginRight: '4px'}} />
              Reclamos Activos
            </div>
            <div className="stat-card-value" data-testid="reclamos-activos">{totalActivos}</div>
          </div>

          <div className="stat-card" style={{ '--color': '#059669' }}>
            <div className="stat-card-title">
              <CheckCircle size={16} style={{display: 'inline', marginRight: '4px'}} />
              Reclamos Resueltos
            </div>
            <div className="stat-card-value" data-testid="reclamos-resueltos">
              {estadisticas.reclamos_por_estado['Resuelto'] || 0}
            </div>
          </div>

          <div className="stat-card" style={{ '--color': '#4a90e2' }}>
            <div className="stat-card-title">
              <Clock size={16} style={{display: 'inline', marginRight: '4px'}} />
              Tiempo Promedio de Resolución
            </div>
            <div className="stat-card-value" data-testid="tiempo-promedio">
              {estadisticas.tiempo_promedio_resolucion 
                ? `${estadisticas.tiempo_promedio_resolucion.toFixed(1)} días`
                : 'N/A'
              }
            </div>
          </div>
        </div>

        {Object.keys(estadisticas.reclamos_por_linea).length > 0 && 
          renderBarChart(estadisticas.reclamos_por_linea, 'Reclamos por Línea')
        }

        {Object.keys(estadisticas.reclamos_por_categoria).length > 0 && 
          renderBarChart(estadisticas.reclamos_por_categoria, 'Reclamos por Categoría')
        }

        {Object.keys(estadisticas.reclamos_por_estado).length > 0 && 
          renderBarChart(estadisticas.reclamos_por_estado, 'Reclamos por Estado')
        }

        {Object.keys(estadisticas.reclamos_por_mes).length > 0 && (
          <div className="chart-container">
            <h3 className="chart-title">Evolución Mensual</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
              {Object.entries(estadisticas.reclamos_por_mes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([mes, valor]) => {
                  const maxMes = getMaxValue(estadisticas.reclamos_por_mes);
                  const altura = (valor / maxMes) * 100;
                  return (
                    <div key={mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1e3a5f' }}>{valor}</div>
                      <div 
                        style={{ 
                          width: '100%', 
                          height: `${altura}%`, 
                          background: 'linear-gradient(180deg, #4a90e2 0%, #1e3a5f 100%)',
                          borderRadius: '8px 8px 0 0',
                          transition: 'height 0.5s ease'
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        {mes}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;