import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Smartphone } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, deviceWarning } = useAuth();
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
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Decorative Glow */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)',
        filter: 'blur(40px)',
        zIndex: 0,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }} />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 900, 
          background: 'linear-gradient(to right, #a855f7, #3b82f6)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent', 
          margin: '0 0 6px 0', 
          letterSpacing: '-0.02em',
          fontFamily: 'var(--font-heading)'
        }}>
          CampusFlow
        </h1>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.8rem', 
          letterSpacing: '0.15em', 
          margin: 0,
          fontWeight: 600,
          textTransform: 'uppercase'
        }}>
          Learn &bull; Connect &bull; Grow
        </p>
      </div>

      {/* Login Card */}
      <div style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '36px',
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 1
      }}>
        
        {/* Top Badge */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '20px',
            color: '#c084fc',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            ✦ CAMPUS EXCLUSIVE V1.0
          </span>
        </div>

        {deviceWarning && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
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
              <p style={{ fontWeight: 700, margin: '0 0 2px 0' }}>Single Device Session Alert</p>
              <p style={{ margin: 0 }}>{deviceWarning}</p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
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
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Your campus email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 14px 14px 42px', 
                  background: 'rgba(2, 6, 23, 0.5)', 
                  border: '1px solid rgba(139, 92, 246, 0.2)', 
                  borderRadius: '16px', 
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
              />
              <Mail size={18} color="#8b5cf6" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#cbd5e1', marginBottom: '8px' }}>
              Your password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 42px 14px 42px', 
                  background: 'rgba(2, 6, 23, 0.5)', 
                  border: '1px solid rgba(139, 92, 246, 0.2)', 
                  borderRadius: '16px', 
                  color: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
              />
              <Lock size={18} color="#8b5cf6" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', 
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.1s, opacity 0.2s',
              marginBottom: '24px'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = 'translateY(1px)')}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
          >
            {loading ? 'Logging in...' : "Let's Go ⚡"}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#c084fc'} onMouseOut={(e) => e.target.style.color = '#a855f7'}>
              Register
            </Link>
          </p>
        </div>

        {/* Minimal Demo Logins */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Demo Accounts
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {['aarav.sharma@gmail.com', 'priya.patel@gmail.com', 'rohan.verma@gmail.com', 'sneha.iyer@gmail.com'].map((email, idx) => {
              const names = ['Aarav', 'Priya', 'Rohan', 'Sneha'];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickDemoLogin(email)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#cbd5e1',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  {names[idx]}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
