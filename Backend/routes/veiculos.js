const router = require('express').Router();
const Veiculo = require('../models/Veiculo');

// GET: Buscar todos (Estoque e Vendas)
router.get('/', async (req, res) => {
  try {
    const veiculos = await Veiculo.find().sort({ createdAt: -1 });
    res.json(veiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Criar novo
router.post('/', async (req, res) => {
  try {
    const novoVeiculo = new Veiculo(req.body);
    const salvo = await novoVeiculo.save();
    res.json(salvo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Editar
router.put('/:id', async (req, res) => {
  try {
    const atualizado = await Veiculo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Apagar
router.delete('/:id', async (req, res) => {
  try {
    await Veiculo.findByIdAndDelete(req.params.id);
    res.json({ message: "Deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;