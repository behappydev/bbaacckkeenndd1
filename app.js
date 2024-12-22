const express = require('express');
const app = express();
const productsRoutes = require('./routes/products');
const cartsRoutes = require('./routes/carts');

// Middleware para parsear JSON
app.use(express.json());

// Rutas de la API
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar el servidor en el puerto 8080
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
