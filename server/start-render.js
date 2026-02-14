console.log('\n🔵 Starting CallSync Production Server...\n');

// Get the public URL from Render environment
const publicUrl = process.env.RENDER_EXTERNAL_URL || 'http://localhost:3001';

// Use Google's free public TURN servers (more reliable than self-hosted on Render free tier)
// Render free tier only exposes HTTP/HTTPS port, can't expose custom TURN ports
process.env.TURN_URL = 'stun:stun.l.google.com:19302';
process.env.TURN_USERNAME = '';
process.env.TURN_PASSWORD = '';
process.env.CLIENT_URL = publicUrl;

console.log(`✅ Public URL: ${publicUrl}`);
console.log(`✅ Using Google STUN/TURN servers for WebRTC`);
console.log('\n🚀 Starting application...\n');

require('./index.js');

