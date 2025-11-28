import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaCar, FaMotorcycle, FaTruck, FaPlus, FaTrash, FaChartLine, FaWallet, FaSort, FaSortUp, FaSortDown, FaCamera, FaFileExcel, FaHandHoldingUsd, FaPencilAlt, FaStore, FaSync, FaBuilding, FaExchangeAlt } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const fmtBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const API_URL = 'http://localhost:5000/api';

function App() {
  // --- STATES ---
  const [dbVeiculos, setDbVeiculos] = useState([]); 
  const [dbConcessionarias, setDbConcessionarias] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedConcId, setSelectedConcId] = useState(''); // ID da loja selecionada no filtro
  const [modalOpen, setModalOpen] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingVehicle, setEditingVehicle] = useState(null); 
  const [transferingVehicle, setTransferingVehicle] = useState(null);

  // --- CARREGAR DADOS ---
  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resVeiculos, resLojas] = await Promise.all([
        axios.get(`${API_URL}/veiculos`),
        axios.get(`${API_URL}/concessionarias`)
      ]);
      
      setDbVeiculos(resVeiculos.data);
      setDbConcessionarias(resLojas.data);

      // Se não tiver loja selecionada e existirem lojas, seleciona a primeira
      if (!selectedConcId && resLojas.data.length > 0) {
        setSelectedConcId(resLojas.data[0]._id);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // --- FILTRAR POR LOJA SELECIONADA ---
  const activeConc = useMemo(() => {
    return dbConcessionarias.find(c => c._id === selectedConcId) || { nome: 'Todas / Sem Loja', _id: 'all' };
  }, [dbConcessionarias, selectedConcId]);

  const veiculosDaLoja = useMemo(() => {
    if(!activeConc._id || activeConc._id === 'all') return dbVeiculos;
    return dbVeiculos.filter(v => v.concessionariaId === activeConc._id);
  }, [dbVeiculos, activeConc]);

  const estoque = useMemo(() => veiculosDaLoja.filter(v => v.status === 'estoque'), [veiculosDaLoja]);
  const vendas = useMemo(() => veiculosDaLoja.filter(v => v.status === 'vendido'), [veiculosDaLoja]);

  // --- FILTROS DE BUSCA E ORDENAÇÃO ---
  const estoqueFiltrado = useMemo(() => {
    let lista = [...estoque];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      lista = lista.filter(v => 
        v.marca.toLowerCase().includes(term) || 
        v.chassi.toLowerCase().includes(term) || 
        v.ano.toString().includes(term)
      );
    }

    if (sortConfig.key) {
      lista.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'margem') {
          const pVendaA = parseFloat(a.precoVenda) || 0;
          const custoTotalA = (parseFloat(a.precoCompra)||0) + (parseFloat(a.custos)||0);
          valA = custoTotalA > 0 ? ((pVendaA - custoTotalA) / custoTotalA) : 0;

          const pVendaB = parseFloat(b.precoVenda) || 0;
          const custoTotalB = (parseFloat(b.precoCompra)||0) + (parseFloat(b.custos)||0);
          valB = custoTotalB > 0 ? ((pVendaB - custoTotalB) / custoTotalB) : 0;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return lista;
  }, [estoque, searchTerm, sortConfig]);

  // Estatísticas
  const stats = useMemo(() => {
    const s = { auto: 0, moto: 0, cam: 0, valAuto: 0, valMoto: 0, valCam: 0 };
    estoque.forEach(v => {
      const preco = parseFloat(v.precoVenda) || 0;
      if (v.tipo === 'Automovel') { s.auto++; s.valAuto += preco; }
      else if (v.tipo === 'Moto') { s.moto++; s.valMoto += preco; }
      else { s.cam++; s.valCam += preco; }
    });
    return { ...s, totalVal: s.valAuto + s.valMoto + s.valCam, totalCount: s.auto + s.moto + s.cam };
  }, [estoque]);

  // --- AÇÕES ---
  const handleSaveVehicle = async (veiculo) => {
    const dados = {
      ...veiculo,
      precoCompra: parseFloat(veiculo.precoCompra) || 0,
      custos: parseFloat(veiculo.custos) || 0,
      precoVenda: parseFloat(veiculo.precoVenda) || 0,
      ano: parseInt(veiculo.ano) || 0,
      km: parseInt(veiculo.km) || 0,
      concessionariaId: activeConc._id, 
      concessionariaNome: activeConc.nome
    };

    try {
      if (editingVehicle) {
        await axios.put(`${API_URL}/veiculos/${editingVehicle._id}`, dados);
      } else {
        if (dbVeiculos.find(v => v.chassi === dados.chassi)) return alert("Chassi já existe!");
        await axios.post(`${API_URL}/veiculos`, dados);
      }
      setModalOpen(null); setEditingVehicle(null); carregarDados();
    } catch (error) { alert("Erro ao salvar: " + error.message); }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Excluir veículo permanentemente?")) return;
    try { await axios.delete(`${API_URL}/veiculos/${id}`); carregarDados(); } catch (error) { alert("Erro ao deletar"); }
  };

  const handleSellVehicle = async (veiculo) => {
    const pVenda = parseFloat(veiculo.precoVenda) || 0;
    const pCompra = parseFloat(veiculo.precoCompra) || 0;
    const custos = parseFloat(veiculo.custos) || 0;
    const lucro = pVenda - (pCompra + custos);

    if (!window.confirm(`Vender ${veiculo.marca}?\nLucro Previsto: ${fmtBRL(lucro)}`)) return;

    try {
      await axios.put(`${API_URL}/veiculos/${veiculo._id}`, { ...veiculo, status: 'vendido', dataVenda: new Date().toLocaleDateString() });
      carregarDados();
    } catch (error) { alert("Erro ao vender"); }
  };

  const handleCreateConcessionaria = async (dados) => {
    try {
      const res = await axios.post(`${API_URL}/concessionarias`, dados);
      setDbConcessionarias([...dbConcessionarias, res.data]);
      setSelectedConcId(res.data._id); // Seleciona a nova loja
      setModalOpen(null);
    } catch (error) { alert("Erro ao criar loja"); }
  };

  // Novo método para transferir veículo

  const handleTransfer = async (veiculoId, novaLojaId) => {
    const novaLoja = dbConcessionarias.find(l => l._id === novaLojaId);
    if (!novaLoja) return alert("Loja inválida");

    try {
      // Atualiza o veículo com o ID e o Nome da nova loja
      // NOTA: Certifique-se que seu Backend aceita PUT com esses campos
      await axios.put(`${API_URL}/veiculos/${veiculoId}`, {
        ...transferingVehicle,
        concessionariaId: novaLoja._id,
        concessionariaNome: novaLoja.nome
      });
      
      alert(`Veículo transferido para ${novaLoja.nome} com sucesso!`);
      setTransferingVehicle(null); // Fecha o modal
      carregarDados(); // Recarrega a lista
    } catch (error) {
      alert("Erro ao transferir veículo");
    }
  };

  const handleDeleteConcessionaria = async () => {
    if(!activeConc._id) return;
    if(!window.confirm(`Apagar a loja "${activeConc.nome}" e remover do filtro?`)) return;
    try {
      await axios.delete(`${API_URL}/concessionarias/${activeConc._id}`);
      carregarDados();
      setSelectedConcId(''); 
    } catch(err) { alert("Erro ao apagar loja."); }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    let csv = "\uFEFFOrigem;Tipo;Marca;Modelo;Condicao;KM;Chassi;Ano;Compra;Custos;Venda;Lucro;Detalhe\n";
    estoque.forEach(v => {
      const pVenda = parseFloat(v.precoVenda) || 0;
      const pCompra = parseFloat(v.precoCompra) || 0;
      const custos = parseFloat(v.custos) || 0;
      const lucro = pVenda - (pCompra + custos);
      csv += `${v.concessionariaNome};${v.tipo};${v.marca};${v.condicao};${v.km};${v.chassi};${v.ano};${pCompra};${custos};${pVenda};${lucro};${v.atributo}\n`;
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `Estoque_${activeConc.nome}.csv`;
    link.click();
  };

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <h1>{activeConc.nome}</h1>
          <p>{activeConc.cnpj || 'Selecione uma loja'}</p>
        </div>
        <div className="actions">
          <div style={{ display: 'flex', gap: 8, alignItems:'center' }}>
            <FaBuilding style={{color:'#64748b'}} />
            <select value={selectedConcId} onChange={(e) => setSelectedConcId(e.target.value)}>
              {dbConcessionarias.length === 0 && <option value="">Nenhuma loja criada</option>}
              {dbConcessionarias.map((c) => <option key={c._id} value={c._id}>{c.nome}</option>)}
            </select>
            <button className="btn btn-success" onClick={() => setModalOpen('concessionaria')} title="Nova Loja"><FaPlus /></button>
            <button className="btn btn-danger" onClick={handleDeleteConcessionaria} title="Apagar Loja Atual" disabled={!selectedConcId}><FaTrash /></button>
          </div>
          <button className="btn btn-info" onClick={() => setModalOpen('relatorio')}><FaChartLine /> Lucro & Vendas</button>
          <button className="btn btn-primary" onClick={() => { setEditingVehicle(null); setModalOpen('veiculo'); }} disabled={!selectedConcId}><FaPlus /> Adicionar Veículo</button>
        </div>
      </header>

      <div className="dashboard">
        <Card title="Automóveis" icon={<FaCar />} count={stats.auto} value={stats.valAuto} />
        <Card title="Motos" icon={<FaMotorcycle />} count={stats.moto} value={stats.valMoto} />
        <Card title="Caminhões" icon={<FaTruck />} count={stats.cam} value={stats.valCam} />
        <Card title="Total em Estoque" icon={<FaWallet />} count={`${stats.totalCount} veículos`} value={stats.totalVal} isTotal />
      </div>

      <div className="charts-container">
        <div className="card" style={{ height: 380 }}>
          <div className="card-header">Distribuição do Estoque</div>
          <div className="chart-wrapper">
             <Doughnut 
               data={{
                 labels: ['Carros', 'Motos', 'Caminhões'],
                 datasets: [{ data: [stats.auto, stats.moto, stats.cam], backgroundColor: ['#3b82f6', '#10b981', '#6366f1'] }]
               }} 
               options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
             />
          </div>
        </div>
        <div className="card" style={{ height: 380 }}>
           <div className="card-header">Performance Financeira (Estoque)</div>
           <div className="chart-wrapper">
             <Bar 
                data={{
                  labels: ['Carros', 'Motos', 'Caminhões'],
                  datasets: [{ 
                    label: 'Valor em Estoque', 
                    data: [stats.valAuto, stats.valMoto, stats.valCam], 
                    backgroundColor: ['#3b82f6', '#10b981', '#6366f1'] 
                  }]
                }}
                options={{ maintainAspectRatio: false }}
             />
           </div>
        </div>
      </div>

      <div className="vehicle-list">
        <div className="table-toolbar">
          <div className="search-bar">
            <input type="text" placeholder="Busca..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn btn-export" onClick={exportCSV}><FaFileExcel /> Exportar Excel</button>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{width: '80px'}}>Foto</th>
              <th>Origem</th>
              <ThSort label="Tipo" colKey="tipo" sortConfig={sortConfig} onSort={handleSort} />
              <ThSort label="Veículo / KM" colKey="marca" sortConfig={sortConfig} onSort={handleSort} />
              <ThSort label="Preço" colKey="precoVenda" sortConfig={sortConfig} onSort={handleSort} />
              <ThSort label="Markup %" colKey="margem" sortConfig={sortConfig} onSort={handleSort} />
              <th>Detalhes</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="9">Carregando dados...</td></tr> :
             estoqueFiltrado.length === 0 ? <tr><td colSpan="9">Nada encontrado nesta loja.</td></tr> :
              estoqueFiltrado.map((v) => (
                <VehicleRow 
                  key={v._id} 
                  veiculo={v} 
                  onEdit={() => { setEditingVehicle(v); setModalOpen('veiculo'); }}
                  onDelete={() => handleDeleteVehicle(v._id)}
                  onSell={() => handleSellVehicle(v)}
                  onTransfer={() => setTransferingVehicle(v)}
                />
              ))
            }
          </tbody>
        </table>
      </div>

      {/* MODAIS */}
      {modalOpen === 'concessionaria' && <ConcessionariaModal onClose={() => setModalOpen(null)} onSave={handleCreateConcessionaria} />}
      {modalOpen === 'veiculo' && <VeiculoModal onClose={() => setModalOpen(null)} onSave={handleSaveVehicle} initialData={editingVehicle} />}
      {modalOpen === 'relatorio' && <RelatorioModal onClose={() => setModalOpen(null)} vendas={vendas} />}
      {transferingVehicle && (<TransferModal veiculo={transferingVehicle} lojas={dbConcessionarias} onClose={() => setTransferingVehicle(null)} onConfirm={handleTransfer}/>)}
    </div>
  );
}

// --- SUB-COMPONENTES ---

const Card = ({ title, icon, count, value, isTotal }) => (
  <div className={`card ${isTotal ? 'total' : ''}`}>
    <div className="card-header">{title} {icon}</div>
    <div className="card-body">
      <h2>{typeof count === 'number' ? count : count}</h2>
      <p>{typeof value === 'number' ? fmtBRL(value) : value}</p>
    </div>
  </div>
);

const ThSort = ({ label, colKey, sortConfig, onSort }) => (
  <th onClick={() => onSort(colKey)}>
    {label} 
    {sortConfig.key === colKey ? (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
  </th>
);

// Adicione onTransfer aqui nos parâmetros
const VehicleRow = ({ veiculo, onEdit, onDelete, onSell, onTransfer }) => {
  const pVenda = parseFloat(veiculo.precoVenda) || 0;
  const pCompra = parseFloat(veiculo.precoCompra) || 0;
  const custos = parseFloat(veiculo.custos) || 0;
  const custoTotal = pCompra + custos;
  
  const lucro = pVenda - custoTotal;
  const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;
  
  const corMargem = margem < 10 ? '#ef4444' : margem < 30 ? '#f59e0b' : '#10b981';

  const dataDesde = veiculo.dataTransferencia 
    ? new Date(veiculo.dataTransferencia).toLocaleDateString('pt-BR')
    : 'Origem';

  return (
    <tr>
      {/* Coluna da Imagem */}
      <td>
        {veiculo.imagem ? 
          <img src={veiculo.imagem} className="car-thumb" alt="v" /> : 
          <div className="car-thumb" style={{display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9'}}>
             <FaCar style={{color:'#cbd5e1', fontSize: 20}} />
          </div>
        }
      </td>

      {/* Coluna da Concessionária */}
      <td>
        <div style={{display:'flex', flexDirection:'column', alignItems: 'flex-start'}}>
          <span className="badge-origin">{veiculo.concessionariaNome}</span>
          <span style={{fontSize: '0.75rem', color: '#64748b', marginTop: '4px'}}>
            {dataDesde !== 'Origem' && 'Desde: '}{dataDesde}
          </span>
        </div>
      </td>
      
      {/* Coluna do Tipo */}
      <td>
        {veiculo.tipo === 'Automovel' && <FaCar title="Automóvel" />}
        {veiculo.tipo === 'Moto' && <FaMotorcycle title="Moto" />}
        {veiculo.tipo === 'Caminhao' && <FaTruck title="Caminhão" />}
      </td>

      {/* Coluna de Detalhes do Veículo */}
      <td>
        <div className="info-compact">
          <div className="info-title">
            <span className="info-brand">{veiculo.marca}</span>
            <span className="info-year">({veiculo.ano})</span>
          </div>
          <div className="info-subtitle">
            <span style={{fontWeight:'bold', color: veiculo.condicao === 'Novo' ? '#10b981' : '#64748b'}}>{veiculo.condicao}</span>
             &bull; 
            <span>{veiculo.condicao === 'Novo' ? '0 km' : `${veiculo.km} km`}</span>
          </div>
          <span className="info-chassi">{veiculo.chassi}</span>
        </div>
      </td>

      {/* Colunas Financeiras */}
      <td>{fmtBRL(pVenda)}</td>
      <td style={{ color: corMargem, fontWeight: 'bold' }}>{margem.toFixed(1)}%</td>
      <td><span className="badge comum">{veiculo.atributo}</span></td>
      
      {/* Coluna de Ações - Botão NOVO adicionado aqui */}
      <td>
        <div style={{display:'flex', gap: 8, justifyContent:'center'}}>
          <button className="btn btn-sell" onClick={onSell} title="Vender" style={{padding: '6px 10px'}}><FaHandHoldingUsd /></button>
          
          {/* BOTÃO TRANSFERIR */}
          <button 
            className="btn" 
            style={{ color: '#3b82f6', padding: '6px 10px', background: 'transparent', border: '1px solid #e2e8f0' }} 
            onClick={onTransfer}
            title="Transferir de Loja"
          >
            <FaExchangeAlt />
          </button>

          <button className="btn" style={{ color: '#f59e0b', padding: '6px 10px', background: 'transparent', border: '1px solid #e2e8f0' }} onClick={onEdit}><FaPencilAlt /></button>
          <button className="btn" style={{ color: '#ef4444', padding: '6px 10px', background: 'transparent', border: '1px solid #e2e8f0' }} onClick={onDelete}><FaTrash /></button>
        </div>
      </td>
    </tr>
  );
};

const ConcessionariaModal = ({ onClose, onSave }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      nome: e.target.nome.value, 
      cnpj: e.target.cnpj.value 
    });
  };
  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <h2>Nova Concessionária</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Nome da Loja</label><input name="nome" className="form-control" required placeholder="Ex: Matriz - SP" /></div>
          <div className="form-group"><label>CNPJ</label><input name="cnpj" className="form-control" required placeholder="00.000.000/0001-00" /></div>
          <div className="modal-actions"><button type="submit" className="btn-modal-submit">Criar Loja</button></div>
        </form>
      </div>
    </div>
  );
};

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
    // Lógica para travar KM se for Novo
    if (name === 'condicao' && value === 'Novo') {
      setFormData(prev => ({ ...prev, [name]: value, km: 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    <div className="modal" style={{ display: 'block' }}>
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

          {/* NOVOS CAMPOS: CONDICAO E KM */}
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
          
          <div style={{ background: '#e0f2fe', padding: 15, borderRadius: 8, marginBottom: 15 }}>
             <div className="form-row-3">
               <div className="form-group"><label>Compra</label><input type="number" name="precoCompra" className="form-control" value={formData.precoCompra} onChange={handleChange} /></div>
               <div className="form-group"><label>Custos</label><input type="number" name="custos" className="form-control" value={formData.custos} onChange={handleChange} /></div>
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
          <div className="modal-actions"><button type="submit" className="btn-modal-submit">Salvar</button></div>
        </form>
      </div>
    </div>
  );
};

// modal de transferência de veículo

const TransferModal = ({ veiculo, lojas, onClose, onConfirm }) => {
  const [targetLojaId, setTargetLojaId] = useState('');

  // Filtra para não mostrar a loja onde o carro já está
  const lojasDisponiveis = lojas.filter(l => l._id !== veiculo.concessionariaId);

  return (
    <div className="modal" style={{ display: 'block' }}>
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

const RelatorioModal = ({ onClose, vendas }) => {
  const totalFaturamento = vendas.reduce((acc, v) => acc + (parseFloat(v.precoVenda)||0), 0);
  const totalCustos = vendas.reduce((acc, v) => acc + (parseFloat(v.precoCompra)||0) + (parseFloat(v.custos)||0), 0);
  const lucroLiq = totalFaturamento - totalCustos;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content large">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="modal-header"><h2>Relatório Financeiro</h2></div>
        <div className="balance-box">
           <div className="balance-item"><h3>Faturamento</h3><span className="amount" style={{color:'#3b82f6'}}>{fmtBRL(totalFaturamento)}</span></div>
           <div className="balance-item"><h3>Custos</h3><span className="amount" style={{color:'#ef4444'}}>{fmtBRL(totalCustos)}</span></div>
           <div className="balance-item" style={{background:'#dcfce7'}}><h3>Lucro Líquido</h3><span className="amount lucro">{fmtBRL(lucroLiq)}</span></div>
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

export default App;