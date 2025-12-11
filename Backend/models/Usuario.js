// models/Usuario.js
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }, 
  
  // ALTERAÇÃO AQUI: Usando enum para travar as opções
  cargo: { 
    type: String, 
    enum: ['vendedor', 'gerente', 'admin'], // Só aceita esses 3
    default: 'vendedor' 
  },
  
  lojaId: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', UsuarioSchema);