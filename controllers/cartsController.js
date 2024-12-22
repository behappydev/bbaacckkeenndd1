const fs = require('fs-extra');
const path = require('path');
const Cart = require('../models/Cart');

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

class CartsController {
    async createCart(req, res) {
        try {
            let carts = [];
            if (await fs.pathExists(cartsFilePath)) {
                carts = await fs.readJSON(cartsFilePath);
            }

            const newCart = new Cart();
            carts.push(newCart);
            await fs.writeJSON(cartsFilePath, carts, { spaces: 2 });
            res.status(201).json(newCart);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el carrito' });
        }
    }

    async getCartById(req, res) {
        try {
            const { cid } = req.params;
            if (!cid) {
                return res.status(400).json({ error: 'ID de carrito requerido' });
            }
            let carts = [];
            if (await fs.pathExists(cartsFilePath)) {
                carts = await fs.readJSON(cartsFilePath);
            }
            const cart = carts.find(c => c.id === cid);
            if (!cart) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }
            res.json(cart.products);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el carrito' });
        }
    }

    async addProductToCart(req, res) {
        try {
            const { cid, pid } = req.params;
            if (!cid || !pid) {
                return res.status(400).json({ error: 'ID de carrito y producto requeridos' });
            }

            let carts = [];
            if (await fs.pathExists(cartsFilePath)) {
                carts = await fs.readJSON(cartsFilePath);
            }
            const cartIndex = carts.findIndex(c => c.id === cid);
            if (cartIndex === -1) {
                return res.status(404).json({ error: 'Carrito no encontrado' });
            }

            // Verificar que el producto exista
            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }
            const productExists = products.some(p => p.id === pid);
            if (!productExists) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Agregar o actualizar el producto en el carrito
            carts[cartIndex].addProduct(pid);
            await fs.writeJSON(cartsFilePath, carts, { spaces: 2 });
            res.json(carts[cartIndex].products);
        } catch (error) {
            res.status(500).json({ error: 'Error al agregar el producto al carrito' });
        }
    }
}

module.exports = new CartsController();
