import { Platform } from "react-native";

function getDefaultApiBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    if (Platform.OS === "android") {
      return configuredUrl
        .replace("://localhost", "://10.0.2.2")
        .replace("://127.0.0.1", "://10.0.2.2");
    }

    return configuredUrl;
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
