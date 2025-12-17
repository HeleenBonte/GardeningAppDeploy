import Constants from 'expo-constants';

const PROD_URL = 'https://api.yourdomain.com';

// Default to the prior hard-coded host, but derive dynamically in dev
let API_BASE_URL = 'http://192.168.129.44:8080';
if (__DEV__) {
    // Try several places where Expo may expose the dev host
    const debuggerHost = Constants.manifest?.debuggerHost
        || Constants.manifest?.hostUri
        || Constants.expoConfig?.hostUri
        || Constants.expoGo?.hostUri;
    const host = debuggerHost ? String(debuggerHost).split(':')[0] : null;
    if (host && host !== 'localhost') {
        API_BASE_URL = `http://${host}:8080`;
    }
} else {
    API_BASE_URL = PROD_URL;
}

// Helpful debug output in dev so you can confirm which host is used from the phone
if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[api] API_BASE_URL =', API_BASE_URL, ' (derived from expo Constants)');
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
    const url = `${API_BASE_URL}${path}`;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (body) opts.body = JSON.stringify(body);

    let res;
    try {
        res = await fetch(url, opts);
    } catch (err) {
        // Network error (DNS, unreachable, CORS blocked by network) — make message clearer
        const e = new Error(`Network request failed to ${url}: ${err.message}`);
        e.cause = err;
        throw e;
    }
    if (!res.ok) {
        const text = await res.text();
        const err = new Error(text || res.statusText);
        err.status = res.status;
        throw err;
    }
    if (res.status === 204) return null;
    // Try parse JSON, but fall back to text with improved error info
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (err) {
        const e = new Error(`Failed to parse JSON from ${url}: ${err.message}`);
        e.raw = text;
        throw e;
    }
}

export { API_BASE_URL, request };

export const getRecipes = async () => {
    const res = await request('/api/recipes?size=1000');
    return Array.isArray(res) ? res : (res?.content ?? []);
};

export const getCrops = async () => {
    const res = await request('/api/crops?size=1000');
    return Array.isArray(res) ? res : (res?.content ?? []);
};
