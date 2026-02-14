/**
 * API base URL – smartly resolves based on access context:
 * - localhost → Vite proxy (/api)
 * - LAN IP   → direct backend port
 * - Tunnel   → env var or same origin
 */
function getApiBase() {
    const hostname = window.location.hostname;

    // Local dev with Vite proxy
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return '/api';
    }

    // LAN access
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(hostname)) {
        return `http://${hostname}:3001/api`;
    }

    // Tunnel / public
    if (import.meta.env.VITE_BACKEND_URL) {
        return `${import.meta.env.VITE_BACKEND_URL}/api`;
    }

    // Fallback: relative path
    return '/api';
}

const API_BASE = getApiBase();

export async function createSession({ callerId, calleeId, durationLimit }) {
    const res = await fetch(`${API_BASE}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerId, calleeId, durationLimit }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create session: ${res.statusText}`);
    }
    return res.json();
}

export async function getSession(sessionId) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to get session: ${res.statusText}`);
    }
    return res.json();
}

export async function getTurnConfig() {
    const res = await fetch(`${API_BASE}/turn-config`);
    if (!res.ok) {
        console.warn('Failed to fetch TURN config, falling back to defaults');
        return { iceServers: [] };
    }
    return res.json();
}
