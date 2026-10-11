const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const LOGINS_FILE = path.join(DATA_DIR, 'logins.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');

// Initialize files if they don't exist
function initFile(filePath, defaultData) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}

initFile(LOGINS_FILE, []);
initFile(USERS_FILE, []);
initFile(PROJECTS_FILE, []);
initFile(TASKS_FILE, []);

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // GET /api/logins
  if (req.method === 'GET' && url === '/api/logins') {
    try {
      const data = fs.readFileSync(LOGINS_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data || '[]');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // POST /api/logins
  if (req.method === 'POST' && url === '/api/logins') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newLogin = JSON.parse(body);
        let logins = [];
        if (fs.existsSync(LOGINS_FILE)) {
          const raw = fs.readFileSync(LOGINS_FILE, 'utf8');
          logins = JSON.parse(raw || '[]');
        }

        // Add ID and timestamp if missing
        if (!newLogin.id) {
          newLogin.id = 'log_' + Date.now();
        }
        if (!newLogin.timestamp) {
          newLogin.timestamp = new Date().toISOString();
        }
        if (!newLogin.formattedDate) {
          newLogin.formattedDate = new Date().toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'medium'
          });
        }

        if (!newLogin.password) {
          newLogin.password = 'password123';
        }

        // Prepend newest login at top
        logins.unshift(newLogin);

        fs.writeFileSync(LOGINS_FILE, JSON.stringify(logins, null, 2), 'utf8');
        console.log(`[DATA-SERVER] Login recorded to data/logins.json for ${newLogin.userName} (${newLogin.role})`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, savedLogin: newLogin, totalLogins: logins.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed parsing login data', details: err.message }));
      }
    });
    return;
  }

  // GET /api/users
  if (req.method === 'GET' && url === '/api/users') {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data || '[]');
    return;
  }

  // POST /api/users
  if (req.method === 'POST' && url === '/api/users') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const users = JSON.parse(body);
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // GET /api/projects
  if (req.method === 'GET' && url === '/api/projects') {
    const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data || '[]');
    return;
  }

  // POST /api/projects
  if (req.method === 'POST' && url === '/api/projects') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const projects = JSON.parse(body);
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // GET /api/tasks
  if (req.method === 'GET' && url === '/api/tasks') {
    const data = fs.readFileSync(TASKS_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data || '[]');
    return;
  }

  // POST /api/tasks
  if (req.method === 'POST' && url === '/api/tasks') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const tasks = JSON.parse(body);
        if (Array.isArray(tasks) && tasks.length > 0) {
          fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, count: Array.isArray(tasks) ? tasks.length : 0 }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Default fallback route
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'Interior PMS Data API Server',
    status: 'Running',
    storageDirectory: DATA_DIR,
    endpoints: ['/api/logins', '/api/users', '/api/projects', '/api/tasks']
  }));
});

server.listen(PORT, () => {
  console.log(`[DATA-SERVER] Interior PMS Local Data Server running on http://localhost:${PORT}`);
  console.log(`[DATA-SERVER] Saving all logins and project changes directly to folder: ${DATA_DIR}`);
});
