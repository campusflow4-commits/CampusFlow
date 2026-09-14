import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { api } from '../services/api.js';
import { 
  GraduationCap, 
  Coins, 
  Flame, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu, 
  ShieldAlert, 
  UserPlus,
  Bell,
  CheckCircle
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState({
    pendingSwapsCount: 0,
    unreadMessagesCount: 0,
    totalCount: 0,
    pendingSwaps: [],
    unreadMessages: []
  });

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.get('/stats/notifications');
      setNotifications(data);
    } catch (err) {
      // silently fail if offline/connecting
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?._id, location.pathname]);

  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = () => {
      fetchNotifications();
    };
    socket.on('new_message_notification', handleNewMessage);
    return () => {
      socket.off('new_message_notification', handleNewMessage);
    };
  }, [socket]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchNotifications();
    };
    window.addEventListener('campusflow:refresh_notifications', handleRefresh);
    return () => window.removeEventListener('campusflow:refresh_notifications', handleRefresh);
  }, []);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?._id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/swaps')) return 'Skill Exchange';
    if (path.startsWith('/matches')) return 'Smart Matches';
    if (path.startsWith('/doubts')) return 'Doubts Forum';
    if (path.startsWith('/videos')) return 'Video Hub';
    if (path.startsWith('/quizzes')) return 'Skill Quizzes';
    if (path.startsWith('/planner')) return 'Academic Planner';
    if (path.startsWith('/notes')) return 'Study Notes';
    if (path.startsWith('/chat')) return 'Peer Chat';
    if (path.startsWith('/invite')) return 'Invite Friends';
    if (path.startsWith('/reports')) return 'Help & Reports';
    if (path.startsWith('/settings')) return 'Settings';
    return 'CampusFlow';
  };

  // 1. Authenticated App Top Bar (Clean, sleek, lightweight)
  if (user) {
    return (
      <header className="app-topbar">
        <div className="app-topbar-inner">
          
          {/* Left: Hamburger & Brand & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={onToggleSidebar}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex' }}
                aria-label="Toggle navigation menu"
              >
                <Menu size={20} />
              </button>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <div className="brand-icon" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                  <GraduationCap size={16} color="#6366f1" />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                  Campus<span className="text-gradient">Flow</span>
                </span>
              </Link>
            </div>
            
            {/* Divider */}
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 8px' }}></div>

            {/* Page Title */}
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'none', '@media (minWidth: 768px)': { display: 'block' } }} className="nav-page-title">
              {getPageTitle(location.pathname)}
            </span>
          </div>

          {/* Right: Search, Credits, Streak, Bell, Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Short Search Bar */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px 6px 30px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  width: '180px',
                  outline: 'none',
                  transition: 'width 0.2s ease, border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.width = '200px'}
                onBlur={(e) => e.target.style.width = '160px'}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" height="14" 
                viewBox="0 0 24 24" fill="none" 
                stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                style={{ position: 'absolute', left: '10px' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <Link to="/settings#credits" className="credit-pill compact" title="Your CampusFlow Credits">
              🪙
              <span style={{ fontWeight: 600 }}>{user.credits} Credits</span>
            </Link>

            <div className="streak-pill compact" title={`${user.currentStreak || 1} day learning streak!`}>
              <Flame size={14} />
              <span>{user.currentStreak || 1}d</span>
            </div>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdown(false);
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-full)',
                  background: notificationsOpen ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-surface)',
                  border: notificationsOpen ? '1px solid #6366f1' : '1px solid var(--border-color)',
                  color: notifications.totalCount > 0 ? '#fb7185' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0
                }}
              >
                <Bell size={17} />
                {notifications.totalCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px', minWidth: '17px', height: '17px',
                    borderRadius: '999px', background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    color: '#ffffff', fontSize: '0.65rem', fontWeight: 800, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                    boxShadow: '0 0 8px rgba(244, 63, 94, 0.5)'
                  }}>
                    {notifications.totalCount > 9 ? '9+' : notifications.totalCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '44px',
                    width: '340px',
                    maxWidth: 'calc(100vw - 32px)',
                    padding: 0,
                    zIndex: 110,
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    border: '1px solid rgba(99, 102, 241, 0.3)'
                  }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.03)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bell size={15} color="#6366f1" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    </div>
                    {notifications.totalCount > 0 ? (
                      <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                        {notifications.totalCount} New
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All caught up</span>
                    )}
                  </div>

                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {notifications.totalCount === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 10px auto'
                        }}>
                          <CheckCircle size={18} />
                        </div>
                        <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>No pending notifications</p>
                        <p style={{ fontSize: '0.78rem', marginTop: '4px' }}>Swap requests and unread chats will appear here.</p>
                      </div>
                    ) : (
                      <>
                        {notifications.pendingSwaps?.length > 0 && (
                          <div>
                            <div style={{
                              padding: '6px 16px',
                              background: 'rgba(99, 102, 241, 0.08)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: '#a5b4fc',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>Pending Swap Proposals</span>
                              <span>{notifications.pendingSwapsCount}</span>
                            </div>
                            {notifications.pendingSwaps.map((swap) => (
                              <div
                                key={swap._id}
                                onClick={() => {
                                  setNotificationsOpen(false);
                                  navigate('/swaps');
                                }}
                                style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid var(--border-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease'
                                }}
                              >
                                <img
                                  src={swap.sender?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${swap.sender?.name}`}
                                  alt=""
                                  style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {swap.sender?.name}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Offers: <strong style={{ color: '#6ee7b7' }}>{swap.skillOffered}</strong> ⇄ Wants: <strong style={{ color: '#a5b4fc' }}>{swap.skillRequested}</strong>
                                  </p>
                                </div>
                                <span className="badge badge-amber" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                                  Review
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {notifications.unreadMessages?.length > 0 && (
                          <div>
                            <div style={{
                              padding: '6px 16px',
                              background: 'rgba(244, 63, 94, 0.08)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: '#fb7185',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}>
                              <span>Unread Messages</span>
                              <span>{notifications.unreadMessagesCount}</span>
                            </div>
                            {notifications.unreadMessages.map((msg) => (
                              <div
                                key={msg._id}
                                onClick={() => {
                                  setNotificationsOpen(false);
                                  navigate(`/chat?user=${msg.sender?._id}`);
                                }}
                                style={{
                                  padding: '12px 16px',
                                  borderBottom: '1px solid var(--border-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  cursor: 'pointer',
                                  transition: 'background 0.15s ease'
                                }}
                              >
                                <img
                                  src={msg.sender?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${msg.sender?.name}`}
                                  alt=""
                                  style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {msg.sender?.name}
                                  </p>
                                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    "{msg.text}"
                                  </p>
                                </div>
                                <span className="badge badge-rose" style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                                  Chat
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{
                    padding: '10px 16px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)',
                    fontSize: '0.8rem'
                  }}>
                    <Link
                      to="/swaps"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}
                    >
                      View All Swaps →
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setNotificationsOpen(false)}
                      style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Open Chat →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                aria-label="Open student profile menu"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt={user.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '1.5px solid #6366f1',
                    objectFit: 'cover'
                  }}
                />
              </button>

              {profileDropdown && (
                <div
                  className="glass-card"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '42px',
                    width: '210px',
                    padding: '6px',
                    zIndex: 100,
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem' }}>{user.name}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    <span className="badge badge-primary" style={{ marginTop: '4px', fontSize: '0.65rem' }}>{user.year}</span>
                  </div>

                  <Link
                    to="/settings"
                    className="nav-link"
                    onClick={() => setProfileDropdown(false)}
                    style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  >
                    <Settings size={14} /> Settings & Profile
                  </Link>

                  <Link
                    to="/invite"
                    className="nav-link"
                    onClick={() => setProfileDropdown(false)}
                    style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  >
                    <UserPlus size={14} /> Invite Friends (+20)
                  </Link>

                  <Link
                    to="/reports"
                    className="nav-link"
                    onClick={() => setProfileDropdown(false)}
                    style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  >
                    <ShieldAlert size={14} /> Help & Reports
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '7px 10px',
                      fontSize: '0.82rem',
                      color: 'var(--accent-rose)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // 2. Unauthenticated Visitors Top Bar (Landing, Login, Register)
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <span>Campus<span className="text-gradient">Flow</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <a href="/#how-it-works" className="nav-link">How it Works</a>
          <a href="/#features" className="nav-link">Features</a>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </div>
    </nav>
  );
};
