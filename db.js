const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/backend1', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('✔️ MongoDB conectado');
};