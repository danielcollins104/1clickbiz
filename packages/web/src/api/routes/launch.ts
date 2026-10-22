import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { user, supportMessages } from "../database/schema";
import { emailEnabled, notify } from "../services/email";
const hits = new Map<string, number[]>();
export const launch = {
  config: base.handler(() => ({
    emailEnabled: emailEnabled(),
    support: process.env.SUPPORT_EMAIL ?? "mr.danielbjorke@gmail.com",
  })),
  onboarding: authed.handler(
    async ({ context }) =>
      (await db.query.user.findFirst({ where: eq(user.id, context.user.id) }))
        ?.onboarding ?? {},
  ),
  update: authed
    .input(
      z.object({
        dismissed: z.boolean().optional(),
        openedSite: z.boolean().optional(),
        sharedSite: z.boolean().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const u = await db.query.user.findFirst({
        where: eq(user.id, context.user.id),
      });
      await db
        .update(user)
        .set({ onboarding: { ...u?.onboarding, ...input } })
        .where(eq(user.id, context.user.id));
      return { ok: true };
    }),
  contact: base
    .input(
      z.object({
        name: z.string().trim().min(1).max(120),
        email: z.email().max(200),
        message: z.string().trim().min(10).max(4000),
        company: z.string().max(0).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const ip =
        context.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
      const now = Date.now();
      const recent = (hits.get(ip) ?? []).filter((t) => t > now - 600_000);
      if (recent.length >= 3)
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Please wait ten minutes before sending another message.",
        });
      hits.set(ip, [...recent, now]);
      const [msg] = await db.insert(supportMessages).values(input).returning();
      await notify({
        to: process.env.SUPPORT_EMAIL ?? "mr.danielbjorke@gmail.com",
        title: "New support message",
        message: `${input.name} (${input.email})\n\n${input.message}`,
        replyTo: input.email,
        key: `support-${msg!.id}`,
      });
      return { ok: true };
    }),
};
