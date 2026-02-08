const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const USERS = [
    { username: 'admin', password: 'admin' },
    { username: 'usuario', password: 'usuario'},
];

const JWT_SECRET = 'secret';

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required to login' });
    }

    const user = USERS.find(
        (user) => user.username === username && user.password === password
    );

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password to login' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`The API is running on ${PORT}`);
});