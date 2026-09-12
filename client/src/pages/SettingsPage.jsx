import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api, getDeviceId } from '../services/api.js';
import { 
  User, 
  Lock, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Save 
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile, refreshUser, logout } = useAuth();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [year, setYear] = useState(user?.year || '2nd Year');
  const [college, setCollege] = useState(user?.college || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skillsToTeach, setSkillsToTeach] = useState((user?.skillsToTeach || []).join(', '));
  const [skillsToLearn, setSkillsToLearn] = useState((user?.skillsToLearn || []).join(', '));

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Credits history
  const [creditLedger, setCreditLedger] = useState({ currentBalance: 50, transactions: [] });

  // Notifications
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setYear(user.year);
      setCollege(user.college || '');
      setBio(user.bio || '');
      setSkillsToTeach((user.skillsToTeach || []).join(', '));
      setSkillsToLearn((user.skillsToLearn || []).join(', '));
    }

    const loadCredits = async () => {
      try {
        const data = await api.get('/credits/history');
        setCreditLedger(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadCredits();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const teachArr = skillsToTeach.split(',').map(s => s.trim()).filter(Boolean);
      const learnArr = skillsToLearn.split(',').map(s => s.trim()).filter(Boolean);

      await updateProfile({
        name,
        year,
        college,
        bio,
        skillsToTeach: teachArr,
        skillsToLearn: learnArr
      });

      setProfileMsg({ type: 'success', text: 'Student profile updated successfully!' });
      refreshUser();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const deviceId = getDeviceId();
  const trialDays = user?.trialDaysRemaining ?? 7;

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Account <span className="text-gradient">Settings</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          Manage your student identity, credits ledger, device session, and security.
        </p>
      </div>

      {/* Free Trial Banner */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        marginBottom: '28px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span className="badge badge-primary" style={{ marginBottom: '6px' }}>
            <Sparkles size={13} /> Active Plan: Student Free Trial
          </span>
          <h3 style={{ fontSize: '1.15rem' }}>{trialDays} Days Remaining on 7-Day Free Trial</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Valid until {new Date(user?.trialEndDate || Date.now() + 7 * 86400000).toLocaleDateString()}
          </p>
        </div>
        <span className="badge badge-emerald" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
          ✓ All Platform Features Unlocked
        </span>
      </div>

      {/* Edit Profile */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={20} color="#6366f1" />
          <h3 style={{ fontSize: '1.25rem' }}>Student Profile Information</h3>
        </div>

        {profileMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            background: profileMsg.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: profileMsg.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institute</label>
            <input
              type="text"
              className="form-input"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio (Brief introduction for potential swap partners)</label>
            <textarea
              rows={3}
              className="form-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#6ee7b7' }}>
              Skills You Can Teach (comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, UI/UX Design, Figma, Guitar"
              value={skillsToTeach}
              onChange={(e) => setSkillsToTeach(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#a5b4fc' }}>
              Skills You Want to Learn (comma separated)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. React, Data Structures, Machine Learning"
              value={skillsToLearn}
              onChange={(e) => setSkillsToLearn(e.target.value)}
            />
          </div>

          <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Lock size={20} color="#8b5cf6" />
          <h3 style={{ fontSize: '1.25rem' }}>Change Account Password</h3>
        </div>

        {passwordMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '16px',
            background: passwordMsg.type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
            color: passwordMsg.type === 'error' ? '#fb7185' : '#6ee7b7',
            fontSize: '0.85rem'
          }}>
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={savingPassword} className="btn btn-secondary" style={{ padding: '10px 24px' }}>
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Feature 26: One Device -> One Account Manager */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Smartphone size={20} color="#10b981" />
          <h3 style={{ fontSize: '1.25rem' }}>Single Device Session Protection</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.6 }}>
          CampusFlow enforces basic active session protection. If your account is accessed from another browser or device, your current session will automatically terminate to protect your credits and student data.
        </p>

        <div style={{
          padding: '14px 18px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Current Browser / Device Identifier:</p>
            <p style={{ fontSize: '0.78rem', color: '#a5b4fc', fontFamily: 'monospace', marginTop: '2px' }}>
              {deviceId}
            </p>
          </div>
          <span className="badge badge-emerald">
            ✓ Active & Linked Session
          </span>
        </div>
      </div>

      {/* Credit Ledger / Transactions History */}
      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Coins size={20} color="#f59e0b" />
            <h3 style={{ fontSize: '1.25rem' }}>Credit Transaction History</h3>
          </div>
          <span className="badge badge-amber" style={{ fontSize: '0.9rem' }}>
            Balance: {creditLedger.currentBalance} Credits
          </span>
        </div>

        {creditLedger.transactions?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {creditLedger.transactions.map((t) => (
              <div key={t._id} style={{
                padding: '12px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.description}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
                <span style={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  color: t.amount > 0 ? '#10b981' : '#f43f5e'
                }}>
                  {t.amount > 0 ? `+${t.amount}` : t.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No credit transactions logged.</p>
        )}
      </div>
    </div>
  );
};
