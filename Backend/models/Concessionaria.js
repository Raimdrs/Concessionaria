const mongoose = require('mongoose');

const ConcessionariaSchema = new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  cnpj: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model('Concessionaria', ConcessionariaSchema);