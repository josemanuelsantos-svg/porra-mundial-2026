const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'porra_mundial_2026_super_secret_key';
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Local file storage path
const LOCAL_DB_PATH = path.join(__dirname, 'data_store.json');

// Initialize local JSON file if it doesn't exist
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify({ scores: {}, extras: {} }, null, 2));
}

// Database helper operations
let mongoClient = null;
let dbConnected = false;

async function connectMongo() {
  if (!MONGODB_URI) {
    console.log('No MONGODB_URI provided. Running in Local JSON file storage mode.');
    return;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    dbConnected = true;
    console.log('Connected to MongoDB Atlas successfully.');
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back to local file storage:', error.message);
    dbConnected = false;
  }
}

connectMongo();

async function getStoredData() {
  if (dbConnected && mongoClient) {
    try {
      const db = mongoClient.db('porra_db');
      const coll = db.collection('porra_data');
      const doc = await coll.findOne({ _id: 'official_data' });
      if (doc) {
        return { scores: doc.scores || {}, extras: doc.extras || {} };
      }
      return { scores: {}, extras: {} };
    } catch (err) {
      console.error('Error reading from MongoDB, falling back to local JSON file:', err.message);
    }
  }
  
  // Local file fallback
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local file:', err.message);
    return { scores: {}, extras: {} };
  }
}

async function saveStoredData(data) {
  if (dbConnected && mongoClient) {
    try {
      const db = mongoClient.db('porra_db');
      const coll = db.collection('porra_data');
      await coll.updateOne(
        { _id: 'official_data' },
        { $set: { scores: data.scores, extras: data.extras, updatedAt: new Date() } },
        { upsert: true }
      );
      return true;
    } catch (err) {
      console.error('Error saving to MongoDB, falling back to local JSON file:', err.message);
    }
  }

  // Local file fallback
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing to local file:', err.message);
    return false;
  }
}

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authorization token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Endpoints
app.get('/api/data', async (req, res) => {
  const data = await getStoredData();
  res.json(data);
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
  }
});

app.post('/api/save', authenticateToken, async (req, res) => {
  const { scores, extras } = req.body;
  if (!scores || !extras) {
    return res.status(400).json({ message: 'Scores and extras are required' });
  }

  const success = await saveStoredData({ scores, extras });
  if (success) {
    res.json({ success: true, message: 'Resultados guardados correctamente' });
  } else {
    res.status(500).json({ message: 'Error al guardar los resultados' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin password: ${ADMIN_PASSWORD === 'admin123' ? 'admin123 (default)' : 'Configured via environment'}`);
});
