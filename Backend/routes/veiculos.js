const router = require('express').Router();
const Veiculo = require('../models/Veiculo');
const Transferencia = require('../models/Transferencia'); 

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
    const { id } = req.params;
    const novosDados = req.body;

    // 1. PASSO IMPORTANTE: Buscar o veículo ANTES de atualizar
    const veiculoAntigo = await Veiculo.findById(id);

    if (!veiculoAntigo) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // 2. Verificar se houve troca de concessionária
    // Comparamos IDs como strings para garantir
    const houveTroca = novosDados.concessionariaId && 
                       veiculoAntigo.concessionariaId && 
                       veiculoAntigo.concessionariaId.toString() !== novosDados.concessionariaId.toString();

    if (houveTroca) {
      console.log(`Registrando transferência: ${veiculoAntigo.concessionariaNome} -> ${novosDados.concessionariaNome}`);
      
      // 3. Criar log de transferência
      await Transferencia.create({
        veiculoId: veiculoAntigo._id,
        marca: veiculoAntigo.marca,
        chassi: veiculoAntigo.chassi,
        origemId: veiculoAntigo.concessionariaId,
        origemNome: veiculoAntigo.concessionariaNome,
        destinoId: novosDados.concessionariaId,
        destinoNome: novosDados.concessionariaNome,
        data: new Date()
      });

      novosDados.dataTransferencia = new Date();
    }

    // 4. Efetuar a atualização no banco
    const atualizado = await Veiculo.findByIdAndUpdate(id, novosDados, { new: true });
    
    res.json(atualizado);

  } catch (err) {
    console.error(err);
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