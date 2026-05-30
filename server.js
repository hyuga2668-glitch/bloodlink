const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

const SECRET = 'bloodlink2026';

// REGISTER
app.post('/api/register', (req, res) => {
  const { name, email, password, phone, blood_group, city, age, last_donation_date } = req.body;
  try {
    const hashed = bcrypt.hashSync(password, 10);
    db.prepare(`INSERT INTO users (name,email,password,phone,blood_group,city,age,last_donation_date)
      VALUES (?,?,?,?,?,?,?,?)`).run(name, email, hashed, phone, blood_group, city, age, last_donation_date);
    res.json({ success: true, message: 'Registered successfully!' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Email already registered.' });
  }
});

// LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ success: false, message: 'Wrong email or password.' });
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, name: user.name, blood_group: user.blood_group });
});

// GET DONORS
app.get('/api/donors', (req, res) => {
  const { blood_group, city } = req.query;
  let q = 'SELECT id,name,blood_group,city,last_donation_date,is_available FROM users WHERE 1=1';
  const p = [];
  if (blood_group) { q += ' AND blood_group=?'; p.push(blood_group); }
  if (city) { q += ' AND city LIKE ?'; p.push('%'+city+'%'); }
  q += ' ORDER BY is_available DESC';
  res.json(db.prepare(q).all(...p));
});

// TOGGLE AVAILABILITY
app.post('/api/availability', (req, res) => {
  const { id, is_available } = req.body;
  db.prepare('UPDATE users SET is_available=? WHERE id=?').run(is_available, id);
  res.json({ success: true });
});

// EMERGENCY ALERT
app.post('/api/emergency', (req, res) => {
  const { patient_name, blood_group, hospital, contact, units, city } = req.body;
  db.prepare(`INSERT INTO emergency_requests (patient_name,blood_group,hospital,contact,units,city)
    VALUES (?,?,?,?,?,?)`).run(patient_name, blood_group, hospital, contact, units, city);
  res.json({ success: true, message: 'Alert sent to nearby donors!' });
});

app.listen(3000, () => console.log('BloodLink running at http://localhost:3000'));