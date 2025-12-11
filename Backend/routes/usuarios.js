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

// ROTA 3: LISTAR USUÁRIOS (GET /api/usuarios)
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-userid'];
    
    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const usuarioLogado = await Usuario.findById(userId);
    
    if (!usuarioLogado) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    let filtro = {};

    // Admin vê todos os usuários
    if (usuarioLogado.cargo === 'admin') {
      filtro = {};
    } 
    // Gerente vê apenas usuários da sua loja
    else if (usuarioLogado.cargo === 'gerente') {
      if (!usuarioLogado.lojaId) {
        return res.status(403).json({ 
          message: 'Gerente precisa estar vinculado a uma loja',
          usuarios: []
        });
      }
      filtro = { lojaId: usuarioLogado.lojaId };
    }
    // Vendedor não tem permissão
    else {
      return res.status(403).json({ 
        message: 'Você não tem permissão para visualizar usuários',
        usuarios: []
      });
    }

    const usuarios = await Usuario.find(filtro).select('-senha');
    
    res.json({
      usuarios,
      total: usuarios.length,
      permissao: usuarioLogado.cargo
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// ROTA 4: ATUALIZAR USUÁRIO (PUT /api/usuarios/:id)
router.put('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-userid'];
    const { id } = req.params;
    const { nome, email, cargo, lojaId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const usuarioLogado = await Usuario.findById(userId);
    
    // Apenas admin pode atualizar usuários
    if (usuarioLogado.cargo !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem editar usuários' });
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      id,
      { nome, email, cargo, lojaId },
      { new: true }
    ).select('-senha');

    if (!usuarioAtualizado) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(usuarioAtualizado);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// ROTA 5: DELETAR USUÁRIO (DELETE /api/usuarios/:id)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-userid'];
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Autenticação necessária' });
    }

    const usuarioLogado = await Usuario.findById(userId);
    
    // Apenas admin pode deletar usuários
    if (usuarioLogado.cargo !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem excluir usuários' });
    }

    // Não pode deletar a si mesmo
    if (userId === id) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
    }

    const usuarioDeletado = await Usuario.findByIdAndDelete(id);

    if (!usuarioDeletado) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  }
});

module.exports = router;