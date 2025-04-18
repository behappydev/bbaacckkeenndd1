// app.js
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT;
const MONGO_URI= process.env.MONGO_URI;

// Importar Handlebars
const exphbs = require("express-handlebars");

// Importar la librería para sanitizar HTML
const sanitizeHtml = require("sanitize-html");

// Importar los controladores
const productsController = require("./controllers/products.controller");
const cartsController = require("./controllers/carts.controller");

// Importar routers
const productsRouter = require("./routers/products.router");
const cartsRouter = require("./routers/carts.router");
const viewsRouter = require("./routers/views.router");

const mongoose = require("mongoose");
const passport = require("passport");
require("./config/passport.config"); 

const cookieParser = require("cookie-parser");

// Suprimir el warning de strictQuery
mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✔️ MongoDB conectado"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));
// 2) Middleware para cookies y Passport
app.use(cookieParser());
app.use(passport.initialize());



// Montar el nuevo router de sesiones
const sessionsRouter = require("./routers/sessions.router");
app.use("/api/sessions", sessionsRouter);


// Middleware para parsear JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Handlebars con el helper sanitizeHTML
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: __dirname + "/views/layouts/",
    helpers: {
      sanitizeHTML: function (text) {
        return sanitizeHtml(text, {
          allowedTags: ["b", "i", "em", "strong", "a"], // Permitir algunas etiquetas seguras
          allowedAttributes: {
            a: ["href"],
          },
          allowedSchemes: ["http", "https", "mailto"],
        });
      },
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", __dirname + "/views");

// Configurar Multer para manejar la subida de imágenes
const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Carpeta donde se almacenarán las imágenes
  },
  filename: function (req, file, cb) {
    // Renombrar el archivo para evitar conflictos
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten archivos de imagen (jpeg, jpg, png, gif, bmp, webp)."
      )
    );
  }
};

// Inicializar Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño de archivo a 5MB
});

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

// Función para validar URLs de imágenes
const isValidImageUrl = (url) => {
  const regex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i;
  return regex.test(url);
};

// Manejar conexiones de Socket.io
io.on("connection", (socket) => {
  console.log("Un usuario se ha conectado");

  // Emitir la lista actual de productos al nuevo cliente
  (async () => {
    try {
      const allProducts = await productsController.getAll();
      socket.emit("updateProducts", allProducts);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      socket.emit("errorMessage", "Error al obtener la lista de productos.");
    }
  })();

  // Evento para agregar producto
  socket.on("newProduct", async (productData) => {
    try {
      // Validar que 'thumbnails' sea un arreglo de URLs válidas
      if (
        !Array.isArray(productData.thumbnails) ||
        productData.thumbnails.length === 0
      ) {
        throw new Error(
          "Debe proporcionar al menos una URL de imagen válida en 'thumbnails'."
        );
      }

      const invalidUrls = productData.thumbnails.filter(
        (url) => !isValidImageUrl(url)
      );
      if (invalidUrls.length > 0) {
        throw new Error(
          `Las siguientes URLs no son válidas o no son imágenes: ${invalidUrls.join(
            ", "
          )}`
        );
      }

      const newProduct = await productsController.create(productData);
      const allProducts = await productsController.getAll();
      io.emit("updateProducts", allProducts); // Emitir a todos los clientes
      socket.emit("successMessage", "Producto agregado exitosamente.");
    } catch (error) {
      console.error("Error al agregar producto:", error.message);
      socket.emit(
        "errorMessage",
        error.message || "Error al agregar el producto."
      );
    }
  });

// Evento para modificar producto
socket.on("modifyProduct", async (updatedProduct) => {
  try {
    // Si el arreglo de thumbnails está vacío, eliminarlo para conservar las imágenes previas
    if (Array.isArray(updatedProduct.thumbnails) && updatedProduct.thumbnails.length === 0) {
      delete updatedProduct.thumbnails;
    } else {
      // Si se envían nuevos thumbnails, validar que sean URLs válidas
      const invalidUrls = updatedProduct.thumbnails.filter(
        (url) => !isValidImageUrl(url)
      );
      if (invalidUrls.length > 0) {
        throw new Error(
          `Las siguientes URLs no son válidas o no son imágenes: ${invalidUrls.join(
            ", "
          )}`
        );
      }
    }

    await productsController.update(updatedProduct.id, updatedProduct);
    const allProducts = await productsController.getAll();
    io.emit("updateProducts", allProducts); // Emitir a todos los clientes
    socket.emit("successMessage", "Producto modificado exitosamente.");
  } catch (error) {
    console.error("Error al modificar producto:", error.message);
    socket.emit(
      "errorMessage",
      error.message || "Error al modificar el producto."
    );
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
      console.error("Error al eliminar producto:", error.message);
      socket.emit(
        "errorMessage",
        error.message || "Error al eliminar el producto."
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("Un usuario se ha desconectado");
  });
});
