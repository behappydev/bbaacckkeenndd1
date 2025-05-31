// tests/products.test.js
const request = require('supertest');
const app = require('../app');

describe('API /api/carts', () => {
  it('GET /api/carts devuelve carts', async () => {
    const res = await request(app).get('/api/carts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/carts valida datos', async () => {
    const res = await request(app)
      .post('/api/carts')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
