// tests/products.test.js
const request = require('supertest');
const app = require('../app');

describe('API /api/products', () => {
  it('GET /api/products devuelve productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/products valida datos', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
