import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span>🍀</span>
          <span>Mega-Sena AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Principal</div>
          
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Dashboard</span>
          </NavLink>

          <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">📊</span>
            <span className="nav-label">Análises</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Estratégias</div>
          
          <NavLink to="/predictor" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🤖</span>
            <span className="nav-label">Gerador IA</span>
          </NavLink>

          <NavLink to="/quadrantes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🔲</span>
            <span className="nav-label">Quadrantes</span>
          </NavLink>

          <NavLink to="/tecnicas-avancadas" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">🧠</span>
            <span className="nav-label">Técnicas Avançadas</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Sistema</div>
          
          <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Configurações</span>
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div>© 2025 Mega-Sena AI</div>
      </div>
    </aside>
  );
}

export default Sidebar;
