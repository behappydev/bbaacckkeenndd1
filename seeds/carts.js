require('dotenv').config();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');

async function seedCarts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Cart.deleteMany({});
    const carts = [];
    for (let i = 0; i < 5; i++) {
      carts.push({ products: [] });
    }
    await Cart.insertMany(carts);
    console.log('✅ Carritos insertados!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al insertar carritos:', err);
    process.exit(1);
  }
}

seedCarts();
