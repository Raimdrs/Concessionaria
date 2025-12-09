// routes/usuarios.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// ROTA 1: CADASTRAR USUÁRIO (POST /api/usuarios/registrar)
router.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha, cargo, lojaId } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    const novoUsuario = new Usuario({ nome, email, senha, cargo, lojaId });
    await novoUsuario.save();

    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// ROTA 2: LOGIN (POST /api/usuarios/login)
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email });
    
    // Verificar se usuário existe e se a senha bate
    // (Num sistema real, usaríamos bcrypt para comparar hash)
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Retorna os dados do usuário para o Frontend salvar
    res.json({
      _id: usuario._id,
      id: usuario._id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      lojaId: usuario.lojaId
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
});

module.exports = router;