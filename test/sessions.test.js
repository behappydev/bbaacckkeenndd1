// tests/products.test.js
const request = require('supertest');
const app = require('../app');

describe('API /api/sessions', () => {
  it('GET /api/sessions devuelve carts', async () => {
    const res = await request(app).get('/api/sessions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/sessions valida datos', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});
