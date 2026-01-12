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

  // For simulation: increment traffic for all users randomly, or specific amount
  simulateTraffic: (amount?: number) => {
    if (amount) {
        // Distribute to random user for simulation or all
        // For accurate tracking we need the user associated with the session.
        // But for this simple implementation, we just add to the default user or random.
        if (users.length > 0) {
            users[0].traffic += amount;
        }
    } else {
        // Legacy simulation
        users = users.map(u => ({
          ...u,
          traffic: u.traffic + Math.floor(Math.random() * 1024 * 50)
        }));
    }
  }
};
