import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = 5264;
const DEFAULT_PATH = '/api';
const OVERRIDE_KEY = 'api_base_url_override';

function extractHostFromExpo(): string | null {
  try {
    // Newer Expo
    const hostUri: string | undefined =
      (Constants as any)?.expoConfig?.hostUri ||
      (Constants as any)?.manifest2?.extra?.expoClient?.hostUri ||
      (Constants as any)?.manifest?.hostUri ||
      (Constants as any)?.manifest?.debuggerHost; // e.g. "192.168.1.51:19000"

    if (!hostUri) return null;

    const hostPart = hostUri.split('//').pop() || hostUri; // remove scheme if present
    const host = hostPart.split(':')[0];
    return host || null;
  } catch {
    return null;
  }
}

function buildHttpBase(host: string, port: number = DEFAULT_PORT, path: string = DEFAULT_PATH): string {
  return `http://${host}:${port}${path}`;
}

export async function getApiBaseUrl(): Promise<string> {
  // 1) Manual override takes precedence
  try {
    const override = await AsyncStorage.getItem(OVERRIDE_KEY);
    if (override && /^https?:\/\//i.test(override)) {
      return override.replace(/\/$/, '');
    }
  } catch {}

  // 2) Try to derive from Expo LAN host
  const host = extractHostFromExpo();
  if (host) {
    // Emulator/simulator special cases
    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      return buildHttpBase('10.0.2.2');
    }
    if (Platform.OS === 'ios' && (host === 'localhost' || host === '127.0.0.1')) {
      return buildHttpBase('localhost');
    }
    return buildHttpBase(host);
  }

  // 3) Fallback: ask user to set override via Settings (keep previous if exists)
  // If no valid base can be derived, return a safe placeholder to avoid undefined
  return buildHttpBase('192.168.1.100');
}

export async function setApiBaseUrlOverride(url: string | null): Promise<void> {
  if (!url) {
    await AsyncStorage.removeItem(OVERRIDE_KEY);
    return;
  }
  await AsyncStorage.setItem(OVERRIDE_KEY, url);
}

export async function getApiBaseUrlOverride(): Promise<string | null> {
  return (await AsyncStorage.getItem(OVERRIDE_KEY)) || null;
}


