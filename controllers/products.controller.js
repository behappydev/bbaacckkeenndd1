// controllers/products.controller.js
const FileManager = require("../utils/fileManager");

class ProductsController {
  constructor() {
    this.fileManager = new FileManager("data/productos.json");
  }

  // Obtener todos los productos, con opción de limitación
  async getAll(limit) {
    const products = await this.fileManager.readFile();
    if (limit) {
      return products.slice(0, limit);
    }
    return products;
  }

  // Obtener un producto por ID
  async getById(pid) {
    const products = await this.fileManager.readFile();
    return products.find((product) => product.id === pid);
  }

  // Crear un nuevo producto
  async create(productData) {
    const products = await this.fileManager.readFile();
    const newId = this.generateId(products);
    const newProduct = {
      id: newId.toString(),
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: productData.price,
      status: productData.status !== undefined ? productData.status : true,
      stock: productData.stock,
      category: productData.category,
      thumbnails: productData.thumbnails || [],
    };
    products.push(newProduct);
    await this.fileManager.writeFile(products);
    return newProduct;
  }

  // Actualizar un producto por ID
  async update(pid, updatedData) {
    const products = await this.fileManager.readFile();
    const index = products.findIndex((product) => product.id === pid);
    if (index === -1) {
      throw new Error("Producto no encontrado");
    }
    // Evitar actualizar el ID
    const { id, ...rest } = updatedData;
    products[index] = { ...products[index], ...rest };
    await this.fileManager.writeFile(products);
    return products[index];
  }

  // Eliminar un producto por ID
  async delete(pid) {
    let products = await this.fileManager.readFile();
    const initialLength = products.length;
    products = products.filter((product) => product.id !== pid);
    if (products.length === initialLength) {
      throw new Error("Producto no encontrado");
    }
    await this.fileManager.writeFile(products);
    return { message: "Producto eliminado exitosamente" };
  }

  // Generar un ID único
  generateId(products) {
    if (products.length === 0) return 1;
    const ids = products.map((product) => {
      const idNum = parseInt(product.id);
      return isNaN(idNum) ? 0 : idNum;
    });
    return Math.max(...ids) + 1;
  }
}

module.exports = new ProductsController();
