import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { GraduationCap, Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Smartphone } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, deviceWarning, clearDeviceWarning } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a valid @gmail.com address.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login for instant testing!
  const handleQuickDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'student123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto', width: '44px', height: '44px' }}>
            <GraduationCap size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Student Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Welcome back to your CampusFlow learning hub
          </p>
        </div>

        {/* Feature 26: Device Mismatch Notification */}
        {deviceWarning && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            color: '#fb7185',
            fontSize: '0.85rem'
          }}>
            <Smartphone size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontWeight: 700 }}>Single Device Session Alert</p>
              <p>{deviceWarning}</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#fb7185',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Gmail Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', paddingRight: '40px' }}
              />
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Logging in...' : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        {/* Quick Demo One-Click Sign In */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '10px' }}>
            ⚡ QUICK DEMO LOGINS (Click to evaluate instantly):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('aarav.sharma@gmail.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
            >
              👨‍💻 Aarav (3rd Yr CS)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('priya.patel@gmail.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
            >
              🎨 Priya (2nd Yr UI)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('rohan.verma@gmail.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
            >
              🚀 Rohan (4th Yr Fullstack)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('sneha.iyer@gmail.com')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', justifyContent: 'flex-start' }}
            >
              📐 Sneha (1st Yr Math)
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
};
