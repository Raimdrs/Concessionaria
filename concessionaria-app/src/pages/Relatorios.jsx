import React, { useState, useEffect, useMemo } from 'react';
import { FaChartLine, FaMoneyBillWave, FaShoppingCart, FaArrowUp, FaFileExport, FaFilter } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { fmtBRL } from '../services/utils';
import { getVeiculos } from '../services/veiculoService';
import { getConcessionarias } from '../services/concessionariaService';
import './Relatorios.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const Relatorios = () => {
  const [dbVeiculos, setDbVeiculos] = useState([]);
  const [dbConcessionarias, setDbConcessionarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTempo, setFiltroTempo] = useState('todos'); // todos, mes, ano
  const [selectedConcessionaria, setSelectedConcessionaria] = useState('todas');

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [resVeiculos, resLojas] = await Promise.all([
        getVeiculos(),
        getConcessionarias()
      ]);
      setDbVeiculos(resVeiculos.data);
      setDbConcessionarias(resLojas.data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const vendas = useMemo(() => {
    let vendasFiltradas = dbVeiculos.filter(v => v.status === 'vendido');
    
    // Filtro por concessionária
    if (selectedConcessionaria !== 'todas') {
      vendasFiltradas = vendasFiltradas.filter(v => v.concessionariaId === selectedConcessionaria);
    }

    // Filtro por tempo
    if (filtroTempo !== 'todos') {
      const agora = new Date();
      vendasFiltradas = vendasFiltradas.filter(v => {
        if (!v.dataVenda) return false;
        const dataVenda = new Date(v.dataVenda.split('/').reverse().join('/'));
        
        if (filtroTempo === 'mes') {
          return dataVenda.getMonth() === agora.getMonth() && dataVenda.getFullYear() === agora.getFullYear();
        }
        if (filtroTempo === 'ano') {
          return dataVenda.getFullYear() === agora.getFullYear();
        }
        return true;
      });
    }

    return vendasFiltradas;
  }, [dbVeiculos, filtroTempo, selectedConcessionaria]);

  const estoque = useMemo(() => {
    let estoqueData = dbVeiculos.filter(v => v.status === 'estoque');
    if (selectedConcessionaria !== 'todas') {
      estoqueData = estoqueData.filter(v => v.concessionariaId === selectedConcessionaria);
    }
    return estoqueData;
  }, [dbVeiculos, selectedConcessionaria]);

  const relatorioFinanceiro = useMemo(() => {
    const totalFaturamento = vendas.reduce((acc, v) => acc + (parseFloat(v.precoVenda) || 0), 0);
    const totalCustos = vendas.reduce((acc, v) => acc + (parseFloat(v.precoCompra) || 0) + (parseFloat(v.custos) || 0), 0);
    const lucroLiquido = totalFaturamento - totalCustos;
    const margemGeral = totalFaturamento > 0 ? (lucroLiquido / totalFaturamento) * 100 : 0;

    return {
      totalFaturamento,
      totalCustos,
      lucroLiquido,
      margemGeral,
      totalVendas: vendas.length
    };
  }, [vendas]);

  const dadosGraficoPorTipo = useMemo(() => {
    const tipos = { Automovel: 0, Moto: 0, Caminhao: 0 };
    const valoresPorTipo = { Automovel: 0, Moto: 0, Caminhao: 0 };

    vendas.forEach(v => {
      tipos[v.tipo] = (tipos[v.tipo] || 0) + 1;
      valoresPorTipo[v.tipo] = (valoresPorTipo[v.tipo] || 0) + (parseFloat(v.precoVenda) || 0);
    });

    return {
      labels: ['Automóveis', 'Motos', 'Caminhões'],
      quantidades: [tipos.Automovel, tipos.Moto, tipos.Caminhao],
      valores: [valoresPorTipo.Automovel, valoresPorTipo.Moto, valoresPorTipo.Caminhao]
    };
  }, [vendas]);

  const dadosPorConcessionaria = useMemo(() => {
    const dados = dbConcessionarias.map(conc => {
      const vendasConc = vendas.filter(v => v.concessionariaId === conc._id);
      const estoqueConc = estoque.filter(v => v.concessionariaId === conc._id);
      
      const faturamento = vendasConc.reduce((acc, v) => acc + (parseFloat(v.precoVenda) || 0), 0);
      const custos = vendasConc.reduce((acc, v) => acc + (parseFloat(v.precoCompra) || 0) + (parseFloat(v.custos) || 0), 0);
      const valorEstoque = estoqueConc.reduce((acc, v) => acc + (parseFloat(v.precoVenda) || 0), 0);

      return {
        nome: conc.nome,
        vendas: vendasConc.length,
        faturamento,
        lucro: faturamento - custos,
        estoque: estoqueConc.length,
        valorEstoque
      };
    });

    return dados.sort((a, b) => b.faturamento - a.faturamento);
  }, [dbConcessionarias, vendas, estoque]);

  const exportarRelatorio = () => {
    let csv = "\uFEFFRelatorio_Financeiro\n\n";
    csv += `Periodo:,${filtroTempo === 'todos' ? 'Todos os tempos' : filtroTempo === 'mes' ? 'Este mês' : 'Este ano'}\n`;
    csv += `Concessionaria:,${selectedConcessionaria === 'todas' ? 'Todas' : dbConcessionarias.find(c => c._id === selectedConcessionaria)?.nome || 'N/A'}\n\n`;
    
    csv += "RESUMO FINANCEIRO\n";
    csv += `Total de Vendas:,${relatorioFinanceiro.totalVendas}\n`;
    csv += `Faturamento Total:,${relatorioFinanceiro.totalFaturamento}\n`;
    csv += `Custos Totais:,${relatorioFinanceiro.totalCustos}\n`;
    csv += `Lucro Liquido:,${relatorioFinanceiro.lucroLiquido}\n`;
    csv += `Margem Geral:,${relatorioFinanceiro.margemGeral.toFixed(2)}%\n\n`;

    csv += "VENDAS POR CONCESSIONARIA\n";
    csv += "Nome,Vendas,Faturamento,Lucro,Estoque,Valor Estoque\n";
    dadosPorConcessionaria.forEach(conc => {
      csv += `${conc.nome},${conc.vendas},${conc.faturamento},${conc.lucro},${conc.estoque},${conc.valorEstoque}\n`;
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `Relatorio_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <div className="loading-container">Carregando relatórios...</div>;
  }

  return (
    <div className="content">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Relatórios e Analytics</h1>
          <p className="page-subtitle">Análise de performance e vendas</p>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={filtroTempo} onChange={(e) => setFiltroTempo(e.target.value)} className="filter-select">
              <option value="todos">Todos os tempos</option>
              <option value="mes">Este mês</option>
              <option value="ano">Este ano</option>
            </select>
            <select value={selectedConcessionaria} onChange={(e) => setSelectedConcessionaria(e.target.value)} className="filter-select">
              <option value="todas">Todas concessionárias</option>
              {dbConcessionarias.map(conc => (
                <option key={conc._id} value={conc._id}>{conc.nome}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={exportarRelatorio}>
            <FaFileExport /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaShoppingCart className="stat-icon" />
          <div className="stat-content">
            <h3>Total de Vendas</h3>
            <div className="stat-value">{relatorioFinanceiro.totalVendas}</div>
            <div className="stat-subtitle">veículos vendidos</div>
          </div>
        </div>
        <div className="stat-card">
          <FaMoneyBillWave className="stat-icon" />
          <div className="stat-content">
            <h3>Faturamento</h3>
            <div className="stat-value">{fmtBRL(relatorioFinanceiro.totalFaturamento)}</div>
            <div className="stat-subtitle">receita total</div>
          </div>
        </div>
        <div className="stat-card">
          <FaArrowUp className="stat-icon" />
          <div className="stat-content">
            <h3>Lucro Líquido</h3>
            <div className="stat-value">{fmtBRL(relatorioFinanceiro.lucroLiquido)}</div>
            <div className="stat-subtitle">{relatorioFinanceiro.margemGeral.toFixed(1)}% de margem</div>
          </div>
        </div>
        <div className="stat-card">
          <FaChartLine className="stat-icon" />
          <div className="stat-content">
            <h3>Ticket Médio</h3>
            <div className="stat-value">
              {fmtBRL(relatorioFinanceiro.totalVendas > 0 ? relatorioFinanceiro.totalFaturamento / relatorioFinanceiro.totalVendas : 0)}
            </div>
            <div className="stat-subtitle">por venda</div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Vendas por Tipo de Veículo</h3>
          </div>
          <div className="chart-content">
            <Doughnut 
              data={{
                labels: dadosGraficoPorTipo.labels,
                datasets: [{
                  data: dadosGraficoPorTipo.quantidades,
                  backgroundColor: ['#2563eb', '#059669', '#7c3aed'],
                  borderWidth: 0
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3>Faturamento por Categoria</h3>
          </div>
          <div className="chart-content">
            <Bar 
              data={{
                labels: dadosGraficoPorTipo.labels,
                datasets: [{
                  label: 'Faturamento',
                  data: dadosGraficoPorTipo.valores,
                  backgroundColor: ['#2563eb', '#059669', '#7c3aed'],
                  borderRadius: 4,
                  borderWidth: 0
                }]
              }}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { 
                    beginAtZero: true, 
                    grid: { display: false },
                    ticks: { callback: function(value) { return fmtBRL(value); } }
                  },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* PERFORMANCE POR CONCESSIONÁRIA */}
      <div className="performance-section">
        <div className="section-header">
          <h2>Performance por Concessionária</h2>
        </div>
        <div className="performance-grid">
          {dadosPorConcessionaria.map((conc, index) => (
            <div key={index} className="performance-card">
              <div className="performance-header">
                <h4>{conc.nome}</h4>
                <div className="performance-rank">#{index + 1}</div>
              </div>
              <div className="performance-metrics">
                <div className="metric">
                  <span className="metric-label">Vendas</span>
                  <span className="metric-value">{conc.vendas}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Faturamento</span>
                  <span className="metric-value">{fmtBRL(conc.faturamento)}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Lucro</span>
                  <span className={`metric-value ${conc.lucro >= 0 ? 'positive' : 'negative'}`}>
                    {fmtBRL(conc.lucro)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Estoque</span>
                  <span className="metric-value">{conc.estoque} ({fmtBRL(conc.valorEstoque)})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABELA DE VENDAS DETALHADA */}
      <div className="sales-detail-section">
        <div className="section-header">
          <h2>Vendas Detalhadas</h2>
        </div>
        <div className="table-container">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Veículo</th>
                <th>Concessionária</th>
                <th>Tipo</th>
                <th>Preço de Venda</th>
                <th>Custo Total</th>
                <th>Lucro</th>
                <th>Margem</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => {
                const precoVenda = parseFloat(venda.precoVenda) || 0;
                const custoTotal = (parseFloat(venda.precoCompra) || 0) + (parseFloat(venda.custos) || 0);
                const lucro = precoVenda - custoTotal;
                const margem = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;

                return (
                  <tr key={venda._id}>
                    <td>{venda.dataVenda || 'N/A'}</td>
                    <td>{venda.marca}</td>
                    <td>{venda.concessionariaNome}</td>
                    <td>{venda.tipo}</td>
                    <td>{fmtBRL(precoVenda)}</td>
                    <td>{fmtBRL(custoTotal)}</td>
                    <td className={lucro >= 0 ? 'positive' : 'negative'}>
                      {fmtBRL(lucro)}
                    </td>
                    <td className={margem >= 20 ? 'positive' : margem >= 10 ? 'warning' : 'negative'}>
                      {margem.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
              {vendas.length === 0 && (
                <tr>
                  <td colSpan="8" className="empty-row">Nenhuma venda encontrada para os filtros selecionados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;