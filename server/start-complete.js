const Turn = require('node-turn');
const { spawn } = require('child_process');

console.log('\n🔵 Initializing CallSync Global Access System...\n');

// 1. Start Local TURN Server
// --------------------------
const turnServer = new Turn({
    authMech: 'long-term',
    credentials: { user: "pass" },
    listeningPort: 3480,
    listeningIps: ['0.0.0.0'],
    relayIps: ['0.0.0.0'],
    debugLevel: 'WARN'
});
turnServer.start();
console.log('✅ Local TURN Relay active on port 3480');

// 2. Open SSH Tunnels
// -------------------
console.log('🔄 Establishing secure tunnels...');

let turnAddress = null;
let webAddress = null;
let backendProcess = null;
let tcpTunnelProcess = null;

// Start HTTP Tunnel (Standard)
const httpTunnel = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-T', '-R', '80:localhost:3001', 'serveo.net']);
httpTunnel.stdout.on('data', (d) => checkOutput(d.toString(), 'HTTP'));
httpTunnel.stderr.on('data', (d) => checkOutput(d.toString(), 'HTTP'));

// Start TCP Tunnel (Prioritize Ngrok CLI, fallback to free tunnels)
async function startTcpTunnel() {
    const token = process.env.NGROK_AUTHTOKEN;

    if (token) {
        console.log('🔄 Requesting secure TCP tunnel via Ngrok (using token)...');

        // Use ngrok CLI binary (more reliable than npm wrapper)
        tcpTunnelProcess = spawn('./node_modules/.bin/ngrok', ['tcp', '3480', '--log', 'stdout']);

        tcpTunnelProcess.stdout.on('data', (d) => checkOutput(d.toString(), 'NGROK'));
        tcpTunnelProcess.stderr.on('data', (d) => checkOutput(d.toString(), 'NGROK'));

        // Give ngrok 10 seconds to connect, then fallback if needed
        setTimeout(() => {
            if (!turnAddress) {
                console.log('⚠️ Ngrok taking too long, trying alternative...');
                fallbackToFreeTunnels();
            }
        }, 10000);
    } else {
        console.log('⚠️ No NGROK_AUTHTOKEN found. Trying free tiered tunnels (Serveo/Pinggy)...');
        console.log('💡 TIP: For 100% steady connections, get a free token from ngrok.com and set NGROK_AUTHTOKEN=<token>');
        fallbackToFreeTunnels();
    }
}

function fallbackToFreeTunnels() {
    if (turnAddress) return; // Already connected
    console.log('🔄 Requesting TCP tunnel from Pinggy (Anonymous fallback)...');
    if (tcpTunnelProcess) tcpTunnelProcess.kill();
    tcpTunnelProcess = spawn('ssh', ['-o', 'StrictHostKeyChecking=no', '-p', '443', '-R0:localhost:3480', 'tcp@a.pinggy.io']);

    tcpTunnelProcess.stdout.on('data', (d) => checkOutput(d.toString(), 'TCP'));
    tcpTunnelProcess.stderr.on('data', (d) => checkOutput(d.toString(), 'TCP'));
}

startTcpTunnel();

// Output Parser
function checkOutput(text, type) {
    const lines = text.split('\n');
    lines.forEach(line => {
        if (!line.trim()) return;

        // HTTP (Serveo): Forwarding HTTP traffic from https://abc.serveo.net
        if (type === 'HTTP' && !webAddress) {
            const match = line.match(/Forwarding HTTP traffic from (https:\/\/[^ ]+)/);
            if (match) {
                webAddress = match[1];
                console.log(`✅ Web Tunnel Established:   ${webAddress}`);
                allSystemsGo();
            }
        }

        // NGROK: url=tcp://6.tcp.ngrok.io:12345
        if (type === 'NGROK' && !turnAddress) {
            const match = line.match(/url=tcp:\/\/([^\s]+)/);
            if (match) {
                turnAddress = match[1];
                console.log(`✅ Media Tunnel Established (Ngrok): ${turnAddress}`);
                allSystemsGo();
            }
        }

        // TCP (Pinggy): tcp://t.pinggy.io:12345
        if (type === 'TCP' && !turnAddress) {
            // Regex for Pinggy TCP output
            const match = line.match(/tcp:\/\/[^:]+:([0-9]+)/);
            if (match) {
                // Pinggy usually gives a full URL like tcp://t.pinggy.io:12345
                // We need 'hostname:port' for TURN config.
                // Let's parse the full string.
                const fullMatch = line.match(/(t\.pinggy\.io:[0-9]+)/) || line.match(/([^/]+:[0-9]+)$/);

                if (fullMatch) {
                    turnAddress = fullMatch[1];
                    console.log(`✅ Media Tunnel Established (Pinggy): ${turnAddress}`);
                    allSystemsGo();
                }
            }
        }
    });
}

// 3. Start Backend
// ----------------
function allSystemsGo() {
    if (backendProcess || !turnAddress || !webAddress) return;

    console.log('\n🚀 Starting Application Server...');
    backendProcess = spawn('node', ['index.js'], {
        env: {
            ...process.env,
            TURN_URL: turnAddress,
            TURN_USERNAME: 'user',
            TURN_PASSWORD: 'pass',
            CLIENT_URL: webAddress
        },
        stdio: 'inherit'
    });

    console.log('═'.repeat(60));
    console.log(`  🎉 CallSync is LIVE Globally!`);
    console.log('═'.repeat(60));
    console.log(`  👉 SHARE THIS URL: ${webAddress}`);
    console.log('═'.repeat(60));
}

// Cleanup
process.on('SIGINT', () => {
    if (backendProcess) backendProcess.kill();
    if (tcpTunnelProcess) tcpTunnelProcess.kill();
    httpTunnel.kill();
    process.exit();
});
