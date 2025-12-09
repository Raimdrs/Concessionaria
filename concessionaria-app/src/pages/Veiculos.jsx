import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaFileExport, FaBuilding, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import ThSort from '../components/ThSort';
import VehicleRow from '../components/VehicleRow';
import VeiculoModal from '../components/VeiculoModal';
import TransferModal from '../components/TransferModal';
import { fmtBRL } from '../services/utils';
import { getVeiculos, createVeiculo, updateVeiculo, deleteVeiculo } from '../services/veiculoService';
import { getConcessionarias } from '../services/concessionariaService';
import './Veiculos.css';

// ADICIONADO: Recebendo 'usuario' nas props
const Veiculos = ({ lojaSelecionada, usuario }) => {
  const [dbVeiculos, setDbVeiculos] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [transferingVehicle, setTransferingVehicle] = useState(null);

  // Helper para cabeçalho de autenticação (caso o axios global não tenha)
  const getAuthHeaders = () => {
    const userId = usuario?._id || usuario?.id;
    return {
      headers: { 'x-userid': userId }
    };
  };

  const carregarDados = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      // Passando headers para o backend filtrar os dados
      const [resVeiculos, resLojas] = await Promise.all([
        getVeiculos(getAuthHeaders()), 
        getConcessionarias() 
      ]);
      
      // Nova estrutura de resposta do backend
      const veiculosData = resVeiculos.data.veiculos || resVeiculos.data;
      setDbVeiculos(Array.isArray(veiculosData) ? veiculosData : []);
      setLojas(resLojas.data);
      
      // Mostrar mensagem do backend se houver
      if (resVeiculos.data.mensagem && veiculosData.length === 0) {
        console.info('Backend:', resVeiculos.data.mensagem);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
      if (error.response?.data?.mensagem) {
        alert(error.response.data.mensagem);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (usuario) carregarDados(); 
  }, [usuario]); // Recarrega se o usuário mudar

  // --- LÓGICA DE BUSCA E FILTRO ---
  const estoqueFiltrado = useMemo(() => {
    let lista = [];

    // 1. Filtragem Base
    if (searchTerm.trim() !== '') {
       // Busca Global (Admin) ou Busca no que o usuário tem acesso
       lista = dbVeiculos.filter(v => v.status === 'estoque');
    } else {
       // Filtra pela loja selecionada no menu superior
       if (!lojaSelecionada) return [];
       lista = dbVeiculos.filter(v => v.concessionariaId === lojaSelecionada._id && v.status === 'estoque');
    }

    // 2. Filtro de Texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      lista = lista.filter(v => 
        v.marca.toLowerCase().includes(term) || 
        v.modelo.toLowerCase().includes(term) ||
        v.chassi.toLowerCase().includes(term) || 
        v.ano.toString().includes(term)
      );
    }

    // 3. Ordenação
    if (sortConfig.key) {
      lista.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Lógica especial para margem
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
  }, [dbVeiculos, lojaSelecionada, searchTerm, sortConfig]);

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
        await updateVeiculo(editingVehicle._id, dados, getAuthHeaders());
      } else {
        if (dbVeiculos.find(v => v.chassi === dados.chassi)) {
          return alert("Chassi já existe na lista carregada!");
        }
        await createVeiculo(dados, getAuthHeaders());
      }
      setModalOpen(null); 
      setEditingVehicle(null);
      await carregarDados();
    } catch (error) { 
      console.error("Erro ao salvar veículo:", error);
      alert("Erro ao salvar: " + (error.response?.data?.message || error.message)); 
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm("Excluir veículo permanentemente?")) return;
    try { 
      await deleteVeiculo(id, getAuthHeaders()); 
      carregarDados(); 
    } catch (error) { 
      alert("Erro ao deletar"); 
    }
  };

  const handleSellVehicle = async (veiculo) => {
    const pVenda = parseFloat(veiculo.precoVenda) || 0;
    const pCompra = parseFloat(veiculo.precoCompra) || 0;
    const custos = parseFloat(veiculo.custos) || 0;
    const lucro = pVenda - (pCompra + custos);
    
    if (!window.confirm(`Vender ${veiculo.marca}?\nLucro Previsto: ${fmtBRL(lucro)}`)) return;
    
    try {
      await updateVeiculo(veiculo._id, { 
        ...veiculo, 
        status: 'vendido', 
        dataVenda: new Date().toLocaleDateString() 
      }, getAuthHeaders());
      carregarDados();
    } catch (error) { 
      alert("Erro ao vender"); 
    }
  };

  const handleTransfer = async (veiculoId, novaLojaId) => {
    const novaLoja = lojas.find(l => l._id === novaLojaId);
    if (!novaLoja) return alert("Loja inválida");

    try {
      await updateVeiculo(veiculoId, {
        ...transferingVehicle,
        concessionariaId: novaLoja._id,
        concessionariaNome: novaLoja.nome,
        dataTransferencia: new Date()
      }, getAuthHeaders());
      
      alert(`Veículo transferido para ${novaLoja.nome} com sucesso!`);
      setTransferingVehicle(null);
      carregarDados();
    } catch (error) {
      alert("Erro ao transferir: " + error.message);
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
    
    // CORRIGIDO: Usando estoqueFiltrado ao invés de 'estoque'
    estoqueFiltrado.forEach(v => {
      const pVenda = parseFloat(v.precoVenda) || 0;
      const pCompra = parseFloat(v.precoCompra) || 0;
      const custos = parseFloat(v.custos) || 0;
      const lucro = pVenda - (pCompra + custos);
      csv += `${lojaSelecionada.nome};${v.tipo};${v.marca};${v.modelo};${v.condicao};${v.km};${v.chassi};${v.ano};${pCompra};${custos};${pVenda};${lucro};${v.atributo}\n`;
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

      {/* VIEW DE SELEÇÃO DE LOJA */}
      {!lojaSelecionada ? (
        <div className="no-store-selected">
          <FaBuilding className="no-store-icon" />
          <h2>Selecione uma loja</h2>
          <p>Para gerenciar veículos, primeiro selecione uma loja na barra superior.</p>
        </div>
      ) : (
        /* VIEW DA TABELA DE VEÍCULOS */
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
              <button className="btn btn-outline" onClick={exportCSV} disabled={estoqueFiltrado.length === 0}>
                <FaFileExport /> Exportar
              </button>
            </div>
          </div>

          {/* AVISO DE PERMISSÕES */}
          {usuario?.cargo === 'vendedor' && dbVeiculos.length === 0 && !loading && (
            <div className="permission-notice warning">
              <div className="notice-header">
                <FaExclamationTriangle className="notice-icon" />
                <strong>Nenhum veículo encontrado</strong>
              </div>
              <p>Como vendedor, você só visualiza os veículos que você mesmo cadastrou.</p>
              <p>Cadastre um novo veículo usando o botão "Novo Veículo" acima.</p>
            </div>
          )}
          {usuario?.cargo === 'vendedor' && dbVeiculos.length > 0 && (
            <div className="permission-notice">
              <div className="notice-header">
                <FaInfoCircle className="notice-icon" />
                <strong>Atenção:</strong>
              </div>
              <p>Como vendedor, você só visualiza os veículos que você mesmo cadastrou.</p>
            </div>
          )}
          {usuario?.cargo === 'gerente' && (
            <div className="permission-notice">
              <div className="notice-header">
                <FaInfoCircle className="notice-icon" />
                <strong>Informação:</strong>
              </div>
              <p>Como gerente, você visualiza apenas os veículos da sua loja.</p>
            </div>
          )}
          
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
                  <tr>
                    <td colSpan="8" className="empty-row">
                      {dbVeiculos.length === 0 ? (
                        <div>
                          <strong>Nenhum veículo cadastrado ainda.</strong>
                          <p>Clique em "Novo Veículo" para adicionar o primeiro veículo ao estoque.</p>
                        </div>
                      ) : searchTerm ? (
                        <div>
                          <strong>Nenhum veículo encontrado com "{searchTerm}"</strong>
                          <p>Tente buscar por outro termo.</p>
                        </div>
                      ) : (
                        <div>
                          <strong>Nenhum veículo disponível nesta loja.</strong>
                          {usuario?.cargo === 'vendedor' && (
                            <p>Como vendedor, você só vê veículos cadastrados por você.</p>
                          )}
                          {usuario?.cargo === 'gerente' && (
                            <p>Esta loja não possui veículos cadastrados ainda.</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  estoqueFiltrado.map((v) => {
                    // --- REGRAS DE PERMISSÃO POR LINHA ---
                    // Admin/Gerente: Pode tudo. 
                    // Vendedor: Só pode editar/deletar SE ele for o dono (v.criadoPor)
                    const isDono = v.criadoPor === usuario?._id || v.criadoPor === usuario?.id;
                    const isGestor = ['admin', 'gerente'].includes(usuario?.cargo);
                    
                    const podeEditar = isGestor || isDono;
                    const podeTransferir = isGestor; // Só gestor transfere
                    
                    return (
                      <VehicleRow 
                        key={v._id} 
                        veiculo={v} 
                        // Se não puder editar, não passa a função (botão não renderiza ou fica disabled)
                        onEdit={podeEditar ? () => { setEditingVehicle(v); setModalOpen('veiculo'); } : null}
                        onDelete={podeEditar ? () => handleDeleteVehicle(v._id) : null}
                        onSell={podeEditar ? () => handleSellVehicle(v) : null}
                        // Botão de transferência só aparece se passar a função
                        onTransfer={podeTransferir ? () => setTransferingVehicle(v) : null}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      {modalOpen === 'veiculo' && (
        <VeiculoModal 
          onClose={() => setModalOpen(null)} 
          onSave={handleSaveVehicle} 
          initialData={editingVehicle} 
        />
      )}

      {transferingVehicle && (
        <TransferModal 
          veiculo={transferingVehicle} 
          lojas={lojas} 
          onClose={() => setTransferingVehicle(null)} 
          onConfirm={handleTransfer} 
        />
      )}
    </div>
  );
};

export default Veiculos;