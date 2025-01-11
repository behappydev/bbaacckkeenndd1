// app.js
const express = require('express');
const app = express();
const PORT = 8080;

// Importar Handlebars
const exphbs = require('express-handlebars');

// Importar los controladores
const productsController = require('./controllers/products.controller');

// Configurar Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');

// Routers
const productsRouter = require('./routers/products.router');
const cartsRouter = require('./routers/carts.router');
const viewsRouter = require('./routers/views.router'); // Nuevo router para vistas

// Middleware para parsear JSON
app.use(express.json());

// Rutas principales
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // Usar el router de vistas

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).render('404'); // Crear una vista 404 si querés
});

// Inicio del servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurar Socket.io
const { Server } = require('socket.io');
const io = new Server(server);

// Pasar io a los routers si es necesario
app.set('io', io);

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado');

    // Escuchar eventos de agregar producto
    socket.on('newProduct', async (productData) => {
        try {
            const newProduct = await productsController.create(productData);
            const allProducts = await productsController.getAll();
            io.emit('updateProducts', allProducts); // Emitir a todos los clientes
        } catch (error) {
            console.error('Error al agregar producto:', error);
        }
    });

    // Escuchar eventos de eliminar producto
    socket.on('deleteProduct', async (productId) => {
        try {
            await productsController.delete(productId);
            const allProducts = await productsController.getAll();
            io.emit('updateProducts', allProducts);
        } catch (error) {
            console.error('Error al eliminar producto:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
    });
});
