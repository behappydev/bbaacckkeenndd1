// repositories/cart.repository.js

const FileManager = require("../utils/fileManager");
const { v4: uuidv4 } = require("uuid");

class CartRepository {
  constructor() {
    this.cartFM    = new FileManager("data/carritos.json");
    this.prodFM    = new FileManager("data/productos.json");
    this.ticketFM  = new FileManager("data/tickets.json");
  }

  /**
   * Agrega un producto al carrito (muy similar a tu cartsController).
   */
  async addProduct(cid, pid) {
    const carts    = await this.cartFM.readFile();
    const products = await this.prodFM.readFile();

    const cart = carts.find((c) => c.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");

    const prod = products.find((p) => p.id === pid);
    if (!prod) throw new Error("Producto no encontrado");

    const existing = cart.products.find((p) => p.product === pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await this.cartFM.writeFile(carts);
    return cart;
  }

  /**
   * Finaliza la compra:
   * - Verifica stock, descuenta donde haya,
   * - Genera un ticket,
   * - Actualiza productos, carrito y tickets.json
   * - Devuelve { ticket, insufficient }
   */
  async purchase(cid, purchaserEmail) {
    // 1) Leer todos los datos
    const carts    = await this.cartFM.readFile();
    const products = await this.prodFM.readFile();
    const tickets  = await this.ticketFM.readFile();

    const cart = carts.find((c) => c.id === cid);
    if (!cart) throw new Error("Carrito no encontrado");

    let totalAmount = 0;
    const insufficient = [];

    // 2) Procesar cada producto del carrito
    for (const item of cart.products) {
      const prod = products.find((p) => p.id === item.product);
      if (!prod) {
        insufficient.push(item.product);
        continue;
      }

      if (prod.stock >= item.quantity) {
        // Descontar stock y sumar al total
        prod.stock -= item.quantity;
        totalAmount += prod.price * item.quantity;
      } else {
        // No hay stock suficiente
        insufficient.push(item.product);
      }
    }

    // 3) Generar el ticket
    const now = new Date();
    const ticket = {
      id: uuidv4(),
      code: uuidv4(),
      purchase_datetime: now.toISOString(),
      amount: Number(totalAmount.toFixed(2)),
      purchaser: purchaserEmail,
    };
    tickets.push(ticket);

    // 4) Actualizar el carrito: quedan solo los insuficientes
    cart.products = cart.products.filter((p) =>
      insufficient.includes(p.product)
    );

    // 5) Persistir todos los cambios
    await this.prodFM.writeFile(products);
    await this.cartFM.writeFile(carts);
    await this.ticketFM.writeFile(tickets);

    // 6) Devolver resultado
    return { ticket, insufficient };
  }
}

module.exports = new CartRepository();
