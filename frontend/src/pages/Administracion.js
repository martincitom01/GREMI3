import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LINEAS = ['', 'A', 'B', 'C', 'D', 'E', 'H', 'Premetro'];
const CATEGORIAS = [
  '',
  'Condiciones de trabajo',
  'Faltante de materiales o elementos de seguridad',
  'Higiene y salubridad',
  'Seguridad y prevención',
  'Personal y recursos humanos',
  'Conflictos o situaciones laborales',
  'Otros reclamos gremiales'
];
const ESTADOS = ['', 'Pendiente', 'En gestión', 'En negociación', 'Resuelto'];

const Administracion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    linea: searchParams.get('linea') || '',
    categoria: '',
    estado: '',
    search: ''
  });

  useEffect(() => {
    cargarReclamos();
  }, [filters]);

  const cargarReclamos = async () => {
    try {
      const params = {};
      if (filters.linea) params.linea = filters.linea;
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.estado) params.estado = filters.estado;
      if (filters.search) params.search = filters.search;

      const response = await axios.get(`${API}/reclamos`, { params });
      setReclamos(response.data);
    } catch (error) {
      console.error('Error cargando reclamos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
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

  return (
    <div>
      <header className="header-uta">
        <div className="header-content">
          <div className="header-title" data-testid="admin-title">
            Panel de Administración
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
        <div className="filters-container" data-testid="filters-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Filter size={20} style={{ color: '#1e3a5f' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1e3a5f' }}>Filtros</h3>
          </div>
          <div className="filters-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-linea">Línea</label>
              <select
                id="filter-linea"
                name="linea"
                className="form-select"
                value={filters.linea}
                onChange={handleFilterChange}
                data-testid="filter-linea"
              >
                <option value="">Todas</option>
                {LINEAS.slice(1).map(linea => (
                  <option key={linea} value={linea}>{linea === 'Premetro' ? 'Premetro' : `Línea ${linea}`}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-categoria">Categoría</label>
              <select
                id="filter-categoria"
                name="categoria"
                className="form-select"
                value={filters.categoria}
                onChange={handleFilterChange}
                data-testid="filter-categoria"
              >
                <option value="">Todas</option>
                {CATEGORIAS.slice(1).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-estado">Estado</label>
              <select
                id="filter-estado"
                name="estado"
                className="form-select"
                value={filters.estado}
                onChange={handleFilterChange}
                data-testid="filter-estado"
              >
                {ESTADOS.map(estado => (
                  <option key={estado} value={estado}>{estado || 'Todos'}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="filter-search">Búsqueda</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  id="filter-search"
                  type="text"
                  name="search"
                  className="form-input"
                  placeholder="Número, descripción..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  style={{ paddingLeft: '2.5rem' }}
                  data-testid="filter-search"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Cargando...</div>
        ) : reclamos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', color: '#64748b' }}>
            No se encontraron reclamos con los filtros aplicados
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="reclamos-table" data-testid="reclamos-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Línea</th>
                  <th>Categoría</th>
                  <th>Sector/Estación</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {reclamos.map((reclamo) => (
                  <tr 
                    key={reclamo.id} 
                    onClick={() => navigate(`/reclamo/${reclamo.id}`)}
                    data-testid={`reclamo-row-${reclamo.id}`}
                  >
                    <td style={{ fontWeight: '600', color: '#1e3a5f' }}>{reclamo.numero_reclamo}</td>
                    <td>Línea {reclamo.linea}</td>
                    <td>{reclamo.categoria}</td>
                    <td>{reclamo.sector_estacion}</td>
                    <td>
                      <span className={`estado-badge ${getEstadoClass(reclamo.estado)}`}>
                        {reclamo.estado}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.9rem', color: '#64748b' }}>
                      {formatearFecha(reclamo.fecha_creacion)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Administracion;