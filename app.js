// app.js

// 1) Cargar variables de entorno
require("dotenv").config();

const express      = require("express");
const mongoose     = require("mongoose");
const passport     = require("./config/passport.config");  // Passport configurado
const cookieParser = require("cookie-parser");
const exphbs       = require("express-handlebars");
const sanitizeHtml = require("sanitize-html");
const multer       = require("multer");
const path         = require("path");
const { Server }   = require("socket.io");

// 2) Importar routers
const sessionsRouter = require("./routers/sessions.router");
const productsRouter = require("./routers/products.router");
const cartsRouter    = require("./routers/carts.router");
const viewsRouter    = require("./routers/views.router");

// 3) Controlador para socket.io
const productsController = require("./controllers/products.controller");

// 4) Crear app de Express
const app  = express();
const PORT = process.env.PORT || 8080;

// 5) Conectar a MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✔️ MongoDB conectado"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

// 6) Middlewares globales
app.use(express.json());                      // Parsear JSON
app.use(express.urlencoded({ extended: true })); // Parsear URL-encoded
app.use(cookieParser());                      // Parsear cookies
app.use(passport.initialize());               // Inicializar Passport

// 7) Configurar Handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    helpers: {
      sanitizeHTML: (text) =>
        sanitizeHtml(text, {
          allowedTags: ["b", "i", "em", "strong", "a"],
          allowedAttributes: { a: ["href"] },
          allowedSchemes: ["http", "https", "mailto"],
        }),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// 8) Configurar Multer para uploads de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename:    (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext    = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + "-" + unique + ext);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|bmp|webp/;
  const okExt   = allowed.test(path.extname(file.originalname).toLowerCase());
  const okMime  = allowed.test(file.mimetype);
  if (okExt && okMime) return cb(null, true);
  cb(new Error("Sólo imágenes (jpeg, jpg, png, gif, bmp, webp)."));
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 9) Servir archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// 10) Montar routers
app.use("/api/sessions", sessionsRouter);
app.use("/api/products", productsRouter);
app.use("/api/carts",    cartsRouter);
app.use("/",              viewsRouter);

// 11) Manejador de rutas no encontradas
app.use((req, res) => {
  res.status(404).render("404");
});

// 12) Arrancar servidor HTTP + Socket.io
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
const io = new Server(server);

// 13) Función auxiliar para validar URL de imagen
const isValidImageUrl = (url) =>
  /^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);

// 14) Lógica de tiempo real con Socket.io
io.on("connection", (socket) => {
  console.log("🔌 Cliente conectado:", socket.id);

  // Emitir lista de productos al nuevo cliente
  (async () => {
    try {
      const all = await productsController.getAll();
      socket.emit("updateProducts", all);
    } catch {
      socket.emit("errorMessage", "Error al obtener productos.");
    }
  })();

  // Nuevo producto
  socket.on("newProduct", async (data) => {
    try {
      if (!Array.isArray(data.thumbnails) || data.thumbnails.length === 0)
        throw new Error("Debes enviar al menos una URL de imagen.");
      const invalid = data.thumbnails.filter((u) => !isValidImageUrl(u));
      if (invalid.length) throw new Error(`URLs inválidas: ${invalid.join(", ")}`);
      await productsController.create(data);
      const all = await productsController.getAll();
      io.emit("updateProducts", all);
      socket.emit("successMessage", "Producto agregado.");
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

  // Modificar producto
  socket.on("modifyProduct", async (prod) => {
    try {
      if (Array.isArray(prod.thumbnails) && prod.thumbnails.length === 0) {
        delete prod.thumbnails;
      } else {
        const bad = prod.thumbnails.filter((u) => !isValidImageUrl(u));
        if (bad.length) throw new Error(`URLs inválidas: ${bad.join(", ")}`);
      }
      await productsController.update(prod.id, prod);
      const all = await productsController.getAll();
      io.emit("updateProducts", all);
      socket.emit("successMessage", "Producto modificado.");
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

  // Eliminar producto
  socket.on("deleteProduct", async (id) => {
    try {
      await productsController.delete(id);
      const all = await productsController.getAll();
      io.emit("updateProducts", all);
      socket.emit("successMessage", "Producto eliminado.");
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Cliente desconectado:", socket.id);
  });
});
