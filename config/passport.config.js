// config/passport.config.js
require("dotenv").config();                // carga variables de entorno
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JWTStrategy } = require("passport-jwt");
const User = require("../models/User");

// extrae el JWT desde la cookie 'token'
const cookieExtractor = (req) =>
  req && req.cookies ? req.cookies["token"] : null;

// Estrategia local para login
passport.use(
  "login",
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || !user.isValidPassword(password)) {
          return done(null, false, { message: "Credenciales inválidas" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Estrategia JWT para rutas protegidas
passport.use(
  "jwt",
  new JWTStrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub).populate("cart");
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
