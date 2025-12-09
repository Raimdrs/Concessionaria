const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/concessionariaDB');
  } catch (err) {
    setTimeout(connectDB, 5000);
  }
};

connectDB();

try {
  const veiculosRouter = require('./routes/veiculos');
  const concessionariasRouter = require('./routes/concessionarias');
  const lojasRouter = require('./routes/lojas');
  const usuariosRouter = require('./routes/usuarios'); 
  
  app.use('/api/usuarios', usuariosRouter);
  app.use('/api/veiculos', veiculosRouter);
  app.use('/api/concessionarias', concessionariasRouter);
  app.use('/api/lojas', lojasRouter);
} catch (error) {
  console.error('Erro ao carregar rotas:', error);
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});