import * as SecureStore from 'expo-secure-store';

// Small helper around expo-secure-store for storing sensitive auth values.
// Note: install with `expo install expo-secure-store` if not already present.

// Keys used in SecureStore
const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';
const JWT_TOKEN_KEY = 'jwt_token'; // persistent JWT storage key (use with caution)

// in-memory access token (kept here for short-lived access tokens)
let _inMemoryAccessToken = null;

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
  return SecureStore.setItemAsync(JWT_TOKEN_KEY, token);
}

export async function getJwtToken() {
  return SecureStore.getItemAsync(JWT_TOKEN_KEY);
}

export async function deleteJwtToken() {
  return SecureStore.deleteItemAsync(JWT_TOKEN_KEY);
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
};
