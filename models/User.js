// models/User.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcrypt");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  age:        { type: Number, required: true },
  password:   { type: String, required: true },
  cart:       { type: String, default: null },
  role:       { type: String, default: "user", enum: ["user","admin"] }
});

// Hash de la contraseña antes de guardar
userSchema.pre("save", function(next) {
  if (!this.isModified("password")) return next();
  const rounds = Number(process.env.SALT_ROUNDS) || 10;
  this.password = bcrypt.hashSync(this.password, rounds);
  next();
});

// Método para verificar la contraseña
userSchema.methods.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
