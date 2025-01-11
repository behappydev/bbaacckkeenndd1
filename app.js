// app.js
const express = require("express");
const app = express();
const PORT = 8080;

// Importar Handlebars
const exphbs = require("express-handlebars");

// Importar los controladores
const productsController = require("./controllers/products.controller");
const cartsController = require("./controllers/carts.controller");

// Configurar Handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
  })
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Routers
const productsRouter = require("./routers/products.router");
const cartsRouter = require("./routers/carts.router");
const viewsRouter = require("./routers/views.router");

// Middleware para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (CSS, JS, imágenes, etc.)
app.use(express.static(__dirname + "/public"));

// Rutas principales
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter); // Usar el router de vistas

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).render("404");
});

// Inicio del servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Configurar Socket.io
const { Server } = require("socket.io");
const io = new Server(server);

// Manejar conexiones de Socket.io
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Emitir la lista actual de productos al nuevo cliente
  (async () => {
    const allProducts = await productsController.getAll();
    socket.emit("updateProducts", allProducts);
  })();

  // Evento para agregar producto
  socket.on("newProduct", async (productData) => {
    try {
      const newProduct = await productsController.create(productData);
      const allProducts = await productsController.getAll();
      io.emit("updateProducts", allProducts); // Emitir a todos los clientes
      socket.emit("successMessage", "Producto agregado exitosamente.");
    } catch (error) {
      console.error("Error al agregar producto:", error);
      socket.emit("errorMessage", "Error al agregar el producto.");
    }
  });

  // Evento para modificar producto
  socket.on("modifyProduct", async (updatedProduct) => {
    try {
      await productsController.update(updatedProduct.id, updatedProduct);
      const allProducts = await productsController.getAll();
      io.emit("updateProducts", allProducts); // Emitir a todos los clientes
      socket.emit("successMessage", "Producto modificado exitosamente.");
    } catch (error) {
      console.error("Error al modificar producto:", error);
      socket.emit("errorMessage", "Error al modificar el producto.");
    }
  });

  // Evento para eliminar producto
  socket.on("deleteProduct", async (productId) => {
    try {
      await productsController.delete(productId);
      const allProducts = await productsController.getAll();
      io.emit("updateProducts", allProducts); // Emitir a todos los clientes
      socket.emit("successMessage", "Producto eliminado exitosamente.");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      socket.emit("errorMessage", "Error al eliminar el producto.");
    }
  });

  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado");
  });
});
