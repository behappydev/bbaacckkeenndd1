// routers/views.router.js
const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");

// Ruta para la vista home.handlebars
router.get("/home", async (req, res) => {
  try {
    const products = await productsController.getAll();
    res.render("home", { products });
  } catch (error) {
    res.status(500).send("Error al cargar los productos");
  }
});

// Ruta para la vista realTimeProducts.handlebars
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productsController.getAll();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send("Error al cargar los productos en tiempo real");
  }
});

// Redireccionar la raíz a /home
router.get("/", (req, res) => {
  res.redirect("/home");
});

module.exports = router;
