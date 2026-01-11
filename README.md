# ZIVPN UDP Custom Dashboard & API

A high-performance, Deno-based server application designed to generate configurations and monitor status for ZIVPN UDP Custom servers. Built with the Hono framework and styled with a luxury Dark Material/Glassmorphism UI.

![Dashboard Preview](https://i.imgur.com/placeholder.png)

## Features

- **Core Logic**:
    - Generates ZIVPN-compatible V2Ray/UDP Custom JSON configurations.
    - Includes UDP Traffic Forwarding logic (via `Deno.listenDatagram`).
    - Robust error handling for serverless environments (e.g., Deno Deploy).

- **Luxury Dashboard**:
    - **Framework**: Hono (Ultra-fast routing).
    - **Styling**: Tailwind CSS (Dark Mode, Glassmorphism).
    - **Interactive**: Real-time server stats (CPU/RAM simulation for serverless), Live Traffic Logs, and "Copy Config" functionality.
    - **Visuals**: Lottie Animations and responsive design.

## Prerequisites

- [Deno](https://deno.land/) (v1.30 or higher recommended)

## Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone <repo_url>
   cd <repo_name>
   ```

2. **Run the server:**
   ```bash
   deno task start
   ```
   Or manually:
   ```bash
   deno run --allow-net --allow-env --allow-sys --allow-read src/main.ts
   ```

3. **Access the Dashboard:**
   Open your browser and navigate to `http://localhost:8000`.

## Configuration (Environment Variables)

Create a `.env` file or set these in your environment:

- `PORT`: HTTP Server Port (Default: `8000`)
- `UDP_PORT`: UDP Listener Port (Default: `7200`)
- `SERVER_DOMAIN`: Domain/IP for the config generator (Default: `127.0.0.1`)
- `AUTH_KEY`: Security key (Default: `zivpn-secret-key`)

## Deployment (Deno Deploy)

This project is optimized for Deno Deploy.
1. Connect your GitHub repository to Deno Deploy.
2. Set the Entrypoint to `src/main.ts`.
3. Add environment variables in the dashboard.
   *(Note: UDP listening may be restricted on standard Deno Deploy plans, but the Dashboard and Config Generator will function correctly.)*

## License

MIT
