import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUser, FaLock, FaEnvelope, FaUserPlus, FaArrowLeft, FaBriefcase, FaStore } from 'react-icons/fa';
import { getLojas } from '../services/lojaService';
import { useLocation } from 'react-router-dom';

const CadastroUsuario = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detecta se está dentro do sistema (rota /usuarios/novo) ou página pública
  const isDentroDoSistema = location.pathname === '/usuarios/novo';
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'vendedor',
    lojaId: ''
  });
  const [lojas, setLojas] = useState([]);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const response = await getLojas();
        setLojas(response.data);
      } catch (error) {
        console.error('Erro ao carregar lojas:', error);
      }
    };
    carregarLojas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setCarregando(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso('Usuário cadastrado com sucesso!');
        setFormData({ nome: '', email: '', senha: '', cargo: 'vendedor', lojaId: '' });
        
        // Se estiver dentro do sistema, não redireciona para login
        if (!isDentroDoSistema) {
          setTimeout(() => navigate('/login'), 2000);
        }
      } else {
        setErro(data.message || 'Erro ao cadastrar usuário');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-card">
        <div className="cadastro-header">
          <FaBuilding className="cadastro-logo" />
          <h2>AutoManager</h2>
          <p>Criar nova conta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input 
              type="text" 
              name="nome"
              placeholder="Nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input 
              type="email" 
              name="email"
              placeholder="Seu email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              name="senha"
              placeholder="Sua senha"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaBriefcase className="input-icon" />
            <select 
              name="cargo" 
              value={formData.cargo} 
              onChange={handleChange}
              required
            >
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="input-group">
            <FaStore className="input-icon" />
            <select 
              name="lojaId" 
              value={formData.lojaId} 
              onChange={handleChange}
            >
              <option value="">Selecione uma loja (opcional)</option>
              {lojas.map(loja => (
                <option key={loja._id} value={loja._id}>{loja.nome}</option>
              ))}
            </select>
          </div>

          {erro && <div className="error-msg">{erro}</div>}
          {sucesso && <div className="success-msg">{sucesso}</div>}

          <button type="submit" className="btn-cadastro" disabled={carregando}>
            <FaUserPlus /> {carregando ? 'CADASTRANDO...' : 'CADASTRAR'}
          </button>

          {!isDentroDoSistema && (
            <Link to="/login" className="link-voltar">
              <FaArrowLeft /> Já tem conta? Faça login
            </Link>
          )}
        </form>
      </div>
      
      <style>{`
        .cadastro-container { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
        .cadastro-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 100%; max-width: 450px; text-align: center; }
        .cadastro-header { margin-bottom: 30px; }
        .cadastro-logo { font-size: 40px; color: #1e3c72; margin-bottom: 10px; }
        .cadastro-header h2 { color: #333; margin: 0; }
        .cadastro-header p { color: #777; margin-top: 5px; font-size: 14px; }
        .input-group { position: relative; margin-bottom: 20px; }
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa; }
        .input-group input, .input-group select { width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.3s; background: white; }
        .input-group input:focus, .input-group select:focus { border-color: #1e3c72; }
        .btn-cadastro { width: 100%; padding: 12px; background: #1e3c72; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.3s; }
        .btn-cadastro:hover { background: #162c54; }
        .btn-cadastro:disabled { background: #ccc; cursor: not-allowed; }
        .error-msg { background: #ffebee; color: #c62828; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
        .success-msg { background: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
        .link-voltar { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 20px; color: #1e3c72; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.3s; }
        .link-voltar:hover { color: #162c54; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default CadastroUsuario;