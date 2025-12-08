import React, { useState } from 'react';
import { FaUserPlus, FaSave } from 'react-icons/fa';

const CadastroUsuario = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'vendedor',
    lojaId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // CONEXÃO COM O BACKEND AQUI
      const response = await fetch('http://localhost:5001/api/usuarios/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuário cadastrado com sucesso!');
        // Limpar formulário
        setFormData({ nome: '', email: '', senha: '', cargo: 'vendedor', lojaId: '' });
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2><FaUserPlus /> Novo Usuário</h2>
      </div>

      <form onSubmit={handleSubmit} className="form-cadastro">
        <div className="form-group">
          <label>Nome Completo</label>
          <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="row">
          <div className="form-group">
            <label>Senha</label>
            <input type="password" name="senha" value={formData.senha} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Cargo</label>
            <select name="cargo" value={formData.cargo} onChange={handleChange}>
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary">
          <FaSave /> Salvar Usuário
        </button>
      </form>
      
      {/* Mantenha o seu estilo CSS aqui embaixo... */}
      <style>{`
        .form-cadastro { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; }
        .form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
        .form-group label { margin-bottom: 5px; font-weight: bold; color: #444; }
        .form-group input, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .row { display: flex; gap: 15px; }
        .row .form-group { flex: 1; }
        .btn-primary { background-color: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 16px; }
        .btn-primary:hover { background-color: #0056b3; }
      `}</style>
    </div>
  );
};

export default CadastroUsuario;