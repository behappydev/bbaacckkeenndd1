const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');

// Ruta raíz para productos
router.get('/', productsController.getAll);
router.post('/', productsController.create);

// Rutas con ID de producto
router.get('/:pid', productsController.getById);
router.put('/:pid', productsController.update);
router.delete('/:pid', productsController.delete);

module.exports = router;
