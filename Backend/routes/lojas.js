const router = require('express').Router();
const Loja = require('../models/Loja');

// GET: Buscar todas as lojas
router.get('/', async (req, res) => {
  try {
    const lojas = await Loja.find().sort({ createdAt: -1 });
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