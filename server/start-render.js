const Turn = require('node-turn');
const { spawn } = require('child_process');

console.log('\n🔵 Starting CallSync Production Server...\n');

// Get the public URL from Render environment
const publicUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';
const host = publicUrl.replace('https://', '').replace('http://', '');

// 1. Start Local TURN Server on public IP
const turnServer = new Turn({
    authMech: 'long-term',
    credentials: { user: "pass" },
    listeningPort: 3478,
    listeningIps: ['0.0.0.0'],
    relayIps: ['0.0.0.0'],
    debugLevel: 'WARN'
});

turnServer.start();
console.log('✅ TURN Relay active on port 3478');

// 2. Set environment variables for backend
process.env.TURN_URL = `${host}:3478`;
process.env.TURN_USERNAME = 'user';
process.env.TURN_PASSWORD = 'pass';
process.env.CLIENT_URL = publicUrl;

// 3. Start the main application server
console.log(`✅ Public URL: ${publicUrl}`);
console.log(`✅ TURN Server: ${host}:3478`);
console.log('\n🚀 Starting application...\n');

require('./index.js');
