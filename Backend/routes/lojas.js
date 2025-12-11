const router = require('express').Router();
const Loja = require('../models/Loja');
const Usuario = require('../models/Usuario');

// GET: Buscar lojas (com filtro por permissão)
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-userid'];
    
    // Se não tiver userId, retorna todas (para compatibilidade com seletor público)
    if (!userId) {
      const lojas = await Loja.find().sort({ createdAt: -1 });
      return res.json(lojas);
    }

    const usuarioLogado = await Usuario.findById(userId);
    
    if (!usuarioLogado) {
      const lojas = await Loja.find().sort({ createdAt: -1 });
      return res.json(lojas);
    }

    let lojas;

    // Admin vê todas as lojas
    if (usuarioLogado.cargo === 'admin') {
      lojas = await Loja.find().sort({ createdAt: -1 });
    } 
    // Gerente e Vendedor veem apenas sua loja
    else if (usuarioLogado.lojaId) {
      lojas = await Loja.find({ _id: usuarioLogado.lojaId }).sort({ createdAt: -1 });
    } 
    // Se não tiver lojaId, retorna vazio
    else {
      lojas = [];
    }

    res.json(lojas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Criar nova loja
router.post('/', async (req, res) => {
  try {
    const novaLoja = new Loja(req.body);
    const salva = await novaLoja.save();
    res.json(salva);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;