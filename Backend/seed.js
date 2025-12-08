// seed.js
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario'); // Ajuste o caminho se necessário

// URL do banco (igual ao server.js)
const MONGO_URI = 'mongodb://mongo:27017/concessionariaDB';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔌 Conectado ao MongoDB para semear...');

    // Verifica se já existe
    const adminExiste = await Usuario.findOne({ email: 'admin@auto.com' });

    if (adminExiste) {
      console.log('⚠️ Usuário Admin já existe. Nada a fazer.');
    } else {
      await Usuario.create({
        nome: "Administrador",
        email: "admin@auto.com",
        senha: "123456", // Em produção, usaríamos hash de senha aqui
        cargo: "admin"
      });
      console.log('✅ Usuário Admin criado com sucesso!');
    }

    console.log('🌱 Seed finalizado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
};

seedAdmin();