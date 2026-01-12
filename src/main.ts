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

// Forwarding Configuration (Target VPN Server, e.g., OpenVPN)
const FORWARD_IP = Deno.env.get("FORWARD_IP") || "127.0.0.1";
const FORWARD_PORT = parseInt(Deno.env.get("FORWARD_PORT") || "1194");

// In-memory Log Buffer for the Dashboard
const logBuffer: string[] = [];
function addLog(message: string) {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const logEntry = `[${timestamp}] ${message}`;
  logBuffer.push(logEntry);
  if (logBuffer.length > 50) logBuffer.shift(); // Keep last 50 logs
}

// --- UDP Logic (Core Requirement) ---

// Session Management
interface Session {
  upstream: Deno.DatagramConn;
  lastActive: number;
  listenPromise: Promise<void>;
}

// Key: Client IP:Port string
const clientSessions = new Map<string, Session>();

// Constants
const ENCODED_KEY = new TextEncoder().encode(AUTH_KEY);

function getClientKey(addr: Deno.NetAddr): string {
  return `${addr.hostname}:${addr.port}`;
}

async function cleanupSessions() {
  const now = Date.now();
  const timeout = 60 * 1000; // 60 seconds
  for (const [key, session] of clientSessions.entries()) {
    if (now - session.lastActive > timeout) {
      // Close upstream socket
      try {
        session.upstream.close();
      } catch (e) { /* ignore */ }
      clientSessions.delete(key);
      // addLog(`Session expired: ${key}`);
    }
  }
}

// Start Cleanup Loop
setInterval(cleanupSessions, 10000);

async function startUdpServer() {
  addLog(`Starting UDP Forwarder Logic on port ${UDP_PORT}...`);
  addLog(`Forwarding Target: ${FORWARD_IP}:${FORWARD_PORT}`);
  addLog(`Auth Key: ${AUTH_KEY} (Length: ${ENCODED_KEY.length})`);

  let listener: Deno.DatagramConn;
  try {
    listener = Deno.listenDatagram({
      port: UDP_PORT,
      transport: "udp",
    });
  } catch(e) {
    addLog(`Error binding UDP port: ${e}`);
    console.error(e);
    return;
  }

  addLog(`UDP Listener Active: ${SERVER_DOMAIN}:${UDP_PORT}`);

  // Loop to handle incoming packets from Client
  for await (const [data, addr] of listener) {
    // Ensure addr is NetAddr (UDP)
    if (addr.transport !== 'udp') continue;

    // 1. Fixed-Key Authentication
    // Check if packet starts with AUTH_KEY
    if (data.length < ENCODED_KEY.length) continue; // Too short

    let authenticated = true;
    for (let i = 0; i < ENCODED_KEY.length; i++) {
      if (data[i] !== ENCODED_KEY[i]) {
        authenticated = false;
        break;
      }
    }

    if (!authenticated) {
      // Drop packet
      // addLog(`Auth fail from ${getClientKey(addr)}`);
      continue;
    }

    // 2. Payload Stripping
    const payload = data.subarray(ENCODED_KEY.length);
    if (payload.length === 0) continue; // Empty payload?

    // 3. Dynamic Session Mapping
    const clientKey = getClientKey(addr);
    let session = clientSessions.get(clientKey);

    if (!session) {
      // Create new session
      try {
        const upstream = Deno.listenDatagram({
          port: 0, // Ephemeral port
          transport: "udp",
        });

        // Start upstream listener (Target -> Upstream -> Client)
        const listenPromise = (async () => {
          try {
            for await (const [upData, _upAddr] of upstream) {
               // We forward this BACK to the client.
               try {
                  await listener.send(upData, addr);
                  // Refresh session on valid reply too?
                  const activeSession = clientSessions.get(clientKey);
                  if (activeSession) activeSession.lastActive = Date.now();
               } catch(e) {
                   // Error sending back to client
               }
            }
          } catch (err) {
            // Socket closed or error
          }
        })();

        session = {
            upstream,
            lastActive: Date.now(),
            listenPromise
        };
        clientSessions.set(clientKey, session);
        // addLog(`New Session: ${clientKey} -> Upstream Port ${upstream.addr.port}`);

      } catch (err) {
        addLog(`Failed to create upstream socket: ${err}`);
        continue;
      }
    } else {
        session.lastActive = Date.now();
    }

    // 4. Forward to Target (Client -> Server -> Target)
    try {
        await session.upstream.send(payload, {
            transport: "udp",
            hostname: FORWARD_IP,
            port: FORWARD_PORT
        });

        // Simulate Traffic (update Store to accept amount)
        Store.simulateTraffic(payload.length);

    } catch (err) {
        // addLog(`Forward Error: ${err}`);
    }
  }
}

// Start UDP in background
startUdpServer();

// --- API Endpoints ---

// Helper for domain detection
function getDomain(c: any): string {
    const forwardedHost = c.req.header('x-forwarded-host');
    const host = c.req.header('host');
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

  // If user exists, use their credentials
  const password = user ? user.password : crypto.randomUUID();
  const uuid = user ? user.id : crypto.randomUUID();

  const config = {
    version: "2",
    remarks: `ZIVPN-${user ? user.username : 'Premium'}`,
    server: dynamicDomain,
    port: UDP_PORT,
    uuid: uuid,
    password: password,
    alterId: 0,
    cipher: "auto",
    network: "udp",
    type: "none",
    host: dynamicDomain,
    path: "/",
    tls: "none",
    udp_forward: true,
    allow_insecure: true,
    // Add custom field if ZIVPN reads it
    udp_auth_key: AUTH_KEY
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
    online: true,
    sessions: clientSessions.size // Add session count
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
  return c.html(DashboardHTML(dynamicDomain, UDP_PORT));
});

addLog(`HTTP Server initializing on port ${PORT}...`);

Deno.serve({ port: PORT }, app.fetch);
