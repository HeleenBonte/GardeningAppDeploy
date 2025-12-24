import Constants from 'expo-constants';
import { getJwtToken, logout } from '../auth/storage';

const PROD_URL = 'https://api.yourdomain.com';

let API_BASE_URL = 'http://192.168.129.44:8080';
if (__DEV__) {
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

console.log('[api] API_BASE_URL =', API_BASE_URL, ' (derived from expo Constants)');

async function request(path, { method = 'GET', body, headers = {} } = {}) {
    const url = `${API_BASE_URL}${path}`;
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
    };
    try {
    const token = await getJwtToken();
    console.log('[api] token present?', !!token, url, method);
        if (token) {
            opts.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        if (__DEV__) console.warn('[api] failed to read token from storage', e);
    }
    if (body) opts.body = JSON.stringify(body);

    let res;
    try {
        res = await fetch(url, opts);
    } catch (err) {
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
        if (res.status === 401) {
            try { await logout('expired'); } catch (_) { }
        }
        throw err;
    }
    if (res.status === 204) return null;
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

export const getUserById = async (id) => {
    return await request(`/api/users/${id}`);
};

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
    const res = await request('/api/ingredients?size=1000');
    return Array.isArray(res) ? res : (res?.content ?? []);
};

export const getRecipesByIngredient = async (ingrId) => {
    const res = await request(`/api/recipes/ingredient/${ingrId}?size=1000`);
    return Array.isArray(res) ? res : (res?.content ?? []);
};

export const login = async (email, password) => {
    return await request('/api/auth/login', { method: 'POST', body: { email, password } });
};

export const register = async (name, email, password) => {
    return await request('/api/auth/register', { method: 'POST', body: { name, email, password } });
};

export const updateUser = async (id, body) => {
    try {
        const token = await getJwtToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        return await request(`/api/users/${id}`, { method: 'PUT', body, headers });
    } catch (e) {
        return await request(`/api/users/${id}`, { method: 'PUT', body });
    }
};

export const deleteUser = async (id) => {
    return await request(`/api/users/${id}`, { method: 'DELETE' });
};
