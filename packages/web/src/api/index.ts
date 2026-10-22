import type { RouterClient } from "@orpc/server";
import { createApp } from "./__core/app";
import { products } from "./routes/products";
import { billing } from "./routes/billing";
import { businesses } from "./routes/businesses";
import { crm, sites } from "./routes/sites";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "./database";
import { user, session } from "./database/schema";
import { auth } from "./auth";
import { launch } from "./routes/launch";
import { admin } from "./routes/admin";
import { autumnWebhook } from "./webhooks/autumn";
import { advisorHandler } from "./agent/advisor";
import {
  generateChatMessage,
  generateWithSearchGrounding,
  generateWithMapsGrounding,
} from "./services/gemini";

export const router = {
  admin,
  launch,
  products,
  billing,
  businesses,
  sites,
  crm,
};

export type AppRouter = typeof router;
/** Typed client for the router — used by the web and mobile api clients. */
export type AppRouterClient = RouterClient<AppRouter>;

const app = createApp(router);

// Google Auth session synchronizer (bridges Google / Firebase Auth directly to backend session)
app.post("/api/auth/google-sync", async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }
    const name = (body.name || "").trim() || email.split("@")[0] || "Founder";
    const image = body.image || null;
    const uid = body.uid || null;

    // Check if user exists in SQLite DB
    const existingUsers = await db.select().from(user).where(eq(user.email, email)).limit(1);
    let targetUser = existingUsers[0];

    if (!targetUser) {
      const newUserId = uid || crypto.randomBytes(16).toString("hex");
      const [created] = await db.insert(user).values({
        id: newUserId,
        name,
        email,
        emailVerified: true,
        image,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      targetUser = created;
    } else {
      await db.update(user).set({
        name: targetUser.name || name,
        image: targetUser.image || image,
        emailVerified: true,
        updatedAt: new Date(),
      }).where(eq(user.id, targetUser.id));
    }

    // Generate fresh session token
    const token = crypto.randomBytes(24).toString("hex");
    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.insert(session).values({
      id: sessionId,
      userId: targetUser.id,
      token,
      expiresAt,
      ipAddress: c.req.header("x-forwarded-for") || null,
      userAgent: c.req.header("user-agent") || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    c.header("set-auth-token", token);
    return c.json({
      success: true,
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        image: targetUser.image,
      },
    });
  } catch (err) {
    console.error("[google-sync-error]", err);
    return c.json(
      { error: err instanceof Error ? err.message : "Failed to sync Google user session" },
      500
    );
  }
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.post("/api/webhooks/autumn", (c) => autumnWebhook(c.req.raw));
app.post("/api/agent/messages", (c) => advisorHandler(c.req.raw));

// Gemini Multi-turn Chatbot endpoint
app.post("/api/gemini/chat", async (c) => {
  try {
    const body = await c.req.json();
    const result = await generateChatMessage({
      messages: body.messages || [],
      role: body.role,
      systemInstruction: body.systemInstruction,
      grounding: body.grounding,
      location: body.location,
    });
    return c.json(result);
  } catch (err) {
    console.error("[gemini-chat-error]", err);
    return c.json(
      { error: err instanceof Error ? err.message : "Failed to generate chat response" },
      500
    );
  }
});

// Gemini Google Search Grounding endpoint
app.post("/api/gemini/search-grounding", async (c) => {
  try {
    const body = await c.req.json();
    const result = await generateWithSearchGrounding(
      body.prompt || "",
      body.systemInstruction
    );
    return c.json(result);
  } catch (err) {
    console.error("[gemini-search-error]", err);
    return c.json(
      { error: err instanceof Error ? err.message : "Failed to run search grounding" },
      500
    );
  }
});

// Gemini Google Maps Grounding endpoint
app.post("/api/gemini/maps-grounding", async (c) => {
  try {
    const body = await c.req.json();
    const result = await generateWithMapsGrounding(body.prompt || "", body.location);
    return c.json(result);
  } catch (err) {
    console.error("[gemini-maps-error]", err);
    return c.json(
      { error: err instanceof Error ? err.message : "Failed to run maps grounding" },
      500
    );
  }
});

export default app;
