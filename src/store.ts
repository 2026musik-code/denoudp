// src/store.ts
import { join } from "https://deno.land/std@0.220.0/path/mod.ts";

export interface User {
  id: string;
  username: string;
  password: string;
  traffic: number; // in bytes
}

const DB_FILE = "users.json";

// In-memory cache
let users: User[] = [
  { id: "1", username: "default", password: "zi", traffic: 1024 * 1024 * 50 } // Default user with some dummy data
];

// Load from file on startup (if exists)
try {
  const data = await Deno.readTextFile(DB_FILE);
  users = JSON.parse(data);
} catch (e) {
  // File doesn't exist or error reading, ignore and use default
  console.log("No existing database found, starting fresh.");
}

async function save() {
  await Deno.writeTextFile(DB_FILE, JSON.stringify(users, null, 2));
}

export const Store = {
  getUsers: () => users,

  addUser: async (username: string) => {
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      password: crypto.randomUUID().split('-')[0], // Short random password
      traffic: 0
    };
    users.push(newUser);
    await save();
    return newUser;
  },

  deleteUser: async (id: string) => {
    users = users.filter(u => u.id !== id);
    await save();
  },

  // For simulation: increment traffic for all users randomly
  simulateTraffic: () => {
    users = users.map(u => ({
      ...u,
      traffic: u.traffic + Math.floor(Math.random() * 1024 * 50) // Random increment
    }));
    // We don't save every second to avoid disk thrashing,
    // but in a real app we might. For now, we only save on structural changes.
  }
};
