import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple settings storage for non-sensitive preferences like theme
// Note: install with `expo install @react-native-async-storage/async-storage` if not present.

const THEME_KEY = 'app_theme';
const UNIT_SYSTEM_KEY = 'unit_system';

export async function setTheme(theme) {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // ignore or log
    console.warn('Failed to save theme', e);
  }
}

export async function getTheme() {
  try {
    const v = await AsyncStorage.getItem(THEME_KEY);
    return v;
  } catch (e) {
    return null;
  }
}

export async function clearTheme() {
  try {
    await AsyncStorage.removeItem(THEME_KEY);
  } catch (e) {
    // ignore
  }
}

export async function setUnitSystem(system) {
  try {
    await AsyncStorage.setItem(UNIT_SYSTEM_KEY, system);
  } catch (e) {
    console.warn('Failed to save unit system', e);
  }
}

export async function getUnitSystem() {
  try {
    const v = await AsyncStorage.getItem(UNIT_SYSTEM_KEY);
    return v;
  } catch (e) {
    return null;
  }
}

export async function clearUnitSystem() {
  try {
    await AsyncStorage.removeItem(UNIT_SYSTEM_KEY);
  } catch (e) {
    // ignore
  }
}

export default { setTheme, getTheme, clearTheme };
