import React from 'react';
import { Link } from 'react-router-dom';
import { Repeat, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '75vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div className="brand-icon" style={{ width: '56px', height: '56px', marginBottom: '20px' }}>
        <Repeat size={32} />
      </div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '400px', margin: '8px auto 24px auto' }}>
        Oops! The skill page or study resource you are looking for does not exist.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={18} /> Return to CampusFlow
      </Link>
    </div>
  );
};
