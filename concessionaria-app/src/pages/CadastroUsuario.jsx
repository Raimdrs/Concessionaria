import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSave, FaStore } from 'react-icons/fa';
import { getConcessionarias } from '../services/concessionariaService';
import './CadastroUsuario.css'; // <--- IMPORTANTE: O estilo novo vem daqui agora

const CadastroUsuario = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'vendedor',
    lojaId: ''
  });

  const [lojas, setLojas] = useState([]);

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        const response = await getConcessionarias();
        setLojas(response.data);
      } catch (error) {
        console.error("Erro ao buscar lojas:", error);
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
    if (formData.cargo !== 'admin' && !formData.lojaId) {
      alert("Para Vendedores e Gerentes, é obrigatório selecionar uma Loja!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/usuarios/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuário cadastrado com sucesso!');
        setFormData({ nome: '', email: '', senha: '', cargo: 'vendedor', lojaId: '' });
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="page-container-centered">
      <div className="form-wrapper">
        <div className="page-header-simple">
          <h2><FaUserPlus /> Novo Usuário</h2>
          <p>Cadastre membros da equipe e defina suas permissões.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-cadastro">
          <div className="form-group">
            <label>Nome Completo</label>
            <input 
              type="text" 
              name="nome"
              value={formData.nome} 
              onChange={handleChange} 
              required 
              placeholder="Ex: Maria Oliveira"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="email@empresa.com"
            />
          </div>

          <div className="row-split">
            <div className="form-group">
              <label>Senha Provisória</label>
              <input 
                type="password" 
                name="senha"
                value={formData.senha} 
                onChange={handleChange} 
                required 
              />
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

          <div className="form-group">
            <label><FaStore style={{marginRight: '6px'}}/> Vincular à Loja</label>
            <select 
              name="lojaId" 
              value={formData.lojaId} 
              onChange={handleChange}
              required={formData.cargo !== 'admin'}
              className={formData.cargo === 'admin' ? 'disabled-look' : ''}
            >
              <option value="">-- Selecione a Loja --</option>
              {lojas.map(loja => (
                <option key={loja._id} value={loja._id}>
                  {loja.nome} - {loja.cidade}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-save">
            <FaSave /> Salvar Usuário
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroUsuario;