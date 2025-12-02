import React from 'react';
import { fmtBRL } from '../services/utils';
import './Modal.css';

const RelatorioModal = ({ onClose, vendas }) => {
  const totalFaturamento = vendas.reduce((acc, v) => acc + (parseFloat(v.precoVenda)||0), 0);
  const totalCustos = vendas.reduce((acc, v) => acc + (parseFloat(v.precoCompra)||0) + (parseFloat(v.custos)||0), 0);
  const lucroLiq = totalFaturamento - totalCustos;

  return (
    <div className="modal">
      <div className="modal-content large">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="modal-header"><h2>Relatório Financeiro</h2></div>
        <div className="balance-box">
           <div className="balance-item"><h3>Faturamento</h3><span className="amount" style={{color:'#3b82f6'}}>{fmtBRL(totalFaturamento)}</span></div>
           <div className="balance-item"><h3>Custos</h3><span className="amount" style={{color:'#ef4444'}}>{fmtBRL(totalCustos)}</span></div>
           <div className="balance-item"><h3>Lucro Líquido</h3><span className="amount lucro">{fmtBRL(lucroLiq)}</span></div>
        </div>
        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          <table>
            <thead><tr><th>Data</th><th>Veículo</th><th>Venda</th><th>Lucro Real</th></tr></thead>
            <tbody>
              {vendas.map((v, i) => {
                 const pVenda = parseFloat(v.precoVenda) || 0;
                 const pCompra = parseFloat(v.precoCompra) || 0;
                 const custos = parseFloat(v.custos) || 0;
                 const l = pVenda - (pCompra + custos);
                 return <tr key={i}><td>{v.dataVenda}</td><td>{v.marca}</td><td>{fmtBRL(pVenda)}</td><td style={{color: l>=0?'green':'red'}}>{fmtBRL(l)}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RelatorioModal;
