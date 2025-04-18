const ticketDAO = require("../dao/ticket.dao");
const TicketDTO = require("../dtos/ticket.dto");

class TicketService {
  async generate({ amount, purchaser }) {
    const ticket = await ticketDAO.create({ amount, purchaser });
    return new TicketDTO(ticket);
  }
}
module.exports = new TicketService();