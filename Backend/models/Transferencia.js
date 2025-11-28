const mongoose = require('mongoose');

const TransferenciaSchema = new mongoose.Schema({
  veiculoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo', required: true },
  marca: String,       // Salvar redundante para facilitar leitura sem popular
  modelo: String,
  chassi: String,
  origemId: String,
  origemNome: String,
  destinoId: String,
  destinoNome: String,
  data: { type: Date, default: Date.now },
  usuario: { type: String, default: 'Sistema' } // Futuramente você poe o ID do usuário logado
});

module.exports = mongoose.model('Transferencia', TransferenciaSchema);