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
  X,
  FileText,
  BookMarked
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
        { label: 'Planner', path: '/planner', icon: CalendarDays },
        { label: 'Resources / Book Referral', path: '/resources', icon: BookMarked }
      ]
    },
    {
      groupTitle: 'CAREER',
      items: [
        { label: 'CV / Resume', path: '/resume', icon: FileText }
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
        
        {/* Mobile Close Area */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={24} />
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

        
        {/* User Footer Profile & App Footer */}
        <div className="sidebar-footer" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <Link to="/settings" className="sidebar-user" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit', flex: 1, overflow: 'hidden' }}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt=""
                  style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.year || 'Student'}</p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          
        </div>

      </aside>
    </>
  );
};
