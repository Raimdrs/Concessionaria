// seed.js
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const MONGO_URI = 'mongodb://mongo:27017/concessionariaDB';

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const adminExiste = await Usuario.findOne({ email: 'admin@auto.com' });

    if (!adminExiste) {
      await Usuario.create({
        nome: "Administrador",
        email: "admin@auto.com",
        senha: "123456",
        cargo: "admin"
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Erro no seed:', error);
    process.exit(1);
  }
};

seedAdmin();

seedAdmin();