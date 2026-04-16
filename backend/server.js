const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 8000;

const USERS_PATH = path.join(__dirname, '..', 'src', 'loginUsers.json');
const WAR_UPDATES_PATH = path.join(__dirname, 'warUpdates.json');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

function readJson(filePath, fallback) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const baseUsers = readJson(USERS_PATH, []);
const users = baseUsers.map((user) => ({
  email: String(user.email || '').trim().toLowerCase(),
  password: String(user.password || ''),
  role: user.role || (String(user.email || '').toLowerCase() === 'admin' ? 'admin' : 'user'),
}));

const sessions = new Map();

function createSession(user) {
  const token = crypto.randomUUID();
  sessions.set(token, { email: user.email, role: user.role });
  return token;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (token && sessions.has(token)) {
    req.user = sessions.get(token);
    req.token = token;
    return next();
  }

  if (authHeader.startsWith('Basic ')) {
    try {
      const base64Credentials = authHeader.slice(6).trim();
      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const separatorIndex = decoded.indexOf(':');

      if (separatorIndex > -1) {
        const email = decoded.slice(0, separatorIndex).trim().toLowerCase();
        const password = decoded.slice(separatorIndex + 1);
        const matchedUser = users.find(
          (user) => user.email === email && user.password === password
        );

        if (matchedUser) {
          req.user = { email: matchedUser.email, role: matchedUser.role };
          return next();
        }
      }
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const matchedUser = users.find((user) => user.email === email && user.password === password);

  if (!matchedUser) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createSession(matchedUser);
  return res.json({
    token,
    user: {
      email: matchedUser.email,
      role: matchedUser.role,
    },
  });
});

app.post('/api/auth/signup', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const alreadyExists = users.some((user) => user.email === email);
  if (alreadyExists) {
    return res.status(409).json({ error: 'This email already exists. Please sign in.' });
  }

  users.push({ email, password, role: 'user' });
  return res.status(201).json({ message: 'Account created. You can sign in now.' });
});

app.get('/api/war-updates', (_req, res) => {
  const updates = readJson(WAR_UPDATES_PATH, []);
  const sanitized = [...updates]
    .reverse()
    .map((item) => ({
      id: item.id,
      message: item.message,
      author: item.author,
    }));
  return res.json({ updates: sanitized });
});

app.post('/api/war-updates', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can post war updates.' });
  }

  const message = String(req.body?.message || '').trim();
  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const updates = readJson(WAR_UPDATES_PATH, []);
  const update = {
    id: crypto.randomUUID(),
    message,
    author: req.user.email,
  };

  updates.push(update);
  writeJson(WAR_UPDATES_PATH, updates);

  return res.status(201).json({
    update: {
      id: update.id,
      message: update.message,
      author: update.author,
    },
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`War update API running on http://localhost:${PORT}`);
});
