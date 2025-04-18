// dao/cart.dao.js
const Cart = require("../models/Cart");

class CartDAO {
  // Crear un carrito vacío
  async create() {
    return Cart.create({ products: [] });
  }

  // Obtener carrito por ID (poblando la referencia de producto)
  async getById(id) {
    return Cart.findById(id).populate("products.product");
  }

  // Reemplazar array completo de productos
  async updateProducts(id, products) {
    return Cart.findByIdAndUpdate(
      id,
      { products },
      { new: true }
    ).populate("products.product");
  }
}

module.exports = new CartDAO();
