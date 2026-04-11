const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
