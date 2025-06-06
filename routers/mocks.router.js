const Router          = require('express').Router;
const { generateUsers, generateMods } = require('../utils/mock');
const User            = require('../models/User');
const Mod             = require('../models/Mod');

const router = Router();

/**
 * @swagger
 * /api/mocks/mockingusers:
 *   get:
 *     summary: Generar usuarios fake (mock)
 *     responses:
 *       200:
 *         description: Lista de usuarios fake generados
 */
router.get('/mockingusers', (req, res) => {
  const users = generateUsers(50);
  res.json({ status: 'success', payload: users });
});

/**
 * @swagger
 * /api/mocks/generateData:
 *   post:
 *     summary: Generar datos fake e insertarlos en MongoDB
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: number
 *               mods:
 *                 type: number
 *     responses:
 *       200:
 *         description: Datos fake insertados correctamente
 *       400:
 *         description: Parámetros inválidos
 */
router.post('/generateData', async (req, res) => {
  const { users: numUsers = 0, mods: numMods = 0 } = req.body;
  if (isNaN(numUsers) || isNaN(numMods)) {
    return res
      .status(400)
      .json({ status:'error', message:'Parámetros inválidos' });
  }

  // Generamos arrays
  const fakeUsers = generateUsers(Number(numUsers));
  const fakeMods  = generateMods(Number(numMods));

  // Insertamos en Mongo
  const insertedUsers = await User.insertMany(fakeUsers);
  const insertedMods  = await Mod.insertMany(fakeMods);

  res.json({
    status: 'success',
    inserted: {
      usersCount: insertedUsers.length,
      modsCount:  insertedMods.length
    },
    users: insertedUsers.map(u => ({ id: u._id, email: u.email })),
    mods:  insertedMods.map(m => ({ id: m._id, name: m.name }))
  });
});

module.exports = router;
