const router = require('express').Router();
const Veiculo = require('../models/Veiculo');
const Transferencia = require('../models/Transferencia'); 
const Usuario = require('../models/Usuario'); // <--- 1. Importamos o modelo de Usuário

// --- MIDDLEWARE DE SEGURANÇA ---
// Essa função roda antes de cada rota para descobrir quem está logado
const identificarUsuario = async (req, res, next) => {
  const userId = req.headers['x-userid']; // O Frontend vai mandar isso
  
  if (!userId) {
    return res.status(401).json({ message: 'Acesso negado: ID do usuário não fornecido.' });
  }

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado no banco.' });
    }
    
    req.usuarioLogado = usuario; // "Pendura" o usuário na requisição
    next(); // Pode passar para a próxima etapa
  } catch (error) {
    res.status(500).json({ message: 'Erro ao validar usuário.', error: error.message });
  }
};

// GET: Buscar todos (COM FILTROS DE PERMISSÃO)
router.get('/', identificarUsuario, async (req, res) => {
  try {
    const { usuarioLogado } = req;
    let filtro = {};

    console.log(`🔍 Buscando veículos para: ${usuarioLogado.nome} (${usuarioLogado.cargo})`);

    // --- AQUI ESTÁ A MÁGICA DA SEGURANÇA ---
    if (usuarioLogado.cargo === 'admin') {
      // Admin vê tudo (filtro vazio)
      filtro = {}; 
    } 
    else if (usuarioLogado.cargo === 'gerente') {
      // Gerente vê tudo que tiver o ID da loja dele
      // (Assumindo que o usuário tem lojaId e o veículo tem concessionariaId)
      filtro = { concessionariaId: usuarioLogado.lojaId };
    } 
    else {
      // Vendedor (ou outros) vê APENAS o que ele mesmo criou
      filtro = { criadoPor: usuarioLogado._id };
    }

    const veiculos = await Veiculo.find(filtro).sort({ createdAt: -1 });
    res.json(veiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Criar novo (COM DONO AUTOMÁTICO)
router.post('/', identificarUsuario, async (req, res) => {
  try {
    // Pegamos os dados do formulário e adicionamos o "criadoPor" forçado
    const dadosVeiculo = {
      ...req.body,
      criadoPor: req.usuarioLogado._id, // O dono é quem está logado
      // Se for vendedor/gerente, força a loja dele (opcional, mas recomendado)
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
      console.log(`🚚 Transferência: ${veiculoAntigo.concessionariaNome} -> ${novosDados.concessionariaNome}`);
      
      // 3. Criar log de transferência
      await Transferencia.create({
        veiculoId: veiculoAntigo._id,
        marca: veiculoAntigo.marca,
        chassi: veiculoAntigo.chassi,
        origemId: veiculoAntigo.concessionariaId,
        origemNome: veiculoAntigo.concessionariaNome,
        destinoId: novosDados.concessionariaId,
        destinoNome: novosDados.concessionariaNome,
        responsavelTransferencia: req.usuarioLogado.nome, // <--- Adicionei quem fez a transferência!
        data: new Date()
      });

      novosDados.dataTransferencia = new Date();
    }

    // 4. Efetuar a atualização
    const atualizado = await Veiculo.findByIdAndUpdate(id, novosDados, { new: true });
    
    res.json(atualizado);

  } catch (err) {
    console.error(err);
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