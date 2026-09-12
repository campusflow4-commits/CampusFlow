import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Repeat, Mail, Lock, User, GraduationCap, Building2, UserPlus, AlertCircle, Gift } from 'lucide-react';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    year: '2nd Year',
    college: '',
    password: '',
    confirmPassword: '',
    referralCodeInput: searchParams.get('ref') || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please provide a valid Gmail address (@gmail.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px auto', width: '44px', height: '44px' }}>
            <Repeat size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Join CampusFlow</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Get 50 Starter Credits + 7-Day Free Trial
          </p>
        </div>

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
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                required
                className="form-input"
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
              />
              <User size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Gmail Address (@gmail.com only)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="studentname@gmail.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
              />
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <div style={{ position: 'relative' }}>
                <select
                  name="year"
                  className="form-select"
                  value={formData.year}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Alumni">Alumni</option>
                </select>
                <GraduationCap size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">College / Branch</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={formData.college}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="password"
                  required
                  className="form-input"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={14} color="#f59e0b" /> Friend's Referral Code (Optional, +25 Credits)
            </label>
            <input
              type="text"
              name="referralCodeInput"
              className="form-input"
              placeholder="e.g. SKILL-AARAV1"
              value={formData.referralCodeInput}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            {loading ? 'Setting up profile...' : <><UserPlus size={18} /> Complete Registration</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600 }}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};
