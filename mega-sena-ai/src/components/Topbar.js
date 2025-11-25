import React from 'react';

function Topbar({ title = 'Dashboard' }) {
  return (
    <div className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        🟢 Estratégias de IA e o poder da Ciência de Dados !
      </div>
    </div>
  );
}

export default Topbar;
