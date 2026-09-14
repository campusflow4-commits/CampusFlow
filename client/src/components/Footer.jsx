import React from 'react';
import { GraduationCap, Heart } from 'lucide-react';

export const Footer = () => {
  const creators = ['Akshra', 'Vanshika', 'Parth', 'Kashif'];

  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      padding: '32px 0 24px 0',
      marginTop: '60px',
      background: 'rgba(11, 15, 25, 0.4)',
      backdropFilter: 'blur(8px)'
    }}>
      <div className="container" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="brand-icon" style={{ width: '30px', height: '30px' }}>
  <img src="/assets/campusflow_logo.jpeg" alt="CampusFlow Logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "inherit" }} />
</div>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
            Campus<span className="text-gradient">Flow</span>
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: '8px' }}>
            Learn a skill. Teach a skill. Grow together.
          </span>
        </div>

        {/* Creator Team Credits */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          color: 'var(--text-muted)',
          fontSize: '0.85rem'
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <span>Created by</span>
            <Heart size={13} color="#ec4899" fill="#ec4899" />
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {creators.map((name, index) => (
              <React.Fragment key={name}>
                <span style={{
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  letterSpacing: '0.2px'
                }}>
                  {name}
                </span>
                {index < creators.length - 1 && (
                  <span style={{ color: 'var(--border-color)', userSelect: 'none' }}>•</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
