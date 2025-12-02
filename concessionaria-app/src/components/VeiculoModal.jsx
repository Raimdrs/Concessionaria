import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { fmtBRL } from '../services/utils';
import './Modal.css';

const VeiculoModal = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    tipo: 'Automovel', marca: '', chassi: '', ano: new Date().getFullYear(),
    km: 0, condicao: 'Novo',
    precoCompra: 0, custos: 0, precoVenda: 0, atributo: 'gasolina', imagem: ''
  });
  
  const pCompra = parseFloat(formData.precoCompra) || 0;
  const pCustos = parseFloat(formData.custos) || 0;
  const pVenda = parseFloat(formData.precoVenda) || 0;
  const custoTotal = pCompra + pCustos;
  const lucro = pVenda - custoTotal;
  const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'condicao' && value === 'Novo') {
      setFormData(prev => ({ ...prev, [name]: value, km: 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMarkupInput = (e) => {
    const markupAlvo = parseFloat(e.target.value) || 0;
    const novoPrecoVenda = custoTotal * (1 + (markupAlvo / 100));
    setFormData(prev => ({ ...prev, precoVenda: novoPrecoVenda }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imagem: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>{initialData ? 'Editar' : 'Novo'} Veículo</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div className="image-upload-preview" onClick={() => document.getElementById('img-input').click()}>
            {formData.imagem ? <img src={formData.imagem} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" /> : 
            <div><FaCamera size={24} /> <span style={{marginLeft:10}}>Adicionar Foto</span></div>}
          </div>
          <input id="img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />

          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select name="tipo" className="form-control" value={formData.tipo} onChange={handleChange} disabled={!!initialData}>
                <option value="Automovel">Automóvel</option>
                <option value="Moto">Moto</option>
                <option value="Caminhao">Caminhão</option>
              </select>
            </div>
            <div className="form-group">
              <label>Marca / Modelo</label>
              <input name="marca" className="form-control" value={formData.marca} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
               <label>Condição</label>
               <select name="condicao" className="form-control" value={formData.condicao} onChange={handleChange}>
                 <option value="Novo">Novo (0km)</option>
                 <option value="Usado">Usado</option>
               </select>
            </div>
            <div className="form-group">
               <label>Ano</label>
               <input type="number" name="ano" className="form-control" value={formData.ano} onChange={handleChange} />
            </div>
            <div className="form-group">
               <label>Quilometragem</label>
               <input type="number" name="km" className="form-control" value={formData.km} onChange={handleChange} disabled={formData.condicao === 'Novo'} />
            </div>
          </div>
          
          <div style={{ background: '#e0f2fe', padding: 16, borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            <div className="form-group"><label>Compra</label><input type="number" name="precoCompra" className="form-control" value={formData.precoCompra} onChange={handleChange} /></div>
            <div className="form-group"><label>Custos</label><input type="number" name="custos" className="form-control" value={formData.custos} onChange={handleChange} /></div>
            <div className="form-group">
                <label style={{color:'#059669'}}>Markup (%)</label>
                <input type="number" className="form-control" placeholder="Definir %" onChange={handleMarkupInput} style={{borderColor:'#10b981', fontWeight:'bold', color:'#059669'}}/>
            </div>
            <div className="form-group"><label>Venda</label><input type="number" name="precoVenda" className="form-control" value={formData.precoVenda} onChange={handleChange} /></div>
          </div>
             <div className="profit-panel">
               <div className="profit-item"><span>Lucro</span><strong className={lucro >= 0 ? 'positive' : 'negative'}>{fmtBRL(lucro)}</strong></div>
               <div className="profit-item"><span>Markup</span><strong>{margem.toFixed(1)}%</strong></div>
             </div>
          </div>

          <div className="form-group"><label>Chassi</label><input name="chassi" className="form-control" value={formData.chassi} onChange={handleChange} required /></div>
          
          <div className="form-group">
             <label>Detalhe Específico</label>
             <select name="atributo" className="form-control" value={formData.atributo} onChange={handleChange}>
               {formData.tipo === 'Automovel' && <><option value="gasolina">Gasolina</option><option value="eletrico">Elétrico</option></>}
               {formData.tipo === 'Moto' && <><option value="classico">Clássico</option><option value="esportivo">Esportivo</option></>}
               {formData.tipo === 'Caminhao' && <><option value="comum">Comum</option><option value="perigosa">Carga Perigosa</option></>}
             </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-modal-submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VeiculoModal;
