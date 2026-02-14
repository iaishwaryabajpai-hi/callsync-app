import { io } from 'socket.io-client';

let socket = null;

/**
 * Resolves the backend server URL based on current access context:
 * - localhost → use Vite proxy (relative path)
 * - LAN IP   → direct backend on port 3001
 * - Tunnel   → use backend tunnel URL from env or same origin
 */
function getServerUrl() {
    const hostname = window.location.hostname;

    // Local development with Vite proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return undefined; // relative path, Vite proxies /socket.io
    }

    // LAN access (private IP ranges)
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
        return `https://${hostname}:3001`;
    }

    // Tunnel / public – backend is on same port (proxied) or separate tunnel
    // Check if backend URL is provided via env
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }

    // Default: try same origin (works if frontend proxies to backend)
    return undefined;
}

export function connectSocket(backendUrl) {
    if (socket?.connected) return socket;

    const serverUrl = backendUrl || getServerUrl();

    socket = io(serverUrl || '', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        timeout: 20000,
        secure: false,
        rejectUnauthorized: false,
        withCredentials: false,
    });

    socket.on('connect', () => {
        console.log('🟢 Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.log('🔴 Socket error:', err.message);
    });

    socket.on('reconnect', (attempt) => {
        console.log(`🔄 Reconnected after ${attempt} attempts`);
    });

    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}
