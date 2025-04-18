// dtos/user.dto.js
class UserDTO {
    constructor({ _id, first_name, last_name, email, age, role, cart }) {
      this.id        = _id.toString();
      this.firstName = first_name;
      this.lastName  = last_name;
      this.email     = email;
      this.age       = age;
      this.role      = role;
      this.cart      = cart;            // ← ahora sí lo incluimos
    }
  }
  
  module.exports = UserDTO;
  