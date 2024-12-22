// app.js
const express = require('express');
const app = express();
const PORT = 8080;

// Routers
const productsRouter = require('./routers/products.router.js');
const cartsRouter = require('./routers/carts.router.js');

// Middleware para parsear JSON
app.use(express.json());

// Rutas principales
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
