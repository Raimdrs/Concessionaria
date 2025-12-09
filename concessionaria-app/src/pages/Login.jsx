import React, { useState } from 'react';
import { FaBuilding, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // CHAMADA REAL AO BACKEND
      const response = await fetch('http://localhost:5001/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        // --- CORREÇÃO AQUI ---
        // Antes de avisar o App que logou, salvamos os dados no navegador
        // para que o api.js consiga pegar o ID e o Token depois.
        localStorage.setItem('usuario', JSON.stringify(data));

        console.log("Login salvo com sucesso:", data); // Debug para conferência

        // Agora sim, atualiza o estado da aplicação
        onLogin(data); 
      } else {
        // Se deu errado (HTTP 401 ou 404), mostramos a mensagem do backend
        setErro(data.message || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      setErro('Não foi possível conectar ao servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <FaBuilding className="login-logo" />
          <h2>AutoManager</h2>
          <p>Acesse o sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input 
              type="email" 
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="error-msg">{erro}</div>}

          <button type="submit" className="btn-login" disabled={carregando}>
            <FaSignInAlt /> {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;