const mongoose = require('mongoose');

const TransferenciaSchema = new mongoose.Schema({
  veiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true },
  marca: String,      
  modelo: String,
  chassi: String,
  origemId: String,
  origemNome: String,
  destinoId: String,
  destinoNome: String,
  data: { type: Date, default: Date.now },
  usuario: { type: String, default: 'Sistema' } 
});

module.exports = mongoose.model('Transferencia', TransferenciaSchema);