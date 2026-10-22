import { useEffect, useState } from "react";
import { createAuthClient } from "better-auth/react";
import { managedAuthClient } from "@runablehq/managed-auth/client";

const config = {
  applicationId: import.meta.env.VITE_APPLICATION_ID || "app",
  issuer: import.meta.env.VITE_RUNABLE_AUTH_ISSUER || "https://auth.runable.com",
};

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_WEBSITE_URL ?? window.location.origin,
  basePath: "/api/auth",
  plugins: [managedAuthClient(config)],
});

const TOKEN_KEY = "runable.managed-auth.token";
const LOCAL_SESSION_KEY = "1cb_local_session";
const LOCAL_USERS_KEY = "1cb_local_users";
const AUTH_EVENT = "1cb-auth-change";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  onboarding?: Record<string, boolean> | null;
}

export function getLocalSession(): { user: LocalUser } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as LocalUser;
    if (user && user.email) return { user };
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function setLocalSession(user: {
  id?: string;
  email: string;
  name?: string;
  image?: string | null;
  onboarding?: Record<string, boolean> | null;
}): { user: LocalUser } {
  const cleanEmail = user.email.trim().toLowerCase();
  const localUser: LocalUser = {
    id: user.id || `usr_${btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`,
    email: cleanEmail,
    name: user.name?.trim() || cleanEmail.split("@")[0] || "Founder",
    image: user.image ?? null,
    onboarding: user.onboarding ?? {},
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(localUser));
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
  return { user: localUser };
}

export function clearLocalSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }
}

export function authenticateLocalEmail(opts: {
  mode: "in" | "up";
  email: string;
  password: string;
  name?: string;
}): { user: LocalUser } | { error: string } {
  const cleanEmail = opts.email.trim().toLowerCase();
  if (!cleanEmail) return { error: "Please enter a valid email address." };
  if (!opts.password || opts.password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  let users: Record<string, { name: string; password: string }> = {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) users = JSON.parse(raw);
  } catch {
    users = {};
  }

  const existing = users[cleanEmail];
  if (opts.mode === "up") {
    const userName = opts.name?.trim() || cleanEmail.split("@")[0] || "Founder";
    users[cleanEmail] = { name: userName, password: opts.password };
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    return setLocalSession({ email: cleanEmail, name: userName });
  } else {
    if (existing && existing.password !== opts.password) {
      return { error: "Wrong email or password." };
    }
    const userName = existing?.name || opts.name?.trim() || cleanEmail.split("@")[0] || "Founder";
    if (!existing) {
      users[cleanEmail] = { name: userName, password: opts.password };
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    }
    return setLocalSession({ email: cleanEmail, name: userName });
  }
}

export function useLocalSession() {
  const [local, setLocal] = useState<{ user: LocalUser } | null>(() => getLocalSession());
  useEffect(() => {
    const handler = () => setLocal(getLocalSession());
    window.addEventListener(AUTH_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(AUTH_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return local;
}

export function captureToken(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function authHeaders(): Record<string, string> {
  const token = authClient.managedAuth.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
