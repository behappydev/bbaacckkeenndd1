// config/passport.config.js
require("dotenv").config();
const passport      = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy   = require("passport-jwt").Strategy;
const ExtractJwt    = require("passport-jwt").ExtractJwt;
const User          = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;

// Estrategia de login con email + password
passport.use(
  "login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        // Aquí usamos el método definido en el esquema
        if (!user.isValidPassword(password)) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Estrategia JWT: extrae de cookie 'token'
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let token = null;
          if (req && req.cookies) token = req.cookies.token;
          return token;
        },
      ]),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;
