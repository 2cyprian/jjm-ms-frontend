import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg)',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        background: 'var(--surface)',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(31, 41, 55, 0.15)',
        maxWidth: '500px',
        border: '1px solid var(--border)'
      }}>
        <FaLock style={{
          fontSize: '4rem',
          color: 'var(--accent)',
          marginBottom: '1rem'
        }} />
        
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: 'var(--primary)',
          margin: '0 0 1rem 0'
        }}>
          403 - Access Forbidden
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--muted)',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          You don't have permission to access this resource. Your user role or account privileges don't allow access to this section.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/staff')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--accent)',
              color: 'var(--primary)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'opacity 0.3s'
            }}
            onMouseOver={(e) => e.target.style.opacity = '0.8'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
