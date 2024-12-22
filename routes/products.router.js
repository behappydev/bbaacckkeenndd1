// routers/products.router.js
const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

// GET /api/products?limit=10 - Listar todos los productos con opción de limitación
router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        if (limit !== undefined && (isNaN(limit) || limit <= 0)) {
            return res.status(400).json({ error: 'El parámetro limit debe ser un número positivo' });
        }
        const products = await productsController.getAll(limit);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/products/:pid - Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const product = await productsController.getById(pid);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Agregar un nuevo producto
router.post('/', async (req, res) => {
    try {
        const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Faltan los campos: ${missingFields.join(', ')}` });
        }

        // Validar tipos de datos
        const { title, description, code, price, stock, category, thumbnails, status } = req.body;
        if (
            typeof title !== 'string' ||
            typeof description !== 'string' ||
            typeof code !== 'string' ||
            typeof price !== 'number' ||
            typeof stock !== 'number' ||
            typeof category !== 'string' ||
            (thumbnails && !Array.isArray(thumbnails)) ||
            (status !== undefined && typeof status !== 'boolean')
        ) {
            return res.status(400).json({ error: 'Tipos de datos inválidos en los campos proporcionados' });
        }

        const newProduct = await productsController.create(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api/products/:pid - Actualizar un producto por ID
router.put('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;

        // Validar que el cuerpo de la solicitud no contenga el campo 'id'
        if (req.body.id) {
            return res.status(400).json({ error: 'No se puede actualizar el campo id' });
        }

        // Validar tipos de datos si se proporcionan
        const allowedFields = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
        const invalidFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            return res.status(400).json({ error: `Campos inválidos: ${invalidFields.join(', ')}` });
        }

        const updatedProduct = await productsController.update(pid, req.body);
        res.json(updatedProduct);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// DELETE /api/products/:pid - Eliminar un producto por ID
router.delete('/:pid', async (req, res) => {
    try {
        const pid = req.params.pid;
        const result = await productsController.delete(pid);
        res.json(result);
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
