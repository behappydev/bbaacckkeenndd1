// routers/products.router.js

const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");
const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento para Multer
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

// Filtro para aceptar solo tipos de imagen válidos
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

// Inicializar Multer con la configuración definida
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limitar el tamaño de archivo a 5MB
});

// Ruta para subir imágenes
// POST /api/products/upload
/**
 * @swagger
 * /api/products/upload:
 *   post:
 *     summary: Subir imágenes de productos
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Imágenes subidas correctamente
 */
router.post("/upload", upload.array("thumbnails", 5), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se subieron archivos." });
    }

    // Obtener las URLs de las imágenes subidas
    const thumbnails = files.map(
      (file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    );

    return res.status(200).json({ thumbnails });
  } catch (error) {
    console.error("Error al subir imágenes:", error);
    return res
      .status(500)
      .json({ error: error.message || "Error al subir las imágenes." });
  }
});

// GET /api/products?limit=10 - Listar todos los productos con opción de limitación
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de productos a retornar
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
      return res
        .status(400)
        .json({ error: "El parámetro limit debe ser un número positivo" });
    }
    const products = await productsController.getAll(limit);
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al obtener los productos." });
  }
});

// GET /api/products/:pid - Obtener un producto por ID
/**
 * @swagger
 * /api/products/{pid}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const product = await productsController.getById(pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error(
      `Error al obtener el producto con ID ${req.params.pid}:`,
      error
    );
    res
      .status(500)
      .json({ error: error.message || "Error al obtener el producto." });
  }
});

// POST /api/products - Agregar un nuevo producto
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Agregar un nuevo producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               thumbnails:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Error en los datos enviados
 */
router.post("/", async (req, res) => {
  try {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
      "thumbnails",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Faltan los campos: ${missingFields.join(", ")}` });
    }

    // Validar tipos de datos
    const {
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
      status,
    } = req.body;
    if (
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof code !== "string" ||
      typeof price !== "number" ||
      typeof stock !== "number" ||
      typeof category !== "string" ||
      !Array.isArray(thumbnails) ||
      (status !== undefined && typeof status !== "boolean")
    ) {
      return res.status(400).json({
        error: "Tipos de datos inválidos en los campos proporcionados",
      });
    }

    const newProduct = await productsController.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res
      .status(500)
      .json({ error: error.message || "Error al crear el producto." });
  }
});

// PUT /api/products/:pid - Actualizar un producto por ID
/**
 * @swagger
 * /api/products/{pid}:
 *   put:
 *     summary: Actualizar un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               code:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: boolean
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *               thumbnails:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       400:
 *         description: Error en los datos enviados
 *       404:
 *         description: Producto no encontrado
 */
router.put("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    // Validar que el cuerpo de la solicitud no contenga el campo 'id'
    if (req.body.id) {
      return res
        .status(400)
        .json({ error: "No se puede actualizar el campo id" });
    }

    // Validar tipos de datos si se proporcionan
    const allowedFields = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails",
    ];
    const invalidFields = Object.keys(req.body).filter(
      (field) => !allowedFields.includes(field)
    );
    if (invalidFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Campos inválidos: ${invalidFields.join(", ")}` });
    }

    const updatedProduct = await productsController.update(pid, req.body);
    res.json(updatedProduct);
  } catch (error) {
    console.error(
      `Error al actualizar producto con ID ${req.params.pid}:`,
      error
    );
    if (error.message === "Producto no encontrado.") {
      res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Error al actualizar el producto." });
    }
  }
});

// DELETE /api/products/:pid - Eliminar un producto por ID
/**
 * @swagger
 * /api/products/{pid}:
 *   delete:
 *     summary: Eliminar un producto por ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         description: Producto no encontrado
 */
router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    const result = await productsController.delete(pid);
    res.json(result);
  } catch (error) {
    console.error(
      `Error al eliminar producto con ID ${req.params.pid}:`,
      error
    );
    if (error.message === "Producto no encontrado.") {
      res.status(404).json({ error: error.message });
    } else {
      res
        .status(500)
        .json({ error: error.message || "Error al eliminar el producto." });
    }
  }
});

module.exports = router;
