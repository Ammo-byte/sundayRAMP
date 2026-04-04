const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const API_TOKEN = (process.env.EXPO_PUBLIC_API_TOKEN ?? "").trim();
const SETTINGS_REQUEST_TIMEOUT_MS = 8000;

export type AppSettingsValues = Record<string, string | boolean>;

export type AppSettingsResponse = {
  settings: AppSettingsValues;
  errors: string[];
  warnings: string[];
};

export type ReverseGeocodeResponse = {
  label: string;
  latitude: number;
  longitude: number;
};

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (API_TOKEN) {
    headers.authorization = `Bearer ${API_TOKEN}`;
  }
  return headers;
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = SETTINGS_REQUEST_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Check that the Sunday backend is reachable.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse(response: Response): Promise<AppSettingsResponse> {
  const payload = (await response.json().catch(() => ({}))) as Partial<AppSettingsResponse> & {
    detail?: string;
  };
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}.`);
  }
  return {
    settings: payload.settings ?? {},
    errors: payload.errors ?? [],
    warnings: payload.warnings ?? [],
  };
}

export async function fetchAppSettings(): Promise<AppSettingsResponse> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/settings`, {
    method: "GET",
    headers: buildHeaders(),
  });

  return parseResponse(response);
}

export async function saveAppSettings(settings: AppSettingsValues): Promise<AppSettingsResponse> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify({ settings }),
  });

  return parseResponse(response);
}

export async function reverseGeocodeLocation(
  latitude: number,
  longitude: number,
): Promise<ReverseGeocodeResponse> {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured.");
  }

  const response = await fetchWithTimeout(`${API_BASE_URL}/api/settings/reverse-geocode`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ latitude, longitude }),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<ReverseGeocodeResponse> & {
    detail?: string;
  };
  if (!response.ok) {
    throw new Error(payload.detail || `Request failed with status ${response.status}.`);
  }

  return {
    label: payload.label ?? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    latitude: payload.latitude ?? latitude,
    longitude: payload.longitude ?? longitude,
  };
}
