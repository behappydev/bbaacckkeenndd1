const { faker } = require('@faker-js/faker');
const bcrypt      = require('bcrypt');
const { v4: uuid } = require('uuid');
const mongoose    = require('mongoose');

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;

function generateUsers(count = 1) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const first_name = faker.name.firstName();
    const last_name  = faker.name.lastName();
    const email      = faker.internet.email(first_name, last_name).toLowerCase();
    const age        = faker.datatype.number({ min: 18, max: 80 });
    const plainPwd   = 'coder123';
    const password   = bcrypt.hashSync(plainPwd, SALT_ROUNDS);
    const role       = faker.helpers.arrayElement(['user','admin']);
    // Creamos un _id al estilo Mongo:
    const _id        = new mongoose.Types.ObjectId().toString();

    users.push({
      _id,
      first_name,
      last_name,
      email,
      age,
      password,
      role,
      mods: []  // siempre vacío
    });
  }
  return users;
}

function generateMods(count = 1) {
  const mods = [];
  for (let i = 0; i < count; i++) {
    mods.push({
      _id: uuid(), 
      name: faker.hacker.noun(),
      description: faker.hacker.phrase()
    });
  }
  return mods;
}

module.exports = { generateUsers, generateMods };
