const Product = require("../models/Product");
class ProductDAO {
  async getById(id) { return Product.findById(id); }
  async updateStock(id, qty) {
    return Product.findByIdAndUpdate(id,
      { $inc: { stock: -qty } },
      { new: true }
    );
  }
}
module.exports = new ProductDAO();