// controllers/products.controller.js

const FileManager = require("../utils/fileManager");
const validator = require("validator"); // Librería para validación
const sanitizeHtml = require("sanitize-html"); // Librería para sanitización

class ProductsController {
  constructor() {
    this.fileManager = new FileManager("data/productos.json");
  }

  /**
   * Obtener todos los productos, con opción de limitación.
   * @param {number} [limit] - Número máximo de productos a devolver.
   * @returns {Promise<Array>} - Lista de productos.
   */
  async getAll(limit) {
    try {
      const products = await this.fileManager.readFile();
      if (limit && Number.isInteger(limit) && limit > 0) {
        return products.slice(0, limit);
      }
      return products;
    } catch (error) {
      console.error("Error al obtener todos los productos:", error);
      throw new Error("No se pudo obtener la lista de productos.");
    }
  }

  /**
   * Obtener un producto por su ID.
   * @param {string} pid - ID del producto.
   * @returns {Promise<Object|null>} - Producto encontrado o null si no existe.
   */
  async getById(pid) {
    try {
      const products = await this.fileManager.readFile();
      return products.find((product) => product.id === pid) || null;
    } catch (error) {
      console.error(`Error al obtener el producto con ID ${pid}:`, error);
      throw new Error("No se pudo obtener el producto.");
    }
  }

  /**
   * Crear un nuevo producto.
   * @param {Object} productData - Datos del producto a crear.
   * @returns {Promise<Object>} - Producto creado.
   */
  async create(productData) {
    try {
      // Validar y sanitizar los datos del producto
      const sanitizedData = this.validateAndSanitizeProductData(
        productData,
        true
      );

      const products = await this.fileManager.readFile();
      const newId = this.generateId(products);
      const newProduct = {
        id: newId.toString(),
        ...sanitizedData,
        status:
          sanitizedData.status !== undefined ? sanitizedData.status : true,
        thumbnails: sanitizedData.thumbnails || [],
      };
      products.push(newProduct);
      await this.fileManager.writeFile(products);
      return newProduct;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw new Error(error.message || "No se pudo crear el producto.");
    }
  }

  /**
   * Actualizar un producto por su ID.
   * @param {string} pid - ID del producto a actualizar.
   * @param {Object} updatedData - Datos actualizados del producto.
   * @returns {Promise<Object>} - Producto actualizado.
   */
  async update(pid, updatedData) {
    try {
      // Validar y sanitizar los datos actualizados del producto
      const sanitizedData = this.validateAndSanitizeProductData(
        updatedData,
        false
      );

      const products = await this.fileManager.readFile();
      const index = products.findIndex((product) => product.id === pid);
      if (index === -1) {
        throw new Error("Producto no encontrado.");
      }

      // Evitar actualizar el ID
      const { id, ...rest } = sanitizedData;
      products[index] = { ...products[index], ...rest };
      await this.fileManager.writeFile(products);
      return products[index];
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${pid}:`, error);
      throw new Error(error.message || "No se pudo actualizar el producto.");
    }
  }

  /**
   * Eliminar un producto por su ID.
   * @param {string} pid - ID del producto a eliminar.
   * @returns {Promise<Object>} - Mensaje de eliminación exitosa.
   */
  async delete(pid) {
    try {
      let products = await this.fileManager.readFile();
      const initialLength = products.length;
      products = products.filter((product) => product.id !== pid);
      if (products.length === initialLength) {
        throw new Error("Producto no encontrado.");
      }
      await this.fileManager.writeFile(products);
      return { message: "Producto eliminado exitosamente." };
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${pid}:`, error);
      throw new Error(error.message || "No se pudo eliminar el producto.");
    }
  }

  /**
   * Generar un ID único para un nuevo producto.
   * @param {Array} products - Lista de productos existentes.
   * @returns {number} - Nuevo ID único.
   */
  generateId(products) {
    if (products.length === 0) return 1;
    const ids = products
      .map((product) => parseInt(product.id))
      .filter((id) => !isNaN(id));
    return Math.max(...ids) + 1;
  }

  /**
   * Validar y sanitizar los datos del producto.
   * @param {Object} data - Datos del producto.
   * @param {boolean} isNew - Indica si es un nuevo producto (true) o una actualización (false).
   * @returns {Object} - Datos validados y sanitizados.
   */
  validateAndSanitizeProductData(data, isNew = true) {
    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];
    const sanitizedData = {};

    // Validar campos requeridos en caso de creación
    if (isNew) {
      requiredFields.forEach((field) => {
        if (!(field in data)) {
          throw new Error(`El campo '${field}' es obligatorio.`);
        }
      });
    }

    // Validar y sanitizar cada campo
    if ("title" in data) {
      if (typeof data.title !== "string" || data.title.trim() === "") {
        throw new Error("El campo 'title' debe ser una cadena no vacía.");
      }
      sanitizedData.title = sanitizeHtml(data.title.trim());
    }

    if ("description" in data) {
      if (
        typeof data.description !== "string" ||
        data.description.trim() === ""
      ) {
        throw new Error("El campo 'description' debe ser una cadena no vacía.");
      }
      sanitizedData.description = sanitizeHtml(data.description.trim());
    }

    if ("code" in data) {
      if (typeof data.code !== "string" || data.code.trim() === "") {
        throw new Error("El campo 'code' debe ser una cadena no vacía.");
      }
      sanitizedData.code = sanitizeHtml(data.code.trim());
    }

    if ("price" in data) {
      const price = parseFloat(data.price);
      if (isNaN(price) || price < 0) {
        throw new Error("El campo 'price' debe ser un número positivo.");
      }
      sanitizedData.price = price;
    }

    if ("stock" in data) {
      const stock = parseInt(data.stock);
      if (isNaN(stock) || stock < 0) {
        throw new Error("El campo 'stock' debe ser un número entero positivo.");
      }
      sanitizedData.stock = stock;
    }

    if ("category" in data) {
      if (typeof data.category !== "string" || data.category.trim() === "") {
        throw new Error("El campo 'category' debe ser una cadena no vacía.");
      }
      sanitizedData.category = sanitizeHtml(data.category.trim());
    }

    if ("status" in data) {
      sanitizedData.status = Boolean(data.status);
    }

    if ("thumbnails" in data) {
      if (!Array.isArray(data.thumbnails)) {
        throw new Error(
          "El campo 'thumbnails' debe ser un arreglo de URLs de imágenes."
        );
      }
      const validThumbnails = data.thumbnails.filter((url) => {
        if (typeof url !== "string" || !validator.isURL(url)) {
          console.warn(`URL inválida omitida: ${url}`);
          return false;
        }
        return true;
      });

      if (validThumbnails.length === 0 && isNew) {
        throw new Error(
          "Debe proporcionar al menos una URL de imagen válida en 'thumbnails'."
        );
      }

      sanitizedData.thumbnails = validThumbnails;
    }

    return sanitizedData;
  }
}

module.exports = new ProductsController();
