const fs = require('fs-extra');
const path = require('path');
const Product = require('../models/Product');

const productsFilePath = path.join(__dirname, '../data/products.json');

class ProductsController {
    async getAll(req, res) {
        try {
            const { limit } = req.query;
            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }
            if (limit) {
                products = products.slice(0, parseInt(limit));
            }
            res.json(products);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los productos' });
        }
    }

    async getById(req, res) {
        try {
            const { pid } = req.params;
            if (!pid) {
                return res.status(400).json({ error: 'ID de producto requerido' });
            }
            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }
            const product = products.find(p => p.id === pid);
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener el producto' });
        }
    }

    async create(req, res) {
        try {
            const { title, description, code, price, stock, category, thumbnails } = req.body;
            
            // Validación de campos obligatorios
            if (!title || !description || !code || price === undefined || stock === undefined || !category) {
                return res.status(400).json({ error: 'Faltan campos obligatorios' });
            }

            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }

            // Verificar si el código ya existe
            const codeExists = products.some(p => p.code === code);
            if (codeExists) {
                return res.status(400).json({ error: 'El código del producto ya existe' });
            }

            const newProduct = new Product({ title, description, code, price, stock, category, thumbnails });
            products.push(newProduct);
            await fs.writeJSON(productsFilePath, products, { spaces: 2 });
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el producto' });
        }
    }

    async update(req, res) {
        try {
            const { pid } = req.params;
            const updateData = req.body;

            if (updateData.id) {
                return res.status(400).json({ error: 'No se puede actualizar el ID del producto' });
            }

            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }

            const productIndex = products.findIndex(p => p.id === pid);
            if (productIndex === -1) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Actualizar campos
            products[productIndex] = { ...products[productIndex], ...updateData, id: pid };
            await fs.writeJSON(productsFilePath, products, { spaces: 2 });
            res.json(products[productIndex]);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el producto' });
        }
    }

    async delete(req, res) {
        try {
            const { pid } = req.params;
            let products = [];
            if (await fs.pathExists(productsFilePath)) {
                products = await fs.readJSON(productsFilePath);
            }
            const productIndex = products.findIndex(p => p.id === pid);
            if (productIndex === -1) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            const deletedProduct = products.splice(productIndex, 1);
            await fs.writeJSON(productsFilePath, products, { spaces: 2 });
            res.json({ message: 'Producto eliminado', product: deletedProduct[0] });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el producto' });
        }
    }
}

module.exports = new ProductsController();
