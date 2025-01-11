// controllers/carts.controller.js
const FileManager = require("../utils/fileManager");

class CartsController {
  constructor() {
    this.fileManager = new FileManager("data/carritos.json");
  }

  // Crear un nuevo carrito
  async create() {
    const carritos = await this.fileManager.readFile();
    const newId = this.generateId(carritos);
    const newCart = {
      id: newId.toString(),
      products: [],
    };
    carritos.push(newCart);
    await this.fileManager.writeFile(carritos);
    return newCart;
  }

  // Obtener un carrito por ID
  async getById(cid) {
    const carritos = await this.fileManager.readFile();
    return carritos.find((cart) => cart.id === cid);
  }

  // Agregar un producto al carrito
  async addProduct(cid, pid) {
    const carritos = await this.fileManager.readFile();
    const carrito = carritos.find((cart) => cart.id === cid);
    if (!carrito) {
      throw new Error("Carrito no encontrado");
    }

    const productInCart = carrito.products.find((p) => p.product === pid);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      carrito.products.push({ product: pid, quantity: 1 });
    }

    await this.fileManager.writeFile(carritos);
    return carrito;
  }

  // Generar un ID único
  generateId(carritos) {
    if (carritos.length === 0) return 1;
    const ids = carritos
      .map((cart) => parseInt(cart.id))
      .filter((id) => !isNaN(id));
    return Math.max(...ids) + 1;
  }
}

module.exports = new CartsController();
