// controllers/carts.controller.js
const FileManager = require('../utils/fileManager');
const productsController = require('./products.controller');

class CartsController {
    constructor() {
        this.fileManager = new FileManager('carritos.json');
    }

    // Crear un nuevo carrito
    async createCart() {
        const carts = await this.fileManager.readFile();
        const newId = this.generateId(carts);
        const newCart = {
            id: newId.toString(), // Usamos string para mayor flexibilidad
            products: []
        };
        carts.push(newCart);
        await this.fileManager.writeFile(carts);
        return newCart;
    }

    // Obtener productos de un carrito por ID
    async getCartById(cid) {
        const carts = await this.fileManager.readFile();
        const cart = carts.find(c => c.id === cid);
        if (!cart) {
            throw new Error('Carrito no encontrado');
        }
        return cart.products;
    }

    // Agregar un producto al carrito
    async addProductToCart(cid, pid) {
        const carts = await this.fileManager.readFile();
        const cartIndex = carts.findIndex(c => c.id === cid);
        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        // Verificar que el producto exista
        const product = await productsController.getById(pid);
        if (!product) {
            throw new Error('Producto no encontrado');
        }

        const cart = carts[cartIndex];
        const productInCart = cart.products.find(p => p.product === pid);

        if (productInCart) {
            // Incrementar la cantidad
            productInCart.quantity += 1;
        } else {
            // Agregar nuevo producto al carrito
            cart.products.push({ product: pid, quantity: 1 });
        }

        await this.fileManager.writeFile(carts);
        return cart.products;
    }

    // Generar un ID único
    generateId(carts) {
        if (carts.length === 0) return 1;
        const ids = carts.map(cart => {
            const idNum = parseInt(cart.id);
            return isNaN(idNum) ? 0 : idNum;
        });
        return Math.max(...ids) + 1;
    }
}

module.exports = new CartsController();
