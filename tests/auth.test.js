const request = require('supertest');
const mongoose = require('mongoose');

const app = require('express')();
app.use(require('express').json());
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

describe('Auth Endpoints', () => {
  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /health - should return health status', async () => {
    const res = await request(app).get('/health');
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('timestamp');
  });
});