const mongoose = require('mongoose');

const LojaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loja', LojaSchema);