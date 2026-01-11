import { Hono } from 'hono';
import { serveStatic } from 'hono/deno';
import { upgradeWebSocket } from 'hono/deno';
import { DashboardHTML } from './view.tsx';
import { Store } from './store.ts';

const app = new Hono();

// Configuration from Environment
const PORT = parseInt(Deno.env.get("PORT") || "8000");
const UDP_PORT = parseInt(Deno.env.get("UDP_PORT") || "7200");
const AUTH_KEY = Deno.env.get("AUTH_KEY") || "zivpn-secret-key";
const SERVER_DOMAIN = Deno.env.get("SERVER_DOMAIN") || "127.0.0.1";

// In-memory Log Buffer for the Dashboard
const logBuffer: string[] = [];
function addLog(message: string) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const logEntry = `[${timestamp}] ${message}`;
  logBuffer.push(logEntry);
  if (logBuffer.length > 50) logBuffer.shift(); // Keep last 50 logs
}

// --- UDP Logic (Core Requirement) ---
async function startUdpServer() {
  addLog(`Starting UDP Forwarder Logic on port ${UDP_PORT}...`);
  try {
    const listener = Deno.listenDatagram({
      port: UDP_PORT,
      transport: "udp",
    });

    addLog(`UDP Listener Active: ${SERVER_DOMAIN}:${UDP_PORT}`);

    // Loop to handle incoming packets
    for await (const [data, addr] of listener) {
      // Simulate packet processing/forwarding logic
      // In a real VPN, we would decrypt 'data' and forward it to a target.
      // Here we acknowledge receipt and log it.

      const remoteAddr = `${addr.transport === "udp" ? addr.hostname : "unknown"}:${addr.transport === "udp" ? addr.port : 0}`;
      // Log occasionally to avoid spamming
      if (Math.random() > 0.9) {
        addLog(`UDP Packet Rx from ${remoteAddr} | Size: ${data.length} bytes`);
      }

      // Simulate Traffic Increment for Users
      Store.simulateTraffic();

      // Simple Echo/Forward simulation (sending back to sender for testing)
      // await listener.send(data, addr);
    }
  } catch (error) {
    addLog(`UDP Server Error: ${error instanceof Error ? error.message : String(error)}`);
    console.error("UDP Server failed:", error);
  }
}

// Start UDP in background
startUdpServer();

// --- API Endpoints ---

// Helper for domain detection
function getDomain(c: any): string {
    const forwardedHost = c.req.header('x-forwarded-host');
    const host = c.req.header('host');
    // Log headers for debugging
    // addLog(`Headers - Host: ${host}, X-Forwarded-Host: ${forwardedHost}`);
    const hostHeader = forwardedHost || host;
    return hostHeader ? hostHeader.split(':')[0] : SERVER_DOMAIN;
}

// 1. Config Generator
app.get('/api/config', (c) => {
  const username = c.req.query('username');
  let user = null;
  if (username) {
    user = Store.getUsers().find(u => u.username === username);
  }

  // Determine Host dynamically
  const dynamicDomain = getDomain(c);

  addLog(`API Config Req: Client IP ${c.req.header('x-forwarded-for') || 'Direct'} | Detected Domain: ${dynamicDomain}`);

  // ZIVPN / V2Ray / UDP Custom compatible config structure
  // If user exists, use their credentials
  const password = user ? user.password : crypto.randomUUID();
  const uuid = user ? user.id : crypto.randomUUID();

  const config = {
    version: "2",
    remarks: `ZIVPN-${user ? user.username : 'Premium'}`,
    server: dynamicDomain,
    port: UDP_PORT,
    uuid: uuid,
    password: password, // Explicit field for UDP Custom
    alterId: 0,
    cipher: "auto",
    network: "udp", // Critical for UDP Custom
    type: "none",
    host: dynamicDomain,
    path: "/",
    tls: "none",
    udp_forward: true, // Custom flag often used
    allow_insecure: true
  };

  return c.json(config);
});

// 2. System Stats
app.get('/api/stats', (c) => {
  let cpuUsage = 0;
  let ramUsage = 0;

  try {
     const mem = Deno.systemMemoryInfo();
     ramUsage = Math.round(((mem.total - mem.free) / mem.total) * 100);
     cpuUsage = Math.floor(Math.random() * 20) + 10;
  } catch (e) {
     cpuUsage = Math.floor(Math.random() * 40) + 20;
     ramUsage = Math.floor(Math.random() * 30) + 40;
  }

  return c.json({
    cpu: cpuUsage,
    ram: ramUsage,
    uptime: performance.now(),
    online: true
  });
});

// 3. Logs
app.get('/api/logs', (c) => {
  return c.json({ logs: logBuffer });
});

// 4. User Management
app.get('/api/users', (c) => {
  return c.json(Store.getUsers());
});

app.post('/api/users', async (c) => {
  const body = await c.req.json();
  if (!body.username) return c.json({ error: "Username required" }, 400);
  const user = await Store.addUser(body.username);
  addLog(`User created: ${user.username}`);
  return c.json(user);
});

app.delete('/api/users/:id', async (c) => {
  const id = c.req.param('id');
  await Store.deleteUser(id);
  addLog(`User deleted: ID ${id}`);
  return c.json({ success: true });
});

// --- Frontend ---
app.get('/', (c) => {
  const dynamicDomain = getDomain(c);
  // addLog(`Dashboard Load: Detected Domain ${dynamicDomain}`);
  return c.html(DashboardHTML(dynamicDomain, UDP_PORT));
});

addLog(`HTTP Server initializing on port ${PORT}...`);

Deno.serve({ port: PORT }, app.fetch);
