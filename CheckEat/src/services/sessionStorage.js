import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'checkeat.session';

// SecureStore no existe en web: ahi la sesion vive solo en memoria.
const isWeb = Platform.OS === 'web';
let webSession = null;

export async function saveSession(session) {
  const value = JSON.stringify(session);
  if (isWeb) {
    webSession = value;
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function loadSession() {
  const value = isWeb ? webSession : await SecureStore.getItemAsync(SESSION_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export async function clearSession() {
  if (isWeb) {
    webSession = null;
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function isTokenExpired(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const { exp } = JSON.parse(atob(padded));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
