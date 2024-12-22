const express = require('express');
const router = express.Router();
const cartsController = require('../controllers/cartsController');

// Ruta raíz para carritos
router.post('/', cartsController.createCart);

// Rutas con ID de carrito
router.get('/:cid', cartsController.getCartById);
router.post('/:cid/product/:pid', cartsController.addProductToCart);

module.exports = router;
