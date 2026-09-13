import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  GraduationCap, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Sparkles, 
  HelpCircle, 
  MessageCircle, 
  PlayCircle, 
  ClipboardCheck, 
  NotebookPen, 
  CalendarDays, 
  UserPlus, 
  BarChart3, 
  Settings, 
  LogOut, 
  X 
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const navGroups = [
    {
      groupTitle: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Skill Exchange', path: '/swaps', icon: ArrowLeftRight },
        { label: 'Smart Matches', path: '/matches', icon: Sparkles },
        { label: 'Doubts', path: '/doubts', icon: HelpCircle },
        { label: 'Chat', path: '/chat', icon: MessageCircle }
      ]
    },
    {
      groupTitle: 'LEARN',
      items: [
        { label: 'Videos', path: '/videos', icon: PlayCircle },
        { label: 'Quizzes', path: '/quizzes', icon: ClipboardCheck },
        { label: 'Notes', path: '/notes', icon: NotebookPen },
        { label: 'Planner', path: '/planner', icon: CalendarDays }
      ]
    },
    {
      groupTitle: 'OTHER',
      items: [
        { label: 'Invite Friends', path: '/invite', icon: UserPlus },
        { label: 'Reports', path: '/reports', icon: BarChart3 },
        { label: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <Link to="/dashboard" className="brand-logo" onClick={onClose}>
            <div className="brand-icon">
              <GraduationCap size={20} />
            </div>
            <span>Campus<span className="text-gradient">Flow</span></span>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="sidebar-nav">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="sidebar-group">
              <span className="sidebar-group-title">{group.groupTitle}</span>
              <div className="sidebar-links">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={iIdx}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={17} className="sidebar-icon" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer Profile */}
        {user && (
          <div className="sidebar-footer">
            <Link to="/settings" className="sidebar-user" onClick={onClose}>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                alt=""
                className="sidebar-user-avatar"
              />
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user.name}</p>
                <span className="sidebar-user-badge">{user.year || 'Student'}</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="sidebar-logout-btn"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
