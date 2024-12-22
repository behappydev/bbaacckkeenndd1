// routers/carts.router.js
const express = require('express');
const router = express.Router();
const cartsController = require('../controllers/carts.controller');

// POST /api/carts - Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartsController.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/carts/:cid - Obtener productos de un carrito por ID
router.get('/:cid', async (req, res) => {
    try {
        const cid = req.params.cid;
        const products = await cartsController.getCartById(cid);
        res.json(products);
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedProducts = await cartsController.addProductToCart(cid, pid);
        res.json(updatedProducts);
    } catch (error) {
        if (error.message === 'Carrito no encontrado' || error.message === 'Producto no encontrado') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
