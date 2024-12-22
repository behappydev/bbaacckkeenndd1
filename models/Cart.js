const { v4: uuidv4 } = require('uuid');

class Cart {
    constructor() {
        this.id = uuidv4();
        this.products = [];
    }

    addProduct(productId) {
        const existingProduct = this.products.find(p => p.product === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.products.push({ product: productId, quantity: 1 });
        }
    }
}

module.exports = Cart;
