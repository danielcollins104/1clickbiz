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

/**
 * Email/password sign-in returns the bearer in a `set-auth-token` header. Store it where the
 * managed-auth plugin keeps its token so one token source serves the auth client and oRPC.
 */
const TOKEN_KEY = "runable.managed-auth.token";
export function captureToken(ctx: { response: Response }) {
  const token = ctx.response.headers.get("set-auth-token");
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function authHeaders(): Record<string, string> {
  const token = authClient.managedAuth.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
