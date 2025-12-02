import React from 'react';
import './Modal.css';

const ConcessionariaModal = ({ onClose, onSave }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      nome: e.target.nome.value, 
      cnpj: e.target.cnpj.value 
    });
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Nova Concessionária</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Nome da Loja</label><input name="nome" className="form-control" required placeholder="Ex: Matriz - SP" /></div>
          <div className="form-group"><label>CNPJ</label><input name="cnpj" className="form-control" required placeholder="00.000.000/0001-00" /></div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-modal-submit">Criar Loja</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConcessionariaModal;
