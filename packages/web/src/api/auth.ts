import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { runableManagedAuth } from "@runablehq/managed-auth/server";
import { Autumn } from "autumn-js";
import { db } from "./database";
import { appUrl, emailEnabled, notify } from "./services/email";

const autumnSdk = new Autumn();

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      if (!emailEnabled()) throw new Error("Password reset email isn't enabled yet. Please contact support.");
      const sent = await notify({ to: user.email, title: "Reset your password", message: "Use the link below to set a new password. If you did not request this, ignore this email.", url, action: "Reset password" });
      if (!sent) throw new Error("Could not send the reset email. Please try again later.");
    },
  },
  user: { additionalFields: { onboarding: { type: "json", required: false, input: false } } },
  secret: process.env.BETTER_AUTH_SECRET || "default_better_auth_secret_dev_32_chars_min",
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  plugins: [
    ...runableManagedAuth({
      applicationId: process.env.APPLICATION_ID || "app",
      issuer: process.env.VITE_RUNABLE_AUTH_ISSUER || "https://auth.runable.com",
    }),
    expo(),
  ],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await notify({ to: user.email, title: "Welcome to 1 Click Business", message: "Pick your plan, answer eight questions, and build your business. Your dashboard keeps everything in one place.", url: appUrl(), key: `welcome-${user.id}` });
          try {
            await autumnSdk.customers.getOrCreate({
              customerId: user.id,
              name: user.name,
              email: user.email,
            });
          } catch (e) {
            console.error("[autumn] Failed to create customer on sign-up:", e);
          }
        },
      },
    },
  },
});
