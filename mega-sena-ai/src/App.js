import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Home from './pages/Home';
import Predictor from './pages/Predictor';
import Analytics from './pages/Analytics';
import Quadrants from './pages/Quadrants';
import AdvancedTechniques from './pages/AdvancedTechniques';
import Settings from './pages/Settings';
import './styles/desktop.css';

function AppContent() {
  const location = useLocation();
  
  const getTitleByPath = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard';
      case '/predictor': return 'Gerador de Apostas';
      case '/analytics': return 'Análises Estatísticas';
      case '/quadrantes': return 'Supressão de Quadrantes';
      case '/tecnicas-avancadas': return 'Técnicas Avançadas';
      case '/settings': return 'Configurações';
      default: return 'Mega-Sena AI';
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar title={getTitleByPath()} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predictor" element={<Predictor />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/quadrantes" element={<Quadrants />} />
          <Route path="/tecnicas-avancadas" element={<AdvancedTechniques />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
