const express = require('express');
const fs = require('fs').promises;
const bcrypt = require('bcrypt');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('.'));

// Helper functions
async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 3-20 characters' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const users = await readJson('user_data.json');
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  await writeJson('user_data.json', users);

  // Initialize user stats in stats.json
  const stats = await readJson('stats.json');
  if (!stats.find(u => u.username === username)) {
    stats.push({ username, games: [] });
    await writeJson('stats.json', stats);
  }

  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const users = await readJson('user_data.json');
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({ success: true });
});

// Submit score endpoint
app.post('/submit-score', async (req, res) => {
  const { username, success, total, time, numbers, autoHide, score, date } = req.body;
  if (!username || success == null || !total || !time || !numbers || autoHide == null || !score || !date) {
    return res.status(400).json({ error: 'Invalid score data' });
  }

  const leaderboard = await readJson('leaderboard.json');
  leaderboard.push({ username, success, total, time, numbers, autoHide, score, date });
  await writeJson('leaderboard.json', leaderboard);
  res.json({ success: true });
});

// Save stats endpoint
app.post('/save-stats', async (req, res) => {
  const { username, success, total, time, numbers, autoHide, score, date } = req.body;
  if (!username || success == null || !total || !time || !numbers || autoHide == null || !score || !date) {
    return res.status(400).json({ error: 'Invalid stats data' });
  }

  const stats = await readJson('stats.json');
  const userStats = stats.find(u => u.username === username);
  if (userStats) {
    userStats.games.push({ username, success, total, time, numbers, autoHide, score, date });
  } else {
    stats.push({ username, games: [{ username, success, total, time, numbers, autoHide, score, date }] });
  }
  await writeJson('stats.json', stats);
  res.json({ success: true });
});

// Stats endpoint
app.post('/stats', async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  const users = await readJson('user_data.json');
  const user = users.find(u => u.username === username);
  const stats = await readJson('stats.json');
  const userStats = stats.find(u => u.username === username) || { games: [] };

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    password: user.password,
    games: userStats.games
  });
});

app.get('/leaderboard', async (req, res) => {
  const leaderboard = await readJson('leaderboard.json');
  res.json(leaderboard.sort((a, b) => b.score - a.score));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));