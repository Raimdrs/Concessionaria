// models/Usuario.js
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }, // Obs: Em produção real, criptografamos isso
  cargo: { type: String, default: 'vendedor' }, // gerente, admin, vendedor
  lojaId: { type: String } // Opcional, para vincular a uma loja
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);