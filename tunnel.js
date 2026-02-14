/**
 * 🌐 Tunnel Script – Exposes CallSync to the internet
 * 
 * This creates public HTTPS URLs for both the backend and frontend,
 * allowing calls between phones on DIFFERENT WiFi networks.
 * 
 * Usage: node tunnel.js
 */
const { exec } = require('child_process');
const http = require('http');

const BACKEND_PORT = 3001;
const FRONTEND_PORT = 5173;

console.log('\n🌐 CallSync Tunnel – Making your app accessible from anywhere\n');
console.log('Starting tunnels...\n');

// Start backend tunnel
const backendTunnel = exec(
    `npx -y localtunnel --port ${BACKEND_PORT} --subdomain callsync-api-${Date.now().toString(36)}`,
    { cwd: __dirname }
);

let backendUrl = '';
let frontendUrl = '';

backendTunnel.stdout.on('data', (data) => {
    const urlMatch = data.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
        backendUrl = urlMatch[0];
        console.log(`✅ Backend tunnel:  ${backendUrl}`);
        startFrontendTunnel();
    }
});

backendTunnel.stderr.on('data', (data) => {
    if (data.includes('error')) console.error('Backend tunnel error:', data);
});

function startFrontendTunnel() {
    const frontendTunnel = exec(
        `npx -y localtunnel --port ${FRONTEND_PORT} --subdomain callsync-app-${Date.now().toString(36)} --local-https --allow-invalid-cert`,
        { cwd: __dirname }
    );

    frontendTunnel.stdout.on('data', (data) => {
        const urlMatch = data.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
            frontendUrl = urlMatch[0];
            console.log(`✅ Frontend tunnel: ${frontendUrl}`);
            printInstructions();
        }
    });

    frontendTunnel.stderr.on('data', (data) => {
        if (data.includes('error')) console.error('Frontend tunnel error:', data);
    });
}

function printInstructions() {
    console.log('\n' + '═'.repeat(60));
    console.log('  🎉 CallSync is now live on the internet!');
    console.log('═'.repeat(60));
    console.log(`\n  📱 Phone 1 (Create Call):`);
    console.log(`     ${frontendUrl}\n`);
    console.log(`  📱 Phone 2 (Join Call):`);
    console.log(`     Use the share link from Phone 1\n`);
    console.log(`  🔧 Backend API:`);
    console.log(`     ${backendUrl}\n`);
    console.log('  ⚠️  On first visit, click "Click to Continue" on the');
    console.log('     localtunnel splash page\n');
    console.log('═'.repeat(60));
    console.log('\n  Press Ctrl+C to stop all tunnels\n');
}

// Cleanup on exit
process.on('SIGINT', () => {
    console.log('\n🔴 Shutting down tunnels...');
    process.exit(0);
});
