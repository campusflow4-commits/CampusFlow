import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, Copy, Check, Gift, Users, Coins, Share2 } from 'lucide-react';

export const InviteFriendsPage = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const referralCode = user?.referralCode || 'SKILL-SWAP26';
  const inviteUrl = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '780px' }}>
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="badge badge-primary" style={{ marginBottom: '12px' }}>
          <Gift size={15} color="#f59e0b" /> Community Referral Program
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>
          Invite Friends. <span className="text-gradient">Earn Credits.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.05rem', lineHeight: 1.5 }}>
          Share your love for peer-to-peer learning. When a classmate signs up using your invite code, <strong style={{ color: '#fcd34d' }}>both of you get 25 bonus credits</strong>!
        </p>
      </div>

      {/* Share Box Card */}
      <div className="glass-card" style={{ padding: '32px', marginBottom: '28px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '14px' }}>Your Personal Invite Link</h3>

        <div style={{
          display: 'flex',
          gap: '10px',
          background: 'var(--bg-surface)',
          padding: '8px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="form-input"
            style={{ background: 'transparent', border: 'none', fontSize: '0.9rem', color: '#a5b4fc' }}
          />
          <button onClick={handleCopy} className="btn btn-primary btn-sm" style={{ padding: '8px 18px', flexShrink: 0 }}>
            {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
          </button>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Referral Code:</span>
          <strong style={{ letterSpacing: '1px', color: '#fcd34d' }}>{referralCode}</strong>
        </div>
      </div>

      {/* Referral Stats Cards */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <Users size={28} color="#6366f1" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Classmates Invited</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{user?.referralCount || 0}</h3>
        </div>

        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <Coins size={28} color="#f59e0b" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Referral Credits Earned</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#fcd34d', marginTop: '4px' }}>
            {(user?.referralCount || 0) * 25}
          </h3>
        </div>
      </div>

      {/* Program Details */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h4 style={{ fontSize: '1.05rem', marginBottom: '12px' }}>How Referral Rewards Work:</h4>
        <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
          <li>Send your link to students at your university or college.</li>
          <li>They must register using their valid Gmail address.</li>
          <li>Upon registration, the system automatically deposits 25 credits to your account and 25 extra credits to theirs.</li>
          <li>Fake or duplicate accounts are automatically blocked by our single-device detection system.</li>
        </ul>
      </div>
    </div>
  );
};
