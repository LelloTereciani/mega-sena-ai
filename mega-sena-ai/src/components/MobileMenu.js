import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function MobileMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      icon: '🏠',
      label: 'Dashboard',
      path: '/',
      description: 'Página inicial'
    },
    {
      icon: '⚙️',
      label: 'Configurações',
      path: '/settings',
      description: 'Importar dados'
    }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '6px',
          right: '10px',
          zIndex: 2000,
          width: '48px',
          height: '48px',
          background: isOpen ? '#ef4444' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <span style={{
          width: '26px',
          height: '3px',
          background: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg) translateY(8px)' : 'none'
        }}></span>
        <span style={{
          width: '26px',
          height: '3px',
          background: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          opacity: isOpen ? 0 : 1
        }}></span>
        <span style={{
          width: '26px',
          height: '3px',
          background: 'white',
          borderRadius: '2px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(-45deg) translateY(-8px)' : 'none'
        }}></span>
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1500
          }}
        />
      )}

      <div style={{
        position: 'fixed',
        top: '70px',
        right: isOpen ? '10px' : '-320px',
        width: '280px',
        maxHeight: 'calc(100vh - 90px)',
        background: '#ffffff',
        zIndex: 1600,
        transition: 'right 0.3s ease',
        boxShadow: isOpen ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0'
      }}>
        
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🍀</span>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>Mega-Sena AI</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Sistema Inteligente</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '0.5rem 0' }}>
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: isActive ? '#f0fdf4' : 'transparent',
                  borderRight: isActive ? '4px solid #22c55e' : '4px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{ 
                  fontSize: '1.6rem',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? '#22c55e' : '#f1f5f9',
                  borderRadius: '10px'
                }}>
                  {item.icon}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: isActive ? '#166534' : '#1e293b' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isActive ? '#22c55e' : '#64748b' }}>
                    {item.description}
                  </div>
                </div>
                {isActive && <span style={{ fontSize: '1.1rem', color: '#22c55e' }}>✓</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '0.75rem 1rem', background: '#fef3c7', borderTop: '2px solid #fde68a' }}>
          <div style={{ fontSize: '0.75rem', color: '#92400e', display: 'flex', gap: '0.5rem' }}>
            <span>💡</span>
            <div><strong>Dica:</strong> Acesse módulos via Dashboard</div>
          </div>
        </div>

        <div style={{ padding: '0.75rem 1rem', borderTop: '2px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={() => {
              window.open('https://github.com/seu-usuario/mega-sena-ai', '_blank');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '0.65rem',
              background: 'white',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: '#1e293b'
            }}
          >
            <span>📖</span>
            Documentação
          </button>
          
          <div style={{ marginTop: '0.5rem', textAlign: 'center', fontSize: '0.65rem', color: '#94a3b8' }}>
            v1.0.0 • 2025
          </div>
        </div>

      </div>
    </>
  );
}

export default MobileMenu;
