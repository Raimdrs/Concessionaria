import React, { useState } from 'react';
import { FaBuilding, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

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
        // Se deu certo (HTTP 200), o backend devolve os dados do usuário
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
      
      {/* Mantenha o estilo CSS igual ao anterior... */}
      <style>{`
        .login-container { height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
        .login-card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); width: 100%; max-width: 400px; text-align: center; }
        .login-header { margin-bottom: 30px; }
        .login-logo { font-size: 40px; color: #1e3c72; margin-bottom: 10px; }
        .login-header h2 { color: #333; margin: 0; }
        .login-header p { color: #777; margin-top: 5px; font-size: 14px; }
        .input-group { position: relative; margin-bottom: 20px; }
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #aaa; }
        .input-group input { width: 100%; padding: 12px 12px 12px 45px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; outline: none; transition: border-color 0.3s; }
        .input-group input:focus { border-color: #1e3c72; }
        .btn-login { width: 100%; padding: 12px; background: #1e3c72; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: background 0.3s; }
        .btn-login:hover { background: #162c54; }
        .btn-login:disabled { background: #ccc; cursor: not-allowed; }
        .error-msg { background: #ffebee; color: #c62828; padding: 10px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default Login;