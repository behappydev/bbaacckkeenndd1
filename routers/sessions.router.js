// routers/sessions.router.js

require("dotenv").config();
const Router          = require("express").Router;
const passport        = require("passport");
const jwt             = require("jsonwebtoken");
const User            = require("../models/User");
const cartsController = require("../controllers/carts.controller");
const UserDTO         = require("../dtos/user.dto");

const router      = Router();
const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.TOKEN_EXPIRES_IN || "1h";

/**
 * POST /api/sessions/register
 * - Crea un carrito vacío
 * - Registra el usuario vinculando el ID del carrito
 */
/**
 * @swagger
 * /api/sessions/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               age:
 *                 type: number
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Faltan datos obligatorios
 */
router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Faltan datos obligatorios" });
    }

    // Verificar email único
    if (await User.findOne({ email })) {
      return res
        .status(409)
        .json({ status: "error", message: "El email ya está en uso" });
    }

    // Crear carrito vacío (file‑based)
    const newCart = await cartsController.create(); // { id, products: [] }

    // Crear y guardar usuario con referencia a ese carrito
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password,
      cart: newCart.id
    });
    await newUser.save();

    res
      .status(201)
      .json({ status: "success", message: "Usuario registrado correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: err.message || "Error en registro" });
  }
});

/**
 * POST /api/sessions/login
 * - Usa la estrategia 'login' de Passport
 * - Genera JWT y lo envía como cookie HttpOnly
 */
/**
 * @swagger
 * /api/sessions/login:
 *   post:
 *     summary: Iniciar sesión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       401:
 *         description: Credenciales inválidas
 */
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  (req, res) => {
    const token = jwt.sign({ sub: req.user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1 hora
      })
      .json({ status: "success", payload: new UserDTO(req.user) });
  }
);

/**
 * GET /api/sessions/current
 * - Extrae JWT de la cookie y retorna UserDTO
 */
/**
 * @swagger
 * /api/sessions/current:
 *   get:
 *     summary: Obtener el usuario actual autenticado
 *     responses:
 *       200:
 *         description: Usuario autenticado encontrado
 *       401:
 *         description: Token inválido o expirado
 */
router.get(
  "/current",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  (req, res) => {
    res.json({ status: "success", payload: new UserDTO(req.user) });
  },
  (err, req, res, next) => {
    res.status(401).json({ status: "error", message: "Token inválido o expirado" });
  }
);

module.exports = router;
