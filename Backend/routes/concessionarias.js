const router = require('express').Router();
const Concessionaria = require('../models/Concessionaria');

// Listar todas
router.get('/', async (req, res) => {
  try {
    const lista = await Concessionaria.find();
    res.json(lista);
  } catch (err) { res.status(500).json(err); }
});

// Criar nova
router.post('/', async (req, res) => {
  try {
    const nova = new Concessionaria(req.body);
    const salva = await nova.save();
    res.json(salva);
  } catch (err) { res.status(400).json(err); }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    await Concessionaria.findByIdAndDelete(req.params.id);
    res.json("Deletada");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;