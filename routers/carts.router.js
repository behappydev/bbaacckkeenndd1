// routers/carts.router.js
const express = require("express");
const router = express.Router();
const cartsController = require("../controllers/carts.controller");

// POST /api/carts - Crear un nuevo carrito
router.post("/", async (req, res) => {
  try {
    const newCart = await cartsController.create();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/carts/:cid - Obtener un carrito por ID
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartsController.getById(req.params.cid);
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/carts/:cid/product/:pid - Agregar un producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const updatedCart = await cartsController.addProduct(
      req.params.cid,
      req.params.pid
    );
    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
