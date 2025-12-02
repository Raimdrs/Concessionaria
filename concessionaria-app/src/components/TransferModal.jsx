import React, { useState } from 'react';
import './Modal.css';

const TransferModal = ({ veiculo, lojas, onClose, onConfirm }) => {
  const [targetLojaId, setTargetLojaId] = useState('');
  const lojasDisponiveis = lojas.filter(l => l._id !== veiculo.concessionariaId);

  return (
    <div className="modal">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h3>Transferir Veículo</h3>
        <div style={{ margin: '20px 0', padding: '15px', background: '#f8fafc', borderRadius: 8 }}>
          <strong>Veículo:</strong> {veiculo.marca} ({veiculo.chassi})<br/>
          <strong>Origem:</strong> {veiculo.concessionariaNome}
        </div>
        <div className="form-group">
          <label>Selecione a Loja de Destino:</label>
          <select 
            className="form-control" 
            value={targetLojaId} 
            onChange={(e) => setTargetLojaId(e.target.value)}
          >
            <option value="">-- Selecione --</option>
            {lojasDisponiveis.map(loja => (
              <option key={loja._id} value={loja._id}>{loja.nome}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-modal-submit" 
            disabled={!targetLojaId}
            onClick={() => onConfirm(veiculo._id, targetLojaId)}
          >
            Confirmar Transferência
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
