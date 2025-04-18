// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name:  { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  age:        { type: Number, required: true },
  password:   { type: String, required: true },
  cart:       { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  role:       { type: String, default: "user" },
});

// Antes de guardar, hashea la contraseña si cambió
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

// Método para comparar password
userSchema.methods.isValidPassword = function (plainPwd) {
  return bcrypt.compareSync(plainPwd, this.password);
};

module.exports = mongoose.model("User", userSchema);
