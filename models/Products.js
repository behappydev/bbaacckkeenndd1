const { v4: uuidv4 } = require('uuid');

class Product {
    constructor({ title, description, code, price, stock, category, thumbnails = [] }) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.code = code;
        this.price = price;
        this.status = true; // Por defecto
        this.stock = stock;
        this.category = category;
        this.thumbnails = thumbnails;
    }
}

module.exports = Product;
