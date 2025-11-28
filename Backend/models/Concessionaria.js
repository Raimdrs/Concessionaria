const mongoose = require('mongoose');

const ConcessionariaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Concessionaria', ConcessionariaSchema);