const express = require('express');
const app = express();

// หน้าเว็บโง่ ๆ หนึ่งหน้า
app.get('/', (req, res) => {
  res.send('<h1>Hello Git Flow V2 บลาๆโคตรการทำงาน! 🚀</h1><p>version 1.0.0</p>');
});

// endpoint สำหรับเช็กว่า service รันอยู่ไหม (เอาไว้ให้ CI / deploy ตรวจสุขภาพ)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'service is running v2 ', huh: "บลาๆโคตรการทำงาน", release: "Push to Release" });
});

// ฟังก์ชันง่าย ๆ ไว้ให้ test จับ
function add(a, b) {
  return a + b;
}

app.get('/api/add', (req, res) => {
  const a = Number(req.query.a);
  const b = Number(req.query.b);
  res.json({ result: add(a, b) });
});

module.exports = { app, add };
