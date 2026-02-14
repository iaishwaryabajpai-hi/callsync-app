/**
 * 🌐 Start server + internet tunnel
 * 
 * Makes CallSync accessible from ANY network (different WiFi, mobile data, etc.)
 * Works like Zoom/Google Meet – just share the link!
 * 
 * Usage: node start-public.js
 */
const { spawn } = require('child_process');
const localtunnel = require('localtunnel');
const path = require('path');

const BACKEND_PORT = 3001;

async function main() {
    console.log('\n🚀 Starting CallSync Public Server...\n');

    // 1. Start the backend server
    const server = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env },
    });

    server.stdout.on('data', (data) => {
        process.stdout.write(`[server] ${data}`);
    });
    server.stderr.on('data', (data) => {
        process.stderr.write(`[server] ${data}`);
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Create backend tunnel
    console.log('🌐 Creating internet tunnel...\n');

    try {
        const tunnel = await localtunnel({ port: BACKEND_PORT });

        console.log('═'.repeat(60));
        console.log('  🎉 CallSync is LIVE on the internet!');
        console.log('═'.repeat(60));
        console.log(`\n  🔗 Public Backend URL:`);
        console.log(`     ${tunnel.url}\n`);
        console.log(`  📱 To use on phones:`);
        console.log(`     1. Both phones open: ${tunnel.url}`);
        console.log(`     2. Phone 1: Create a call session`);
        console.log(`     3. Phone 2: Join using the session link\n`);
        console.log(`  ⚠️  First visit: Click "Click to Continue" on the splash page`);
        console.log('═'.repeat(60));
        console.log('\n  Press Ctrl+C to stop\n');

        tunnel.on('close', () => {
            console.log('🔴 Tunnel closed');
        });

        tunnel.on('error', (err) => {
            console.error('Tunnel error:', err);
        });

    } catch (err) {
        console.error('Failed to create tunnel:', err.message);
        console.log('\n🔄 Alternative: Use ngrok instead:');
        console.log('   npx ngrok http 3001\n');
    }

    // Cleanup
    process.on('SIGINT', () => {
        console.log('\n🔴 Shutting down...');
        server.kill();
        process.exit(0);
    });
}

main();
