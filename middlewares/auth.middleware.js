// middlewares/auth.middleware.js

/**
 * Permite el acceso solo a los roles indicados.
 * @param  {...string} roles Roles permitidos, ej: 'admin', 'user'
 */
const permit = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
  };
  
  /**
   * Verifica que el usuario (rol 'user') solo acceda a su propio carrito.
   */
  const ownCart = () => (req, res, next) => {
    // Solo aplicamos esta restricción a usuarios con rol 'user'
    if (req.user && req.user.role === "user") {
      const userCart = req.user.cart;
  
      // Si no tiene carrito asociado, devolvemos un error claro
      if (!userCart) {
        return res
          .status(400)
          .json({ error: "El usuario no tiene un carrito asignado" });
      }
  
      // Comparamos el ID del carrito del usuario con el parámetro :cid
      if (userCart.toString() !== req.params.cid) {
        return res
          .status(403)
          .json({ error: "No puedes acceder a este carrito" });
      }
    }
    // Para administradores u otros roles, o si pasa la comprobación, continúa
    next();
  };
  
  module.exports = { permit, ownCart };
  