const db = require('./database');
const bcrypt = require('bcryptjs');
const pass = bcrypt.hashSync('test123', 10);

const donors = [
  ['Rahul Kulkarni','rahul@test.com',pass,'9876543210','A+','Pune',26,'2025-11-01'],
  ['Priya Mehta','priya@test.com',pass,'9876543211','O+','Pune',24,'2025-09-15'],
  ['Vikram Pawar','vikram@test.com',pass,'9876543212','O-','Pune',30,'2025-08-20'],
  ['Neha Joshi','neha@test.com',pass,'9876543213','AB+','Pune',27,'2025-10-10'],
  ['Sneha Desai','sneha@test.com',pass,'9876543214','A-','Mumbai',25,'2025-07-05'],
];

donors.forEach(d => {
  db.prepare(`INSERT OR IGNORE INTO users (name,email,password,phone,blood_group,city,age,last_donation_date)
    VALUES (?,?,?,?,?,?,?,?)`).run(...d);
});

console.log('Donors added successfully!');