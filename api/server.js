const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const USERS = [
  { id: "1", username: "admin", password: "admin", fullname: "Administrador" },
  { id: "2", username: "usuario", password: "usuario", fullname: "Usuario" },
];

const JWT_SECRET = "secret";

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Forbidden: no token provided" });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: token expired" });
    }
    return res.status(400).json({ error: "Bad Request: invalid token" });
  }
}

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required to login" });
  }

  const user = USERS.find(
    (user) => user.username === username && user.password === password,
  );

  if (!user) {
    return res
      .status(401)
      .json({ error: "Invalid username or password to login" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
  res.json({ token });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`The API is running on ${PORT}`);
});

app.get("/me", authMiddleware, (req, res) => {
  const user = USERS.find((u) => u.username === req.user.username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const payload = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
  };
  console.log("GET /me payload: ", payload);
  res.json({
    id: user.id,
    username: user.username,
    fullname: user.fullname,
  });
});
