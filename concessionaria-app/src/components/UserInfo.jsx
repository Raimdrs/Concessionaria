import React, { useState } from 'react';
import { FaUser, FaChevronDown, FaSignOutAlt, FaCog } from 'react-icons/fa';
import './UserInfo.css';

// 1. RECEBA A FUNÇÃO onLogout AQUI
const UserInfo = ({ usuario, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="user-info">
      <div 
        className="user-profile" 
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="user-avatar">
          <FaUser />
        </div>
        <div className="user-details">
          <span className="user-name">{usuario.nome}</span>
          <span className="user-role">{usuario.cargo}</span>
        </div>
        <FaChevronDown className={`dropdown-icon ${showDropdown ? 'rotated' : ''}`} />
      </div>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-email">{usuario.email}</div>
          </div>
          <div className="dropdown-divider"></div>
          
          <button className="dropdown-item">
            <FaCog className="dropdown-item-icon" />
            Configurações
          </button>
          
          {/* 2. ADICIONE O EVENTO onClick AQUI */}
          <button className="dropdown-item logout" onClick={onLogout}>
            <FaSignOutAlt className="dropdown-item-icon" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default UserInfo;