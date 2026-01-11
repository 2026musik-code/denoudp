/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { html } from 'hono/html';

// We'll export a function that returns the full HTML string
// This allows us to keep main.ts clean.

export const DashboardHTML = (domain: string, port: number) => html`
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZIVPN Dashboard | UDP Custom</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <!-- Lottie Player -->
    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>

    <script>
        // Server Info injected from backend
        const SERVER_INFO = {
            domain: "${domain}",
            port: ${port}
        };

        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    colors: {
                        dark: {
                            900: '#0f172a', // Slate 900
                            800: '#1e293b', // Slate 800
                            700: '#334155', // Slate 700
                        },
                        accent: {
                            500: '#6366f1', // Indigo 500
                            400: '#818cf8',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        body {
            background-color: #0f172a;
            color: #e2e8f0;
            background-image:
                radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%),
                radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%),
                radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%);
            min-height: 100vh;
        }

        /* Glassmorphism */
        .glass-panel {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
        }

        .glass-card:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
        }

        /* Log Terminal Style */
        .terminal-log {
            font-family: 'Courier New', Courier, monospace;
            background: rgba(0, 0, 0, 0.4);
            border-left: 3px solid #6366f1;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #0f172a;
        }
        ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #475569;
        }
    </style>
</head>
<body class="antialiased p-4 md:p-8">

    <div class="max-w-6xl mx-auto space-y-8">

        <!-- Header Section -->
        <header class="flex flex-col md:flex-row justify-between items-center glass-panel rounded-2xl p-6">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-2xl font-bold text-white tracking-tight">ZIVPN <span class="text-indigo-400 font-light">Dashboard</span></h1>
                    <p class="text-slate-400 text-sm">UDP Custom Server Manager</p>
                </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
                <div class="flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1 border border-slate-700">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 18z" clip-rule="evenodd" />
                     </svg>
                     <span class="text-sm font-mono text-indigo-300">IP: ${domain}</span>
                </div>

                <div class="flex items-center space-x-2 bg-slate-800/50 rounded-full px-4 py-1 border border-slate-700">
                     <div class="relative w-3 h-3">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                     </div>
                     <span class="text-sm font-semibold text-green-400">System Online</span>
                </div>
            </div>
        </header>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            <!-- CPU Card -->
            <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-slate-400 text-sm font-medium uppercase">CPU Usage</p>
                        <h2 class="text-3xl font-bold text-white mt-1" id="cpu-val">0%</h2>
                    </div>
                    <div class="p-2 bg-indigo-500/20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                    </div>
                </div>
                <!-- Progress Bar -->
                <div class="w-full bg-slate-700/50 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div id="cpu-bar" class="bg-indigo-500 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>

            <!-- RAM Card -->
            <div class="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                 <div class="absolute -right-6 -top-6 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-slate-400 text-sm font-medium uppercase">RAM Usage</p>
                        <h2 class="text-3xl font-bold text-white mt-1" id="ram-val">0%</h2>
                    </div>
                    <div class="p-2 bg-pink-500/20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                </div>
                <div class="w-full bg-slate-700/50 h-1.5 mt-4 rounded-full overflow-hidden">
                    <div id="ram-bar" class="bg-pink-500 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
            </div>

            <!-- Animation Card -->
            <div class="glass-panel rounded-2xl p-2 flex items-center justify-center bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
                 <lottie-player src="https://assets2.lottiefiles.com/packages/lf20_w51pcehl.json"  background="transparent"  speed="1"  style="width: 120px; height: 120px;"  loop  autoplay></lottie-player>
                 <div class="ml-2">
                     <div class="text-xs text-indigo-300 font-bold tracking-wider">SECURE TUNNEL</div>
                     <div class="text-xl font-bold text-white">ACTIVE</div>
                 </div>
            </div>
        </div>

        <!-- User Management Section -->
        <div class="glass-panel rounded-2xl p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-white flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-pink-400" viewBox="0 0 20 20" fill="currentColor">
                         <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    User Management
                </h3>
                <div class="flex gap-2">
                     <input type="text" id="new-username" placeholder="Username" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
                     <button onclick="createUser()" class="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 px-4 rounded-lg shadow transition-colors">Add User</button>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-400">
                    <thead class="bg-slate-900/50 text-xs uppercase font-medium text-slate-300">
                        <tr>
                            <th class="px-4 py-3 rounded-l-lg">Username</th>
                            <th class="px-4 py-3">Password</th>
                            <th class="px-4 py-3">Connection (IP:Port)</th>
                            <th class="px-4 py-3">Traffic Usage</th>
                            <th class="px-4 py-3 rounded-r-lg text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody id="user-table-body" class="divide-y divide-slate-800">
                         <!-- User rows will be inserted here -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <!-- Config Generator Section -->
            <div class="glass-panel rounded-2xl p-8 flex flex-col h-full">
                <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                    </svg>
                    Config Generator
                </h3>

                <div class="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex-grow relative group">
                    <pre id="config-output" class="text-sm text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap break-all h-48 custom-scrollbar">Loading config...</pre>

                    <button onclick="copyConfig()" class="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg shadow-lg transition-all opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span class="text-xs font-bold">COPY</span>
                    </button>
                </div>

                <div class="mt-6 flex gap-4">
                    <button onclick="fetchConfig()" class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex justify-center items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate Config
                    </button>
                </div>
            </div>

            <!-- Live Logs Section -->
            <div class="glass-panel rounded-2xl p-8 flex flex-col h-full">
                 <h3 class="text-xl font-bold text-white mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
                    </svg>
                    Live Traffic Log
                </h3>

                <div class="terminal-log rounded-xl p-4 text-xs text-green-400 font-mono h-64 overflow-y-auto flex-grow shadow-inner shadow-black/50" id="log-container">
                    <div class="opacity-50 border-b border-dashed border-slate-600 pb-2 mb-2">System initialized. Waiting for packets...</div>
                    <!-- Logs will be injected here -->
                </div>
                 <div class="mt-2 text-right text-xs text-slate-500">Auto-refresh: 2s</div>
            </div>
        </div>

        <footer class="text-center text-slate-600 text-sm pb-8">
            &copy; 2024 ZIVPN UDP Custom Manager. Powered by Deno & Hono.
        </footer>

    </div>

    <!-- Logic Script -->
    <script>
        // 1. Fetch Stats
        async function updateStats() {
            try {
                const res = await fetch('/api/stats');
                const data = await res.json();

                document.getElementById('cpu-val').innerText = data.cpu + '%';
                document.getElementById('cpu-bar').style.width = data.cpu + '%';

                document.getElementById('ram-val').innerText = data.ram + '%';
                document.getElementById('ram-bar').style.width = data.ram + '%';
            } catch(e) { console.error("Stats error", e); }
        }

        // 2. Fetch Config
        async function fetchConfig() {
            try {
                const output = document.getElementById('config-output');
                output.innerText = "Generating...";
                const res = await fetch('/api/config');
                const data = await res.json();

                // Format as pretty JSON
                output.innerText = JSON.stringify(data, null, 2);
            } catch(e) { console.error("Config error", e); }
        }

        // 3. Copy Config
        function copyConfig() {
            const text = document.getElementById('config-output').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('button[onclick="copyConfig()"] span');
                const originalText = btn.innerText;
                btn.innerText = "COPIED!";
                setTimeout(() => btn.innerText = originalText, 2000);
            });
        }

        // 4. Fetch Logs
        async function updateLogs() {
            try {
                const res = await fetch('/api/logs');
                const data = await res.json();
                const container = document.getElementById('log-container');

                // Clear and rebuild (simple approach for this demo)
                // In production, we would append new ones.

                const currentScroll = container.scrollTop;
                const isScrolledBottom = (container.scrollHeight - container.clientHeight) <= (container.scrollTop + 50);

                container.innerHTML = '<div class="opacity-50 border-b border-dashed border-slate-600 pb-2 mb-2">System initialized. Waiting for packets...</div>';

                data.logs.forEach(log => {
                    const div = document.createElement('div');
                    div.className = "mb-1 hover:bg-white/5 px-1 rounded transition-colors";
                    div.innerText = log;
                    container.appendChild(div);
                });

                if (isScrolledBottom) {
                    container.scrollTop = container.scrollHeight;
                }
            } catch(e) { console.error("Log error", e); }
        }

        // 5. User Management Functions
        function formatBytes(bytes, decimals) {
            if (decimals === undefined) decimals = 2;
            if (!+bytes) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }

        async function updateUsers() {
            try {
                const res = await fetch('/api/users');
                const users = await res.json();
                const tbody = document.getElementById('user-table-body');
                tbody.innerHTML = '';

                users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-800/50 transition-colors";
                    // Display IP:Port prominently
                    const connectionInfo = SERVER_INFO.domain + ':' + SERVER_INFO.port;

                    tr.innerHTML = [
                        '<td class="px-4 py-3 font-medium text-white">' + user.username + '</td>',
                        '<td class="px-4 py-3 font-mono text-xl font-bold text-yellow-400">' + user.password + '</td>',
                        '<td class="px-4 py-3 font-mono text-sm text-indigo-300 select-all">' + connectionInfo + '</td>',
                        '<td class="px-4 py-3">',
                        '    <div class="flex items-center">',
                        '        <div class="w-full bg-slate-700 h-1.5 rounded-full mr-2 max-w-[50px]">',
                        '            <div class="bg-green-500 h-1.5 rounded-full" style="width: ' + Math.min(100, (user.traffic / (1024*1024*100))*100) + '%"></div>',
                        '        </div>',
                        '        <span class="text-xs">' + formatBytes(user.traffic) + '</span>',
                        '    </div>',
                        '</td>',
                        '<td class="px-4 py-3 text-right flex gap-2 justify-end">',
                         '    <button onclick="copyUserConfig(\\\'' + user.username + '\\\')" class="text-blue-400 hover:text-blue-300 transition-colors" title="Copy Config">',
                        '        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">',
                         '           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />',
                        '        </svg>',
                        '    </button>',
                        '    <button onclick="deleteUser(\\\'' + user.id + '\\\')" class="text-red-400 hover:text-red-300 transition-colors" title="Delete">',
                        '        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">',
                        '            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />',
                        '        </svg>',
                        '    </button>',
                        '</td>'
                    ].join('');
                    tbody.appendChild(tr);
                });
            } catch(e) { console.error("User fetch error", e); }
        }

        async function copyUserConfig(username) {
            try {
                const res = await fetch('/api/config?username=' + username);
                const data = await res.json();
                const text = JSON.stringify(data, null, 2);
                 navigator.clipboard.writeText(text).then(() => {
                    alert("Config for " + username + " copied to clipboard!");
                });
            } catch (e) { console.error(e); }
        }

        async function createUser() {
            const input = document.getElementById('new-username');
            const username = input.value.trim();
            if(!username) return;

            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });
                if(res.ok) {
                    input.value = '';
                    updateUsers();
                }
            } catch(e) { console.error("Create user error", e); }
        }

        async function deleteUser(id) {
            if(!confirm("Are you sure?")) return;
            try {
                await fetch('/api/users/' + id, { method: 'DELETE' });
                updateUsers();
            } catch(e) { console.error("Delete user error", e); }
        }

        // Init
        fetchConfig();
        updateStats();
        updateUsers();

        setInterval(updateStats, 2000);
        setInterval(updateLogs, 2000);
        setInterval(updateUsers, 3000); // Poll users every 3s
    </script>
</body>
</html>
`;
