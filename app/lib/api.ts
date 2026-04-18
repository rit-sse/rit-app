import { Platform } from "react-native";

function getDefaultApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const API_BASE_URL = getDefaultApiBaseUrl().replace(/\/$/, "");

export function buildApiUrl(path: string, query?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, value.toString());
      }
    }
  }

  return url.toString();
}
