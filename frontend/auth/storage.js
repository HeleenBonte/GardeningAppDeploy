import * as SecureStore from 'expo-secure-store';

// Small helper around expo-secure-store for storing sensitive auth values.
// Note: install with `expo install expo-secure-store` if not already present.

// Keys used in SecureStore
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';
const JWT_TOKEN_KEY = 'jwt_token'; // persistent JWT storage key (use with caution)

// in-memory access token (kept here for short-lived access tokens)
let _inMemoryAccessToken = null;
// timer for scheduled auto-logout
let _autoLogoutTimer = null;
const MAX_TIMEOUT = 2147483647; // max setTimeout (~24.8 days)

export async function isAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch (e) {
    return false;
  }
}

export async function saveRefreshToken(token) {
  if (!token && token !== '') return;
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function deleteRefreshToken() {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

// Persist a JWT token. Some APIs require the JWT to be present on every request
// and you indicated your backend uses JWTs exclusively — storing them in
// SecureStore is acceptable for mobile apps, but be aware of platform
// differences (iOS Keychain / Android Keystore) and uninstall behavior.
export async function saveJwtToken(token) {
  if (!token && token !== '') return;
  try {
    const res = await SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
    // schedule auto-logout based on token expiry
    try { scheduleAutoLogoutForToken(token); } catch (_) {}
    return res;
  } catch (e) {
    throw e;
  }
}

export async function getJwtToken() {
  return SecureStore.getItemAsync(JWT_TOKEN_KEY);
}

export async function deleteJwtToken() {
  const res = await SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
  try { clearAutoLogout(); } catch (_) {}
  return res;
}

function clearAutoLogout() {
  if (_autoLogoutTimer) {
    clearTimeout(_autoLogoutTimer);
    _autoLogoutTimer = null;
  }
}

function scheduleAutoLogoutForToken(token) {
  try {
    if (!token) return;
    const parts = token.split('.');
    if (parts.length < 2) return;
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = payloadB64.length % 4;
    const padded = pad ? payloadB64 + '='.repeat(4 - pad) : payloadB64;
    let json = null;
    try {
      const decoded = typeof atob === 'function' ? atob(padded) : null;
      if (decoded) {
        try {
          json = decodeURIComponent(Array.prototype.map.call(decoded, (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        } catch (e) {
          json = decoded;
        }
      }
    } catch (e) {
      if (__DEV__) console.warn('JWT decode failed', e);
    }
    if (!json) return;
    const obj = JSON.parse(json);
    if (!obj || !obj.exp) return;
    const expMs = Number(obj.exp) * 1000;
    const now = Date.now();
    let delay = expMs - now;
    if (delay <= 0) {
      (async () => { try { await logout('expired'); } catch (_) {} })();
      return;
    }
    clearAutoLogout();
    if (delay > MAX_TIMEOUT) {
      _autoLogoutTimer = setTimeout(() => {
        _autoLogoutTimer = null;
        (async () => {
          try {
            const t = await getJwtToken();
            scheduleAutoLogoutForToken(t);
          } catch (_) {}
        })();
      }, MAX_TIMEOUT);
    } else {
      _autoLogoutTimer = setTimeout(() => {
        _autoLogoutTimer = null;
        (async () => { try { await logout('expired'); } catch (_) {} })();
      }, delay);
    }
  } catch (e) {
    if (__DEV__) console.warn('Failed to schedule auto-logout', e);
  }
}

// Access token helpers: recommended to keep access token in memory only.
export function setAccessTokenInMemory(token) {
  _inMemoryAccessToken = token;
}

export function getAccessTokenInMemory() {
  return _inMemoryAccessToken;
}

export function clearAccessTokenInMemory() {
  _inMemoryAccessToken = null;
}

// Generic helpers if you need to store other small secrets
export async function saveItem(key, value) {
  return SecureStore.setItemAsync(key, String(value));
}

export async function getItem(key) {
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
  return SecureStore.deleteItemAsync(key);
}

// Logout helpers: clear all auth-related persisted items and notify listeners
const LOGOUT_KEYS = [REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY, JWT_TOKEN_KEY, 'user_id', 'username'];
let _logoutListeners = [];

export async function logout(reason = null) {
  try {
    // delete known keys
    await Promise.all(LOGOUT_KEYS.map(k => SecureStore.deleteItemAsync(k)));
  } catch (e) {
    // ignore
  }
  // clear in-memory token
  clearAccessTokenInMemory();

  // notify listeners (provide optional reason)
  try {
    _logoutListeners.forEach((cb) => {
      try { cb(reason); } catch (_) { /* ignore listener errors */ }
    });
  } catch (_) { /* ignore */ }
}

export function onLogout(callback) {
  if (typeof callback !== 'function') return () => {};
  _logoutListeners.push(callback);
  return () => {
    const idx = _logoutListeners.indexOf(callback);
    if (idx >= 0) _logoutListeners.splice(idx, 1);
  };
}

export default {
  isAvailable,
  saveRefreshToken,
  getRefreshToken,
  deleteRefreshToken,
  saveJwtToken,
  getJwtToken,
  deleteJwtToken,
  setAccessTokenInMemory,
  getAccessTokenInMemory,
  clearAccessTokenInMemory,
  saveItem,
  getItem,
  deleteItem,
  logout,
  onLogout,
};

// On module load, try to schedule auto-logout if a token is already present
(async () => {
  try {
    const t = await getJwtToken();
    if (t) scheduleAutoLogoutForToken(t);
  } catch (_) {}
})();
