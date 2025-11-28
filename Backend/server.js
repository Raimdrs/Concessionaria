const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Configurações
app.use(cors()); // Permite o React acessar
app.use(express.json({ limit: '50mb' })); // Limite alto para aceitar fotos

// Conexão com MongoDB (Banco de Dados)
// Se tiver MongoDB instalado localmente:
mongoose.connect('mongodb://127.0.0.1:27017/concessionariaDB')
  .then(() => console.log('MongoDB Conectado!'))
  .catch(err => console.error('Erro ao conectar no Mongo:', err));

// Rotas
const veiculosRouter = require('./routes/veiculos');
const concessionariasRouter = require('./routes/concessionarias');

app.use('/api/veiculos', veiculosRouter);
app.use('/api/concessionarias', concessionariasRouter);

const PORT = 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

