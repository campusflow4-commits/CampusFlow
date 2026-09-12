import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Sparkles, 
  Repeat, 
  BrainCircuit, 
  HelpCircle, 
  Video, 
  Award, 
  Calendar, 
  MessageSquare, 
  BookOpen, 
  Coins, 
  Flame, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  UserPlus 
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <Link to={user ? "/dashboard" : "/"} className="brand-logo">
          <div className="brand-icon">
            <Repeat size={22} />
          </div>
          <span>Campus<span className="text-gradient">Flow</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        {user ? (
          <div className="nav-links" style={{ display: 'flex', gap: '6px' }}>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Sparkles size={16} /> Dashboard
            </NavLink>
            <NavLink to="/swaps" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Repeat size={16} /> Skill Swap
            </NavLink>
            <NavLink to="/matches" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BrainCircuit size={16} /> Smart Matches
            </NavLink>
            <NavLink to="/doubts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <HelpCircle size={16} /> Doubts
            </NavLink>
            <NavLink to="/videos" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Video size={16} /> Videos
            </NavLink>
            <NavLink to="/quizzes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Award size={16} /> Quizzes
            </NavLink>
            <NavLink to="/planner" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Calendar size={16} /> Planner
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <MessageSquare size={16} /> Chat
            </NavLink>
            <NavLink to="/notes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <BookOpen size={16} /> Notes
            </NavLink>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#features" className="nav-link">Features</a>
          </div>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <>
              {/* Credit Pill */}
              <Link to="/settings#credits" className="credit-pill" title="Your CampusFlow Credits">
                <Coins size={16} />
                <span>{user.credits}</span>
              </Link>

              {/* Streak Pill */}
              <div className="streak-pill" title={`${user.currentStreak || 1} day learning streak!`}>
                <Flame size={15} />
                <span>{user.currentStreak || 1}d</span>
              </div>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
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
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: '2px solid #6366f1',
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
                      top: '46px',
                      width: '220px',
                      padding: '8px',
                      zIndex: 100,
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '6px' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</p>
                      <span className="badge badge-primary" style={{ marginTop: '4px' }}>{user.year}</span>
                    </div>

                    <Link
                      to="/settings"
                      className="nav-link"
                      onClick={() => setProfileDropdown(false)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    >
                      <UserIcon size={15} /> Profile & Settings
                    </Link>

                    <Link
                      to="/invite"
                      className="nav-link"
                      onClick={() => setProfileDropdown(false)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    >
                      <UserPlus size={15} /> Invite Friends (+25)
                    </Link>

                    <Link
                      to="/reports"
                      className="nav-link"
                      onClick={() => setProfileDropdown(false)}
                      style={{ padding: '8px 10px', fontSize: '0.85rem' }}
                    >
                      <ShieldAlert size={15} /> Help & Reports
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="nav-link"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        fontSize: '0.85rem',
                        color: 'var(--accent-rose)',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <LogOut size={15} /> Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'none' }}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
  );
};
