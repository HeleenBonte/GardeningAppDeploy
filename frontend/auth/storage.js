import * as SecureStore from 'expo-secure-store';

const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';
const JWT_TOKEN_KEY = 'jwt_token';

let _inMemoryAccessToken = null;
let _autoLogoutTimer = null;
const MAX_TIMEOUT = 2147483647;

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

export async function saveJwtToken(token) {
  if (!token && token !== '') return;
  try {
    const res = await SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
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
  }
}

export function setAccessTokenInMemory(token) {
  _inMemoryAccessToken = token;
}

export function getAccessTokenInMemory() {
  return _inMemoryAccessToken;
}

export function clearAccessTokenInMemory() {
  _inMemoryAccessToken = null;
}

export async function saveItem(key, value) {
  return SecureStore.setItemAsync(key, String(value));
}

export async function getItem(key) {
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key) {
  return SecureStore.deleteItemAsync(key);
}

const LOGOUT_KEYS = [REFRESH_TOKEN_KEY, ACCESS_TOKEN_KEY, JWT_TOKEN_KEY, 'user_id', 'username'];
let _logoutListeners = [];

export async function logout(reason = null) {
  try {
    await Promise.all(LOGOUT_KEYS.map(k => SecureStore.deleteItemAsync(k)));
  } catch (e) {
  }

  clearAccessTokenInMemory();

  try {
    _logoutListeners.forEach((cb) => {
      try { cb(reason); } catch (_) {  }
    });
  } catch (_) {  }
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

(async () => {
  try {
    const t = await getJwtToken();
    if (t) scheduleAutoLogoutForToken(t);
  } catch (_) {}
})();
