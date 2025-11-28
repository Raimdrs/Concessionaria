const mongoose = require('mongoose');

const VeiculoSchema = new mongoose.Schema({
  tipo: { type: String, required: true },
  marca: { type: String, required: true },
  chassi: { type: String, required: true },
  ano: { type: Number, required: true },
  km: { type: Number, default: 0 },
  condicao: { type: String, default: 'Usado' }, // 'Novo' ou 'Usado'
  // ----------------
  precoCompra: { type: Number, required: true },
  custos: { type: Number, default: 0 },
  precoVenda: { type: Number, required: true },
  atributo: { type: String },
  imagem: { type: String },
  status: { type: String, default: 'estoque' },
  dataVenda: { type: String },
  concessionariaNome: { type: String, default: 'Matriz' }, // Qual loja pertence
  concessionariaId: { type: String } // ID para facilitar filtros
}, { timestamps: true });

module.exports = mongoose.model('Veiculo', VeiculoSchema);