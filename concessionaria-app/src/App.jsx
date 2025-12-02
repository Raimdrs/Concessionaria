
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaCar, FaChartLine, FaBuilding } from 'react-icons/fa';
import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import Relatorios from './pages/Relatorios';
import LojaSelector from './components/LojaSelector';
import UserInfo from './components/UserInfo';
import './index.css';

const Sidebar = ({ lojaSelecionada }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <FaBuilding className="icon" />
          <span className="text">AutoManager</span>
        </div>
      </div>

      {lojaSelecionada && (
        <div className="loja-info">
          <div className="loja-badge">
            <FaBuilding className="loja-badge-icon" />
            <span className="loja-badge-text">{lojaSelecionada.nome}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <FaTachometerAlt className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/veiculos" className={`nav-item ${isActive('/veiculos') ? 'active' : ''}`}>
          <FaCar className="nav-icon" />
          <span className="nav-text">Veículos</span>
        </Link>
        <Link to="/relatorios" className={`nav-item ${isActive('/relatorios') ? 'active' : ''}`}>
          <FaChartLine className="nav-icon" />
          <span className="nav-text">Relatórios</span>
        </Link>
      </nav>
    </aside>
  );
};

const Topbar = ({ lojaSelecionada, onLojaChange, usuario }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Gestão de Veículos</h1>
        <LojaSelector 
          lojaSelecionada={lojaSelecionada}
          onLojaChange={onLojaChange}
        />
      </div>
      <div className="topbar-right">
        <UserInfo usuario={usuario} />
      </div>
    </header>
  );
};

function App() {
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  
  // Dados do usuário (temporários - será integrado com API depois)
  const [usuario] = useState({
    nome: 'João Silva',
    cargo: 'Gerente',
    email: 'joao@concessionaria.com'
  });

  return (
    <Router>
      <div className="app-layout">
        <Sidebar lojaSelecionada={lojaSelecionada} />
        <main className="main-content">
          <Topbar 
            lojaSelecionada={lojaSelecionada}
            onLojaChange={setLojaSelecionada}
            usuario={usuario}
          />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Dashboard lojaSelecionada={lojaSelecionada} />} />
              <Route path="/veiculos" element={<Veiculos lojaSelecionada={lojaSelecionada} />} />
              <Route path="/relatorios" element={<Relatorios lojaSelecionada={lojaSelecionada} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;