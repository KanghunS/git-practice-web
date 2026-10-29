const request = require('supertest');
const { app, add } = require('./app');

describe('ฟังก์ชัน add', () => {
  test('2 + 3 ต้องได้ 5', () => {
    expect(add(2, 3)).toBe(5);
  });
});

describe('API endpoints', () => {
  test('GET /api/health ต้องตอบ status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/add?a=4&b=6 ต้องได้ 10', async () => {
    const res = await request(app).get('/api/add?a=4&b=6');
    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(10);
  });
});
