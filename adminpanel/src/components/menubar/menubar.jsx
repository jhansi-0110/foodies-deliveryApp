import React, { useState, useEffect } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../../services/notificationService';
import { IconBell, IconMenu, IconLogout, IconUser } from '../common/Icons';

const Menubar = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifs = async () => {
    try {
      const list = await getNotifications();
      const count = await getUnreadCount();
      setNotifications(list || []);
      setUnreadCount(count || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifs();
  };

  const handleMarkSingleRead = async (id) => {
    await markAsRead(id);
    fetchNotifs();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 py-2" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-2"
          id="sidebarToggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle Navigation"
        >
          <IconMenu size={16} />
        </button>

        <div className="d-flex align-items-center gap-3">
          {/* Notifications Dropdown */}
          <div className="position-relative">
            <button
              className="btn btn-sm btn-outline-secondary position-relative p-2 d-flex align-items-center justify-content-center"
              onClick={() => setShowDropdown(!showDropdown)}
              title="Notifications"
            >
              <IconBell size={16} />
              {unreadCount > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
                  style={{ fontSize: '0.65rem' }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div
                className="position-absolute end-0 mt-2 card shadow-sm border rounded-3"
                style={{ width: '340px', zIndex: 1050, maxHeight: '400px', overflowY: 'auto' }}
              >
                <div className="card-header bg-white d-flex justify-content-between align-items-center py-2 px-3 border-bottom">
                  <span className="fw-semibold text-dark" style={{ fontSize: '0.8125rem' }}>
                    Notifications ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none text-muted"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleMarkAllRead}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="card-body p-0">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted small">
                      No notifications
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`list-group-item list-group-item-action p-3 ${
                            !n.read ? 'bg-light' : ''
                          }`}
                          onClick={() => handleMarkSingleRead(n.id)}
                          style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1">
                            <strong className="text-dark" style={{ fontSize: '0.8125rem' }}>{n.title}</strong>
                            <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <p className="mb-0 text-secondary" style={{ fontSize: '0.775rem', lineHeight: 1.4 }}>
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {user && (
            <div className="d-flex align-items-center gap-2 border-start ps-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2">
                <span className="badge badge-neutral px-2 py-1">
                  {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Partner'}
                </span>
                <span className="text-dark fw-semibold" style={{ fontSize: '0.8125rem' }}>
                  {user.name}
                </span>
              </div>
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 ms-1"
                onClick={onLogout}
                title="Sign Out"
              >
                <IconLogout size={14} />
                <span className="d-none d-sm-inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Menubar;