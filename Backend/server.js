const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- INÍCIO DA CORREÇÃO ---

// Função Inteligente de Conexão (Apague o código antigo do mongoose.connect)
const connectDB = async () => {
  try {
    // Tenta conectar no container "mongo"
    await mongoose.connect('mongodb://mongo:27017/concessionariaDB');
    console.log('✅ MongoDB Conectado com Sucesso!');
  } catch (err) {
    console.error('❌ Falha ao conectar. Tentando novamente em 5s...');
    // Se falhar, espera 5 segundos e tenta de novo
    setTimeout(connectDB, 5000);
  }
};

// Chama a função para rodar
connectDB();

// --- FIM DA CORREÇÃO ---

const veiculosRouter = require('./routes/veiculos');
const concessionariasRouter = require('./routes/concessionarias');

app.use('/api/veiculos', veiculosRouter);
app.use('/api/concessionarias', concessionariasRouter);

const PORT = 5001;
// Adicionamos '0.0.0.0' para garantir que o Docker libere o acesso externo
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});