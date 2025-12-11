import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FaTachometerAlt, FaCar, FaChartLine, FaBuilding, FaUserPlus, FaUsers } from 'react-icons/fa';

import Dashboard from './pages/Dashboard';
import Veiculos from './pages/Veiculos';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';
import CadastroUsuario from './pages/CadastroUsuario';
import Login from './pages/Login';

import LojaSelector from './components/LojaSelector';
import UserInfo from './components/UserInfo';
import './index.css';

// --- COMPONENTE DE SEGURANÇA ---
const RotaProtegida = ({ children, cargosPermitidos, usuario }) => {
  if (!usuario) return <Login />; 
  
  if (!cargosPermitidos.includes(usuario.cargo)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// --- SIDEBAR ---
const Sidebar = ({ lojaSelecionada, usuario }) => {
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
        
        {['gerente', 'admin'].includes(usuario?.cargo) && (
          <Link to="/relatorios" className={`nav-item ${isActive('/relatorios') ? 'active' : ''}`}>
            <FaChartLine className="nav-icon" />
            <span className="nav-text">Relatórios</span>
          </Link>
        )}

        {['gerente', 'admin'].includes(usuario?.cargo) && (
          <Link to="/usuarios" className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}>
            <FaUsers className="nav-icon" />
            <span className="nav-text">Usuários</span>
          </Link>
        )}
      </nav>
    </aside>
  );
};

// --- TOPBAR (CORRIGIDO) ---
const Topbar = ({ lojaSelecionada, onLojaChange, usuario, onLogout }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Gestão de Veículos</h1>
        <LojaSelector 
          lojaSelecionada={lojaSelecionada}
          onLojaChange={onLojaChange}
          usuario={usuario}
        />
      </div>
      <div className="topbar-right">
        {/* AQUI ESTAVA O DETALHE: Passamos onLogout para dentro do UserInfo */}
        {/* E removi o botão solto que estava aqui antes para não ficar duplicado */}
        <UserInfo usuario={usuario} onLogout={onLogout} />
      </div>
    </header>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const [usuario, setUsuario] = useState(null);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);

  const handleLogin = (dadosUsuario) => {
    setUsuario(dadosUsuario);
  };

  const handleLogout = () => {
    setUsuario(null);
    // Se quiser limpar o localStorage também:
    // localStorage.removeItem('usuario');
  };

  return (
    <Router>
      {!usuario ? (
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/cadastro" element={<CadastroUsuario />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <div className="app-layout">
          <Sidebar lojaSelecionada={lojaSelecionada} usuario={usuario} />
          
          <main className="main-content">
            <Topbar 
              lojaSelecionada={lojaSelecionada}
              onLojaChange={setLojaSelecionada}
              usuario={usuario}
              onLogout={handleLogout}
            />
            
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<Dashboard lojaSelecionada={lojaSelecionada} usuario={usuario} />} />
                <Route path="/veiculos" element={<Veiculos lojaSelecionada={lojaSelecionada} usuario={usuario} />} />
                
                <Route 
                  path="/relatorios" 
                  element={
                    <RotaProtegida cargosPermitidos={['gerente', 'admin']} usuario={usuario}>
                      <Relatorios lojaSelecionada={lojaSelecionada} usuario={usuario} />
                    </RotaProtegida>
                  } 
                />
                
                <Route 
                  path="/usuarios" 
                  element={
                    <RotaProtegida cargosPermitidos={['gerente', 'admin']} usuario={usuario}>
                      <Usuarios usuario={usuario} />
                    </RotaProtegida>
                  } 
                />
                
                <Route 
                  path="/usuarios/novo" 
                  element={
                    <RotaProtegida cargosPermitidos={['admin']} usuario={usuario}>
                      <CadastroUsuario />
                    </RotaProtegida>
                  } 
                />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;