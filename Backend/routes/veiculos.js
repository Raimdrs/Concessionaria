const router = require('express').Router();
const Veiculo = require('../models/Veiculo');
const Transferencia = require('../models/Transferencia'); 
const Usuario = require('../models/Usuario');

// --- MIDDLEWARE DE SEGURANÇA ---
const identificarUsuario = async (req, res, next) => {
  const userId = req.headers['x-userid'];
  
  if (!userId) {
    return res.status(401).json({ 
      message: 'Acesso negado: Header x-userid não fornecido.',
      hint: 'Use a aplicação web para fazer requisições autenticadas.'
    });
  }

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado no banco.' });
    }
    
    req.usuarioLogado = usuario;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar usuário.', error: error.message });
  }
};

// ROTA DE DEBUG (SEM AUTENTICAÇÃO) - APENAS PARA TESTAR
router.get('/debug/todos', async (req, res) => {
  try {
    const veiculos = await Veiculo.find().sort({ createdAt: -1 });
    res.json({
      total: veiculos.length,
      veiculos: veiculos
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Buscar todos (COM FILTROS DE PERMISSÃO)
router.get('/', identificarUsuario, async (req, res) => {
  try {
    const { usuarioLogado } = req;
    let filtro = {};
    let infoAdicional = {};

    if (usuarioLogado.cargo === 'admin') {
      filtro = {};
      infoAdicional = { 
        permissao: 'admin', 
        mensagem: 'Acesso total a todos os veículos' 
      };
    } 
    else if (usuarioLogado.cargo === 'gerente') {
      if (!usuarioLogado.lojaId) {
        return res.status(403).json({ 
          error: 'Gerente sem loja associada',
          mensagem: 'Você precisa estar vinculado a uma loja. Contate o administrador.',
          veiculos: []
        });
      }
      filtro = { concessionariaId: usuarioLogado.lojaId };
      infoAdicional = { 
        permissao: 'gerente', 
        lojaId: usuarioLogado.lojaId,
        mensagem: `Visualizando veículos da sua loja` 
      };
    } 
    else {
      // Vendedor vê apenas seus próprios veículos
      filtro = { criadoPor: usuarioLogado._id.toString() };
      infoAdicional = { 
        permissao: 'vendedor', 
        usuarioId: usuarioLogado._id.toString(),
        mensagem: 'Você visualiza apenas os veículos que cadastrou' 
      };
    }

    const veiculos = await Veiculo.find(filtro).sort({ createdAt: -1 });
    
    res.json({
      veiculos,
      total: veiculos.length,
      ...infoAdicional
    });
  } catch (err) {
    res.status(500).json({ error: err.message, veiculos: [] });
  }
});

// POST: Criar novo (COM DONO AUTOMÁTICO)
router.post('/', identificarUsuario, async (req, res) => {
  try {
    const dadosVeiculo = {
      ...req.body,
      criadoPor: req.usuarioLogado._id.toString(),
      concessionariaId: req.body.concessionariaId || req.usuarioLogado.lojaId 
    };

    const novoVeiculo = new Veiculo(dadosVeiculo);
    const salvo = await novoVeiculo.save();
    
    res.json(salvo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT: Editar (MANTENDO SUA LÓGICA DE TRANSFERÊNCIA)
router.put('/:id', identificarUsuario, async (req, res) => {
  try {
    const { id } = req.params;
    const novosDados = req.body;

    // 1. Buscar o veículo ANTES de atualizar
    const veiculoAntigo = await Veiculo.findById(id);

    if (!veiculoAntigo) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }

    // 2. Verificar se houve troca de concessionária
    const houveTroca = novosDados.concessionariaId && 
                       veiculoAntigo.concessionariaId && 
                       veiculoAntigo.concessionariaId.toString() !== novosDados.concessionariaId.toString();

    if (houveTroca) {
      await Transferencia.create({
        veiculoId: veiculoAntigo._id,
        marca: veiculoAntigo.marca,
        chassi: veiculoAntigo.chassi,
        origemId: veiculoAntigo.concessionariaId,
        origemNome: veiculoAntigo.concessionariaNome,
        destinoId: novosDados.concessionariaId,
        destinoNome: novosDados.concessionariaNome,
        responsavelTransferencia: req.usuarioLogado.nome,
        data: new Date()
      });

      novosDados.dataTransferencia = new Date();
    }

    const atualizado = await Veiculo.findByIdAndUpdate(id, novosDados, { new: true });
    
    res.json(atualizado);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE: Apagar
router.delete('/:id', identificarUsuario, async (req, res) => {
  try {
    // Opcional: Aqui você poderia impedir que um vendedor delete um carro que não é dele
    await Veiculo.findByIdAndDelete(req.params.id);
    res.json({ message: "Deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;