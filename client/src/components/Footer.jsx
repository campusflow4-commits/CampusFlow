import React from 'react';
import { Repeat, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '40px 0 24px 0',
      marginTop: '60px',
      background: 'rgba(11, 15, 25, 0.7)'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '32px', height: '32px' }}>
            <Repeat size={18} />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
            Skill<span className="text-gradient">Swap</span>
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>
            "Learn a skill. Teach a skill. Grow together."
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <span>Crafted for student peer-learning</span>
          <Heart size={14} color="#f43f5e" fill="#f43f5e" />
          <span>National Hackathon Edition 2026</span>
        </div>
      </div>
    </footer>
  );
};
