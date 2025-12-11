import React, { useState, useEffect } from 'react';
import { FaBuilding, FaPlus } from 'react-icons/fa';
import { getLojas, createLoja } from '../services/lojaService'; 
import './LojaSelector.css';
import './Modal.css';

const LojaSelector = ({ lojaSelecionada, onLojaChange, usuario }) => {
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [novaLoja, setNovaLoja] = useState({ nome: '', cnpj: '' });

  useEffect(() => {
    if (usuario) {
      carregarLojas();
    }
  }, [usuario]);

  const getAuthHeaders = () => {
    const userId = usuario?._id || usuario?.id;
    return {
      headers: { 'x-userid': userId }
    };
  };

  const carregarLojas = async () => {
    setLoading(true);
    try {
      const response = await getLojas(getAuthHeaders());
      setLojas(response.data);
      
      // Se não há loja selecionada, pega a primeira da lista correta
      if (!lojaSelecionada && response.data.length > 0) {
        onLojaChange(response.data[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar concessionárias:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarLoja = async (e) => {
    e.preventDefault();
    try {
      const response = await createLoja(novaLoja);
      setLojas([...lojas, response.data]);
      setNovaLoja({ nome: '', cnpj: '' });
      setShowModal(false);
      onLojaChange(response.data); 
    } catch (error) {
      console.error('Erro ao criar loja:', error);
      alert('Erro ao criar loja: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="loja-selector">
      <FaBuilding className="loja-icon" />
      <select 
        value={lojaSelecionada?._id || ''} 
        onChange={(e) => {
          const loja = lojas.find(l => l._id === e.target.value);
          onLojaChange(loja);
        }}
        className="loja-select"
        disabled={loading}
      >
        <option value="">Selecione uma Loja</option>
        {lojas.map(loja => (
          <option key={loja._id} value={loja._id}>
            {loja.nome}
          </option>
        ))}
      </select>
      
      {usuario?.cargo === 'admin' && (
        <button onClick={() => setShowModal(true)} className="btn-nova-loja">
          <FaPlus /> Nova Loja
        </button>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            <h2>Nova Concessionária</h2>
            <form onSubmit={criarLoja}>
              <div className="form-group">
                <label>Nome da Loja</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Matriz São Paulo"
                  value={novaLoja.nome}
                  onChange={(e) => setNovaLoja({...novaLoja, nome: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="00.000.000/0001-00"
                  value={novaLoja.cnpj}
                  onChange={(e) => setNovaLoja({...novaLoja, cnpj: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-modal-submit">Criar Loja</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LojaSelector;