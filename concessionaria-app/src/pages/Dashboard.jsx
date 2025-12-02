import React, { useState, useEffect, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { FaCar, FaMotorcycle, FaTruck, FaWallet } from 'react-icons/fa';
import Card from '../components/Card';
import { fmtBRL } from '../services/utils';
import { getVeiculos } from '../services/veiculoService';
import { getConcessionarias } from '../services/concessionariaService';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = ({ lojaSelecionada }) => {
  const [dbVeiculos, setDbVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const resVeiculos = await getVeiculos();
      setDbVeiculos(resVeiculos.data);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  // Filtrar por loja selecionada
  const veiculosDaLoja = useMemo(() => {
    if (!lojaSelecionada) return dbVeiculos;
    return dbVeiculos.filter(v => v.concessionariaId === lojaSelecionada._id);
  }, [dbVeiculos, lojaSelecionada]);

  const estoque = useMemo(() => veiculosDaLoja.filter(v => v.status === 'estoque'), [veiculosDaLoja]);
  const vendas = useMemo(() => veiculosDaLoja.filter(v => v.status === 'vendido'), [veiculosDaLoja]);

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

  if (loading) {
    return <div className="loading-container">Carregando dados...</div>;
  }

  return (
    <div className="content">
      {/* STATS CARDS */}
      <div className="stats-grid">
        <Card title="Automóveis" icon={<FaCar />} count={stats.auto} value={stats.valAuto} />
        <Card title="Motocicletas" icon={<FaMotorcycle />} count={stats.moto} value={stats.valMoto} />
        <Card title="Caminhões" icon={<FaTruck />} count={stats.cam} value={stats.valCam} />
        <Card title="Total em Estoque" icon={<FaWallet />} count={`${stats.totalCount} veículos`} value={stats.totalVal} isTotal />
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Distribuição por Tipo</h3>
          </div>
          <div className="chart-content">
            <Doughnut 
              data={{
                labels: ['Automóveis', 'Motos', 'Caminhões'],
                datasets: [{ 
                  data: [stats.auto, stats.moto, stats.cam], 
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
            <h3>Valor por Categoria</h3>
          </div>
          <div className="chart-content">
            <Bar 
              data={{
                labels: ['Automóveis', 'Motos', 'Caminhões'],
                datasets: [{ 
                  label: 'Valor em Estoque', 
                  data: [stats.valAuto, stats.valMoto, stats.valCam], 
                  backgroundColor: ['#2563eb', '#059669', '#7c3aed'],
                  borderRadius: 4,
                  borderWidth: 0
                }]
              }}
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* OVERVIEW SECTION */}
      <div className="overview-section">
        <div className="overview-card">
          <h3>Resumo da Loja</h3>
          <div className="overview-grid">
            {!lojaSelecionada ? (
              <div className="overview-item">
                <div className="overview-header">
                  <h4>Selecione uma loja</h4>
                  <span className="overview-count">0 veículos</span>
                </div>
                <div className="overview-value">{fmtBRL(0)}</div>
              </div>
            ) : (
              <div className="overview-item">
                <div className="overview-header">
                  <h4>{lojaSelecionada.nome}</h4>
                  <span className="overview-count">{estoque.length} veículos em estoque</span>
                </div>
                <div className="overview-value">{fmtBRL(stats.totalVal)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="overview-card">
          <h3>Vendas Recentes</h3>
          <div className="recent-sales">
            {vendas.slice(-5).reverse().map(venda => (
              <div key={venda._id} className="sale-item">
                <div className="sale-info">
                  <span className="sale-vehicle">{venda.marca}</span>
                  <span className="sale-date">{venda.dataVenda}</span>
                </div>
                <span className="sale-value">{fmtBRL(parseFloat(venda.precoVenda) || 0)}</span>
              </div>
            ))}
            {vendas.length === 0 && (
              <div className="no-sales">Nenhuma venda registrada</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;