import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const NotificationBell = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
    
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`, {
        headers: getAuthHeaders()
      });
      setNotifications(response.data.slice(0, 5)); // Only show last 5
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread/count`, {
        headers: getAuthHeaders()
      });
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`${API}/notifications/${notificationId}/read`, {}, {
        headers: getAuthHeaders()
      });
      loadNotifications();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(`/reclamo/${notification.reclamo_id}`);
    setShowDropdown(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return `Hace ${Math.floor(diffMins / 1440)} d`;
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="nav-button"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ position: 'relative' }}
        data-testid="notification-bell-btn"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: '700'
            }}
            data-testid="notification-count"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflow: 'auto'
          }}
          data-testid="notification-dropdown"
        >
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1e3a5f' }}>Notificaciones</h3>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No hay notificaciones
            </div>
          ) : (
            <div>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    background: notif.is_read ? 'white' : '#eff6ff',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = notif.is_read ? 'white' : '#eff6ff'}
                  data-testid={`notification-${notif.id}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.25rem', fontWeight: notif.is_read ? '400' : '600' }}>
                        {notif.message}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {notif.reclamo_numero}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;