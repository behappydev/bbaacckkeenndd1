require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');
const { v4: uuidv4 } = require('uuid');

async function seedTickets() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Ticket.deleteMany({});
    const tickets = [];
    for (let i = 0; i < 5; i++) {
      tickets.push({
        code: uuidv4(),
        purchase_datetime: new Date(),
        amount: Math.floor(Math.random() * 1000) + 1,
        purchaser: `usuario${i}@example.com`
      });
    }
    await Ticket.insertMany(tickets);
    console.log('✅ Tickets insertados!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al insertar tickets:', err);
    process.exit(1);
  }
}

seedTickets();
