const Ticket = require("../models/Ticket");
class TicketDAO {
  async create(data) {
    return Ticket.create(data);
  }
}
module.exports = new TicketDAO();