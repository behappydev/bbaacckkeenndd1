// repositories/product.repository.js

const productDAO = require('../dao/product.dao');

class ProductRepository {
  /**
   * Obtener todos los productos (con opcional limit).
   * @param {number} [limit]
   * @returns {Promise<Array>}
   */
  async getAll(limit) {
    return productDAO.getAll(limit);
  }

  /**
   * Obtener un producto por su ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  async getById(id) {
    return productDAO.getById(id);
  }

  /**
   * Crear un nuevo producto.
   * @param {Object} productData
   * @returns {Promise<Object>}
   */
  async create(productData) {
    return productDAO.create(productData);
  }

  /**
   * Actualizar un producto por su ID.
   * @param {string} id
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async update(id, updateData) {
    return productDAO.update(id, updateData);
  }

  /**
   * Eliminar un producto por su ID.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return productDAO.delete(id);
  }

  /**
   * Reducir stock de un producto (cantidad especificada).
   * @param {string} id
   * @param {number} quantity
   * @returns {Promise<Object>}
   */
  async decrementStock(id, quantity) {
    return productDAO.updateStock(id, quantity);
  }
}

module.exports = new ProductRepository();
