// seed.js
require("dotenv").config();            // 1) ¡Lo primero!
const mongoose = require("mongoose");
const Product  = require("./models/Product"); // Asegúrate de que este archivo exporta tu modelo Mongoose
const data     = require("./data/productos.json"); // Tu JSON original

async function runSeed() {
  try {
    // 2) Configuración para evitar el warning de strictQuery
    mongoose.set("strictQuery", true);

    // 3) Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✔️ MongoDB conectado para seed");

    // 4) Limpiar colección de productos
    await Product.deleteMany({});
    console.log("🗑️  Colección Product vaciada");

    // 5) Preparar documentos para insertar
    const docs = data.map((p) => ({
      title:       p.title,
      description: p.description,
      code:        p.code,
      price:       p.price,
      status:      p.status,
      stock:       p.stock,
      category:    p.category,
      thumbnails:  p.thumbnails,
    }));

    // 6) Insertar todos los productos
    await Product.insertMany(docs);
    console.log(`✅ ${docs.length} productos insertados`);

    // 7) Cerrar conexión
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB, seed finalizada");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error en seed:", err);
    process.exit(1);
  }
}

runSeed();
