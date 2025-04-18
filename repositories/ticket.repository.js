// repositories/ticket.repository.js

const ticketDAO = require('../dao/ticket.dao');

class TicketRepository {
  /**
   * Crea un ticket de compra en base a los datos proporcionados.
   * @param {Object} ticketData
   * @param {number} ticketData.amount        - Monto total de la compra
   * @param {string} ticketData.purchaser     - Correo del comprador
   * @returns {Promise<Object>}               - Objeto Ticket recién creado
   */
  async create(ticketData) {
    return ticketDAO.create(ticketData);
  }

  /**
   * Puedes agregar aquí métodos adicionales como:
   * - findByCode(code)
   * - listByUser(email)
   * según vayan surgiendo nuevos requerimientos.
   */
}

module.exports = new TicketRepository();
