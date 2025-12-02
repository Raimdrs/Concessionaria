import React from 'react';
import { fmtBRL } from '../services/utils';

const VehicleRow = ({ veiculo, onEdit, onDelete, onSell, onTransfer }) => {
  const pVenda = parseFloat(veiculo.precoVenda) || 0;
  const pCompra = parseFloat(veiculo.precoCompra) || 0;
  const custos = parseFloat(veiculo.custos) || 0;
  const custoTotal = pCompra + custos;
  const lucro = pVenda - custoTotal;
  const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;
  const margemClass = margem < 10 ? 'margin-low' : margem < 30 ? 'margin-medium' : 'margin-high';
  
  const dataDesde = veiculo.dataTransferencia 
    ? new Date(veiculo.dataTransferencia).toLocaleDateString('pt-BR')
    : 'Original';

  const getTypeIcon = (tipo) => {
    switch(tipo) {
      case 'Automovel': return '🚗';
      case 'Moto': return '🏍️';
      case 'Caminhao': return '🚛';
      default: return '🚙';
    }
  };

  return (
    <tr className="vehicle-row">
      <td className="col-photo">
        <div className="vehicle-photo">
          {veiculo.imagem ? 
            <img src={veiculo.imagem} alt="Veículo" /> : 
            <div className="photo-placeholder">
              <span>{getTypeIcon(veiculo.tipo)}</span>
            </div>
          }
        </div>
      </td>
      <td className="col-origin">
        <div className="origin-info">
          <span className="origin-name">{veiculo.concessionariaNome}</span>
          <span className="origin-date">{dataDesde}</span>
        </div>
      </td>
      <td className="col-type">
        <span className="type-icon" title={veiculo.tipo}>
          {getTypeIcon(veiculo.tipo)}
        </span>
      </td>
      <td className="col-vehicle">
        <div className="vehicle-info">
          <div className="vehicle-name">
            <span className="brand">{veiculo.marca}</span>
            <span className="year">({veiculo.ano})</span>
          </div>
          <div className="vehicle-details">
            <span className={`condition ${veiculo.condicao.toLowerCase()}`}>{veiculo.condicao}</span>
            <span className="separator">•</span>
            <span className="mileage">{veiculo.condicao === 'Novo' ? '0 km' : `${veiculo.km.toLocaleString()} km`}</span>
          </div>
          <div className="vehicle-chassi">{veiculo.chassi}</div>
        </div>
      </td>
      <td className="col-price">
        <span className="price">{fmtBRL(pVenda)}</span>
      </td>
      <td className="col-margin">
        <span className={`margin ${margemClass}`}>{margem.toFixed(1)}%</span>
      </td>
      <td className="col-details">
        <span className="badge">{veiculo.atributo}</span>
      </td>
      <td className="col-actions">
        <div className="action-buttons">
          <button className="action-btn sell-btn" onClick={onSell} title="Vender">
            💰
          </button>
          <button className="action-btn transfer-btn" onClick={onTransfer} title="Transferir">
            🔄
          </button>
          <button className="action-btn edit-btn" onClick={onEdit} title="Editar">
            ✏️
          </button>
          <button className="action-btn delete-btn" onClick={onDelete} title="Excluir">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  );
};

export default VehicleRow;
