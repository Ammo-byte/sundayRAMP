import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchApi } from "./api";

const TOKEN_KEY = "sunday.auth.token";
const DEMO_KEY  = "sunday.auth.demo";

export type AuthState = {
  token: string;
  isDemo: boolean;
};

export async function getAuthState(): Promise<AuthState | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const isDemo = (await AsyncStorage.getItem(DEMO_KEY)) === "true";
  return { token, isDemo };
}

export async function saveAuthState(token: string, isDemo: boolean): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(DEMO_KEY, isDemo ? "true" : "false");
}

export async function clearAuthState(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, DEMO_KEY]);
}

// ── API calls ────────────────────────────────────────────────────────────────

type AuthResponse = {
  token: string;
  demo?: boolean;
  demo_entries?: object[];
};

async function _authPost(path: string, body: object): Promise<AuthResponse> {
  const res = await fetchApi(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? "Request failed");
  return json as AuthResponse;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  return _authPost("/auth/signup", { email, password });
}

export async function logIn(email: string, password: string): Promise<AuthResponse> {
  return _authPost("/auth/login", { email, password });
}

export async function demoLogin(): Promise<AuthResponse> {
  const res = await fetchApi("/auth/demo", { method: "POST" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? "Demo login failed");
  return json as AuthResponse;
}
