// routers/carts.router.js

const Router           = require("express").Router;
const passport         = require("passport");
const cartsController  = require("../controllers/carts.controller");
const cartRepo         = require("../repositories/cart.repository");
const { permit, ownCart } = require("../middlewares/auth.middleware");

const router = Router();

/**
 * POST /api/carts
 * Crear un nuevo carrito (público)
 */
router.post("/", async (req, res) => {
  try {
    const newCart = await cartsController.create();
    res.status(201).json({ status: "success", cart: newCart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * GET /api/carts/:cid
 * Obtener un carrito por ID (público)
 */
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartsController.getById(req.params.cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
    res.json({ status: "success", cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

/**
 * POST /api/carts/:cid/product/:pid
 * Agregar un producto al carrito (usa JSON file‑based)
 * - Solo usuarios autenticados con rol `user`
 * - Solo sobre su propio carrito
 */
router.post(
  "/:cid/product/:pid",
  passport.authenticate("jwt", { session: false }),
  permit("user"),
  ownCart(),
  async (req, res) => {
    try {
      // Llamamos al controller de archivos (funciona con data/carritos.json)
      const updatedCart = await cartsController.addProduct(
        req.params.cid,
        req.params.pid
      );
      return res.json({ status: "success", cart: updatedCart });
    } catch (error) {
      return res.status(400).json({ status: "error", message: error.message });
    }
  }
);

/**
 * POST /api/carts/:cid/purchase
 * Finalizar compra de un carrito:
 * - Solo usuarios autenticados con rol `user`
 * - Solo sobre su propio carrito
 * - Usa cartRepo (Mongo) o implementa tu propia lógica file‑based
 */
router.post(
  "/:cid/purchase",
  passport.authenticate("jwt", { session: false }),
  permit("user"),
  ownCart(),
  async (req, res) => {
    try {
      const { ticket, insufficient } = await cartRepo.purchase(
        req.params.cid,
        req.user.email
      );
      return res.json({ status: "success", ticket, insufficient });
    } catch (error) {
      return res.status(500).json({ status: "error", message: error.message });
    }
  }
);

module.exports = router;
