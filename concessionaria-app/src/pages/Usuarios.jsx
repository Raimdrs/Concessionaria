import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaEdit, FaTrash, FaUsers, FaBriefcase, FaStore, FaEnvelope } from 'react-icons/fa';
import { getUsuarios, deleteUsuario } from '../services/usuarioService';
import { getLojas } from '../services/lojaService';
import { useNavigate } from 'react-router-dom';
import './Usuarios.css';

const Usuarios = ({ usuario }) => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState('');

  const getAuthHeaders = () => {
    const userId = usuario?._id || usuario?.id;
    return {
      headers: { 'x-userid': userId }
    };
  };

  const carregarDados = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const [resUsuarios, resLojas] = await Promise.all([
        getUsuarios(getAuthHeaders()),
        getLojas()
      ]);
      
      setUsuarios(resUsuarios.data.usuarios || []);
      setLojas(resLojas.data || []);
      
      if (resUsuarios.data.mensagem) {
        setMensagem(resUsuarios.data.mensagem);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      if (error.response?.data?.mensagem || error.response?.data?.message) {
        setMensagem(error.response.data.mensagem || error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) carregarDados();
  }, [usuario]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await deleteUsuario(id, getAuthHeaders());
      carregarDados();
    } catch (error) {
      alert('Erro ao excluir usuário: ' + (error.response?.data?.message || error.message));
    }
  };

  const getNomeLoja = (lojaId) => {
    if (!lojaId) return 'Sem loja';
    const loja = lojas.find(l => l._id === lojaId);
    return loja ? loja.nome : 'Loja não encontrada';
  };

  const getCargoIcon = (cargo) => {
    switch(cargo) {
      case 'admin': return '👑';
      case 'gerente': return '🏢';
      case 'vendedor': return '💼';
      default: return '👤';
    }
  };

  const getCargoClass = (cargo) => {
    switch(cargo) {
      case 'admin': return 'badge-admin';
      case 'gerente': return 'badge-gerente';
      case 'vendedor': return 'badge-vendedor';
      default: return 'badge-default';
    }
  };

  if (usuario?.cargo === 'vendedor') {
    return (
      <div className="content">
        <div className="permission-denied">
          <FaUsers className="denied-icon" />
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para visualizar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <FaUsers /> Gerenciamento de Usuários
          </h1>
          <p className="page-subtitle">
            {usuario?.cargo === 'admin' ? 'Todos os usuários do sistema' : 'Usuários da sua loja'}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/usuarios/novo')}
          >
            <FaUserPlus /> Novo Usuário
          </button>
        </div>
      </div>

      {mensagem && (
        <div className="info-banner">
          <p>{mensagem}</p>
        </div>
      )}

      <div className="usuarios-section">
        <div className="section-header">
          <h2>Lista de Usuários ({usuarios.length})</h2>
        </div>

        {loading ? (
          <div className="loading-state">Carregando usuários...</div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>Nenhum usuário encontrado</h3>
            <p>Clique em "Novo Usuário" para cadastrar o primeiro usuário.</p>
          </div>
        ) : (
          <div className="usuarios-grid">
            {usuarios.map((user) => (
              <div key={user._id} className="usuario-card">
                <div className="card-header">
                  <div className="user-avatar">
                    {user.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.nome}</h3>
                    <span className={`cargo-badge ${getCargoClass(user.cargo)}`}>
                      {user.cargo}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <FaEnvelope className="info-icon" />
                    <span>{user.email}</span>
                  </div>
                  
                  <div className="info-row">
                    <FaStore className="info-icon" />
                    <span>{getNomeLoja(user.lojaId)}</span>
                  </div>
                </div>

                {usuario?.cargo === 'admin' && (
                  <div className="card-actions">
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => handleDelete(user._id)}
                      title="Excluir usuário"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
