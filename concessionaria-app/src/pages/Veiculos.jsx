import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaFileExport, FaBuilding } from 'react-icons/fa';
import ThSort from '../components/ThSort';
import VehicleRow from '../components/VehicleRow';
import VeiculoModal from '../components/VeiculoModal';
import TransferModal from '../components/TransferModal';
import { fmtBRL } from '../services/utils';
import { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo } from '../services/veiculoService';
import { getConcessionarias } from '../services/concessionariaService';
import './Veiculos.css';

const Veiculos = ({ lojaSelecionada }) => {
  const [dbVeiculos, setDbVeiculos] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [transferingVehicle, setTransferingVehicle] = useState(null);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Busca Veículos E Lojas ao mesmo tempo
      const [resVeiculos, resLojas] = await Promise.all([
        getVeiculos(),
        getConcessionarias() // Importante ter importado lá em cima
      ]);
      setDbVeiculos(resVeiculos.data);
      setLojas(resLojas.data); // Salva as lojas no estado
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const veiculosDaLoja = useMemo(() => {
    if (!lojaSelecionada) return [];
    return dbVeiculos.filter(v => v.concessionariaId === lojaSelecionada._id);
  }, [dbVeiculos, lojaSelecionada]);

  const estoque = useMemo(() => veiculosDaLoja.filter(v => v.status === 'estoque'), [veiculosDaLoja]);

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

  const handleSaveVehicle = async (veiculo) => {
    if (!lojaSelecionada) return alert("Selecione uma loja primeiro!");
    
    const dados = {
      ...veiculo,
      precoCompra: parseFloat(veiculo.precoCompra) || 0,
      custos: parseFloat(veiculo.custos) || 0,
      precoVenda: parseFloat(veiculo.precoVenda) || 0,
      ano: parseInt(veiculo.ano) || 0,
      km: parseInt(veiculo.km) || 0,
      concessionariaId: lojaSelecionada._id, 
      concessionariaNome: lojaSelecionada.nome
    };
    try {
      if (editingVehicle) {
        await updateVeiculo(editingVehicle._id, dados);
      } else {
        if (dbVeiculos.find(v => v.chassi === dados.chassi)) return alert("Chassi já existe!");
        await createVeiculo(dados);
      }
      setModalOpen(null); setEditingVehicle(null); carregarDados();
    } catch (error) { alert("Erro ao salvar: " + error.message); }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Excluir veículo permanentemente?")) return;
    try { await deleteVeiculo(id); carregarDados(); } catch (error) { alert("Erro ao deletar"); }
  };

  const handleSellVehicle = async (veiculo) => {
    const pVenda = parseFloat(veiculo.precoVenda) || 0;
    const pCompra = parseFloat(veiculo.precoCompra) || 0;
    const custos = parseFloat(veiculo.custos) || 0;
    const lucro = pVenda - (pCompra + custos);
    if (!window.confirm(`Vender ${veiculo.marca}?\nLucro Previsto: ${fmtBRL(lucro)}`)) return;
    try {
      await updateVeiculo(veiculo._id, { ...veiculo, status: 'vendido', dataVenda: new Date().toLocaleDateString() });
      carregarDados();
    } catch (error) { alert("Erro ao vender"); }
  };

  const handleTransfer = async (veiculoId, novaLojaId) => {
    const novaLoja = lojas.find(l => l._id === novaLojaId);
    if (!novaLoja) return alert("Loja inválida");

    try {
      // Atualiza o veículo com a nova concessionária e a data da transferência
      await updateVeiculo(veiculoId, {
        ...transferingVehicle, // Dados atuais do veículo
        concessionariaId: novaLoja._id,
        concessionariaNome: novaLoja.nome,
        dataTransferencia: new Date() // Salva a data para exibir "Desde: ..."
      });
      
      alert(`Veículo transferido para ${novaLoja.nome} com sucesso!`);
      setTransferingVehicle(null); // Fecha o modal
      carregarDados(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao transferir veículo: " + error.message);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const exportCSV = () => {
    if (!lojaSelecionada) return alert("Selecione uma loja primeiro!");
    
    let csv = "\uFEFFLoja;Tipo;Marca;Modelo;Condicao;KM;Chassi;Ano;Compra;Custos;Venda;Lucro;Detalhe\n";
    estoque.forEach(v => {
      const pVenda = parseFloat(v.precoVenda) || 0;
      const pCompra = parseFloat(v.precoCompra) || 0;
      const custos = parseFloat(v.custos) || 0;
      const lucro = pVenda - (pCompra + custos);
      csv += `${lojaSelecionada.nome};${v.tipo};${v.marca};${v.condicao};${v.km};${v.chassi};${v.ano};${pCompra};${custos};${pVenda};${lucro};${v.atributo}\n`;
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `Estoque_${lojaSelecionada.nome}.csv`;
    link.click();
  };

  return (
    <div className="content">
      {/* HEADER ACTIONS */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Gestão de Veículos</h1>
          {lojaSelecionada && (
            <div className="header-info">
              <span className="active-store">{lojaSelecionada.nome}</span>
              <span className="store-cnpj">• {lojaSelecionada.cnpj}</span>
            </div>
          )}
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => { setEditingVehicle(null); setModalOpen('veiculo'); }} 
            disabled={!lojaSelecionada}
          >
            <FaPlus /> Novo Veículo
          </button>
        </div>
      </div>

      {/* VEHICLES TABLE */}
      {!lojaSelecionada ? (
        <div className="no-store-selected">
          <FaBuilding className="no-store-icon" />
          <h2>Selecione uma loja</h2>
          <p>Para gerenciar veículos, primeiro selecione uma loja na barra superior.</p>
        </div>
      ) : (
        <div className="vehicles-section">
          <div className="section-header">
            <h2>Estoque de Veículos ({estoqueFiltrado.length})</h2>
            <div className="section-actions">
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar por marca, chassi ou ano..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="btn btn-outline" onClick={exportCSV}>
                <FaFileExport /> Exportar
              </button>
            </div>
          </div>
          
          {!lojaSelecionada ? (
            <div className="no-store-selected">
              <FaBuilding className="no-store-icon" />
              <h2>Nenhuma Loja Selecionada</h2>
              <p>Selecione uma loja na barra superior para gerenciar os veículos.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th className="col-photo">Foto</th>
                    <th className="col-origin">Origem</th>
                    <ThSort label="Tipo" colKey="tipo" sortConfig={sortConfig} onSort={handleSort} />
                    <ThSort label="Veículo" colKey="marca" sortConfig={sortConfig} onSort={handleSort} />
                    <ThSort label="Preço" colKey="precoVenda" sortConfig={sortConfig} onSort={handleSort} />
                    <ThSort label="Margem %" colKey="margem" sortConfig={sortConfig} onSort={handleSort} />
                    <th className="col-details">Detalhes</th>
                    <th className="col-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="loading-row">Carregando dados...</td></tr>
                  ) : estoqueFiltrado.length === 0 ? (
                    <tr><td colSpan="8" className="empty-row">Nenhum veículo encontrado</td></tr>
                  ) : (
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
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {modalOpen === 'veiculo' && (<VeiculoModal onClose={() => setModalOpen(null)} onSave={handleSaveVehicle} initialData={editingVehicle} />)}

      {/* MODAL DE TRANSFERÊNCIA */}
      {transferingVehicle && (<TransferModal veiculo={transferingVehicle} lojas={lojas} onClose={() => setTransferingVehicle(null)} onConfirm={handleTransfer} />)}</div>
      );
};

export default Veiculos;