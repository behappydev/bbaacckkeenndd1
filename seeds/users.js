// /seeds/users.js

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✔️ MongoDB conectado');

    // Limpia la colección de usuarios
    await User.deleteMany({});
    console.log('🗑️ Colección de usuarios vaciada');

    // Crea 10 usuarios falsos (el primero es admin)
    const users = [];
    for (let i = 0; i < 10; i++) {
      const plainPwd = 'coder123';
      users.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
        age: faker.number.int({ min: 18, max: 70 }),
        password: bcrypt.hashSync(plainPwd, SALT_ROUNDS),
        role: i === 0 ? 'admin' : 'user',
        cart: null
      });
    }

    await User.insertMany(users);
    console.log('✅ Usuarios insertados!');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB, seed finalizado');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al insertar usuarios:', err);
    process.exit(1);
  }
}

seedUsers();
