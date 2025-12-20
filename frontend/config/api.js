import Constants from 'expo-constants';
import { getJwtToken } from '../auth/storage';

const PROD_URL = 'https://api.yourdomain.com';

// Default to the prior hard-coded host, but derive dynamically in dev
let API_BASE_URL = 'http://192.168.129.44:8080';
//let API_BASE_URL = 'http://10.37.249.133:8080';
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
    // Attach JWT if present
    try {
        const token = await getJwtToken();
        // Debug: log token presence (do not log the full token)
        if (__DEV__) console.log('[api] token present?', !!token, url, method);
        if (token) {
            opts.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        if (__DEV__) console.warn('[api] failed to read token from storage', e);
        // ignore storage errors and proceed without Authorization header
    }
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
        let parsed = null;
        try {
            parsed = text ? JSON.parse(text) : null;
        } catch (e) {
            parsed = null;
        }

        // Prefer structured message fields from the API
        let message = null;
        if (parsed) {
            if (parsed.message) message = parsed.message;
            else if (parsed.error) message = parsed.error;
            else if (parsed.errors) message = typeof parsed.errors === 'string' ? parsed.errors : JSON.stringify(parsed.errors);
            else if (parsed.validationErrors) message = Array.isArray(parsed.validationErrors)
                ? parsed.validationErrors.map(v => v.message || v.defaultMessage || JSON.stringify(v)).join('; ')
                : JSON.stringify(parsed.validationErrors);
            else message = JSON.stringify(parsed);
        }
        // If API didn't provide a helpful message, map common HTTP statuses to friendly text
        const statusFallback = (status) => {
            switch (status) {
                case 400: return 'Bad request. Please check your input and try again.';
                case 401: return 'Unauthorized. Please sign in and try again.';
                case 403: return 'Access denied. You do not have permission to perform this action.';
                case 404: return 'Not found. The requested resource does not exist.';
                case 409: return 'Conflict. The resource could not be processed due to a conflict.';
                case 422: return 'Unprocessable entity. Please check the provided data.';
                case 500: return 'Server error. Please try again later.';
                default: return `Request failed with status ${status}`;
            }
        };

        const finalMessage = message || text || statusFallback(res.status) || res.statusText;
        const err = new Error(finalMessage);
        err.status = res.status;
        err.raw = parsed ?? text;
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

export const getRecipeById = async (id) => {
    return await request(`/api/recipes/${id}`);
};

// User favorites
export const getUserFavoriteCrops = async (userId) => {
    return await request(`/api/users/${userId}/favorite-crops`);
};

export const getUserFavoriteRecipes = async (userId) => {
    return await request(`/api/users/${userId}/favorite-recipes`);
};

export const addFavoriteCrop = async (userId, cropId) => {
    return await request(`/api/users/${userId}/favorite-crops/${cropId}`, { method: 'POST' });
};

export const removeFavoriteCrop = async (userId, cropId) => {
    return await request(`/api/users/${userId}/favorite-crops/${cropId}`, { method: 'DELETE' });
};

export const addFavoriteRecipe = async (userId, recipeId) => {
    return await request(`/api/users/${userId}/favorite-recipes/${recipeId}`, { method: 'POST' });
};

export const removeFavoriteRecipe = async (userId, recipeId) => {
    return await request(`/api/users/${userId}/favorite-recipes/${recipeId}`, { method: 'DELETE' });
};

export const getCrops = async () => {
    const res = await request('/api/crops?size=1000');
    return Array.isArray(res) ? res : (res?.content ?? []);
};

export const createRecipe = async (body) => {
    return await request('/api/recipes', { method: 'POST', body });
};

export const getMeasurements = async () => {
    return await request('/api/measurements');
};

export const getCourses = async () => {
    return await request('/api/courses');
};

export const getCategories = async () => {
    return await request('/api/categories');
};

export const getIngredients = async () => {
    // request many items so the client can filter locally for typeahead
    const res = await request('/api/ingredients?size=1000');
    return Array.isArray(res) ? res : (res?.content ?? []);
};

// Authentication
export const login = async (email, password) => {
    return await request('/api/auth/login', { method: 'POST', body: { email, password } });
};

export const register = async (name, email, password) => {
    return await request('/api/auth/register', { method: 'POST', body: { name, email, password } });
};
