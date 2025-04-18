// routers/sessions.router.js
require("dotenv").config();
const Router = require("express").Router;
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "1h";

// POST /api/sessions/login
router.post(
  "/login",
  passport.authenticate("login", { session: false }),
  (req, res) => {
    // firmamos el token
    const token = jwt.sign({ sub: req.user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    // seteamos cookie y devolvemos datos de usuario
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, // 1h en ms
      })
      .json({
        status: "success",
        payload: {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart,
        },
      });
  }
);

// GET /api/sessions/current
router.get(
  "/current",
  passport.authenticate("jwt", { session: false, failWithError: true }),
  (req, res) => {
    // si llegamos aquí, el token era válido y req.user está poblado
    const { first_name, last_name, email, age, role, cart } = req.user;
    res.json({ status: "success", payload: { first_name, last_name, email, age, role, cart } });
  },
  (err, req, res, next) => {
    // handler de error de Passport
    res.status(401).json({ status: "error", message: "Token inválido o expirado" });
  }
);

module.exports = router;
