import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { assets, businesses as bizTable, leads } from "../database/schema";
import { getAccess, requireTool } from "../lib/autumn";
import { applyChoice, isLive, isRunning, runTool, startPipeline } from "../lib/pipeline";
import { signImages } from "../lib/s3";
import { GENERATORS } from "../agent/generators";

const IntakeSchema = z.object({
  idea: z.string().max(600).default(""),
  skills: z.string().max(400).default(""),
  interests: z.string().max(400).default(""),
  budget: z.string().max(80).default(""),
  hours: z.string().max(80).default(""),
  location: z.string().max(120).default(""),
  customer: z.string().max(400).default(""),
  tone: z.string().max(120).default(""),
});

async function ownBusiness(userId: string, id: number) {
  const biz = await db.query.businesses.findFirst({
    where: and(eq(bizTable.id, id), eq(bizTable.userId, userId)),
  });
  if (!biz) throw new ORPCError("NOT_FOUND", { message: "Business not found" });
  return biz;
}

const ToolSlug = z.string().refine((s) => s in GENERATORS, "Unknown tool");

export const businesses = {
  list: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(bizTable)
      .where(eq(bizTable.userId, context.user.id))
      .orderBy(desc(bizTable.updatedAt));
    return rows.map((b) => ({ id: b.id, name: b.name, slug: b.slug, updatedAt: b.updatedAt }));
  }),

  get: authed.input(z.object({ id: z.number() })).handler(async ({ input, context }) => {
    const biz = await ownBusiness(context.user.id, input.id);
    const rows = await db.select().from(assets).where(eq(assets.businessId, biz.id));
    const signed = await Promise.all(
      rows.map(async (r) => ({
        tool: r.tool,
        // A "running" row with no live job was interrupted (e.g. server restart).
        status: r.status === "running" && !isLive(biz.id, r.tool) ? (r.content ? "done" : "error") : r.status,
        error: r.status === "running" && !isLive(biz.id, r.tool) ? "Interrupted — regenerate to try again." : r.error,
        version: r.version,
        updatedAt: r.updatedAt,
        content: r.content ? await signImages(r.content) : null,
      })),
    );
    const leadCount = (await db.select({ id: leads.id }).from(leads).where(eq(leads.businessId, biz.id))).length;
    return {
      business: { id: biz.id, name: biz.name, slug: biz.slug, intake: biz.intake, createdAt: biz.createdAt },
      assets: Object.fromEntries(signed.map((a) => [a.tool, a])) as Record<string, (typeof signed)[number]>,
      running: isRunning(biz.id),
      leadCount,
    };
  }),

  /** Creates a business from the intake answers and starts generating everything. */
  create: authed.input(IntakeSchema).handler(async ({ input, context }) => {
    const access = await getAccess(context.user);
    if (!access.tools.length) {
      throw new ORPCError("FORBIDDEN", { message: "Subscribe to unlock the tools first." });
    }
    const [biz] = await db
      .insert(bizTable)
      .values({ userId: context.user.id, slug: `biz-${crypto.randomUUID().slice(0, 8)}`, intake: input })
      .returning();
    startPipeline(context.user, biz!.id);
    return { id: biz!.id };
  }),

  updateIntake: authed
    .input(z.object({ id: z.number(), intake: IntakeSchema }))
    .handler(async ({ input, context }) => {
      await ownBusiness(context.user.id, input.id);
      await db
        .update(bizTable)
        .set({ intake: input.intake, updatedAt: new Date() })
        .where(eq(bizTable.id, input.id));
      return { ok: true };
    }),

  /** Customizes the public site URL slug (free). */
  updateSlug: authed
    .input(
      z.object({
        id: z.number(),
        slug: z
          .string()
          .min(2, "URL slug must be at least 2 characters")
          .max(64, "URL slug cannot exceed 64 characters")
          .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed"),
      })
    )
    .handler(async ({ input, context }) => {
      const biz = await ownBusiness(context.user.id, input.id);
      const cleanSlug = input.slug.toLowerCase().trim();
      const clash = await db.query.businesses.findFirst({
        where: eq(bizTable.slug, cleanSlug),
      });
      if (clash && clash.id !== biz.id) {
        throw new ORPCError("CONFLICT", { message: "This URL name is already taken. Please choose another." });
      }
      await db
        .update(bizTable)
        .set({ slug: cleanSlug, updatedAt: new Date() })
        .where(eq(bizTable.id, input.id));
      return { ok: true, slug: cleanSlug };
    }),

  /** Re-runs the pipeline from a given tool onward (or everything). */
  rebuild: authed
    .input(z.object({ id: z.number(), from: ToolSlug.optional() }))
    .handler(async ({ input, context }) => {
      await ownBusiness(context.user.id, input.id);
      const started = startPipeline(context.user, input.id, { from: input.from });
      if (!started) throw new ORPCError("CONFLICT", { message: "Already building — hang tight." });
      return { ok: true };
    }),

  /** Regenerates a single tool, optionally with a typed instruction ("make it warmer"). */
  regenerate: authed
    .input(z.object({ id: z.number(), tool: ToolSlug, instruction: z.string().max(800).optional() }))
    .handler(async ({ input, context }) => {
      await ownBusiness(context.user.id, input.id);
      await requireTool(context.user, input.tool);
      try {
        await runTool(context.user, input.id, input.tool, input.instruction?.trim() || undefined);
      } catch (e) {
        throw new ORPCError("BAD_GATEWAY", {
          message: e instanceof Error ? e.message.slice(0, 220) : "Generation failed",
        });
      }
      return { ok: true };
    }),

  /** Picks one option (idea, name, logo concept). */
  choose: authed
    .input(z.object({ id: z.number(), tool: z.enum(["idea-wizard", "name-generator", "logo-generation"]), index: z.number().int().min(0) }))
    .handler(async ({ input, context }) => {
      await ownBusiness(context.user.id, input.id);
      const row = await db.query.assets.findFirst({
        where: and(eq(assets.businessId, input.id), eq(assets.tool, input.tool)),
      });
      if (!row?.content) throw new ORPCError("NOT_FOUND", { message: "Nothing to choose from yet." });
      const content = { ...row.content, chosen: input.index };
      await db.update(assets).set({ content, updatedAt: new Date() }).where(eq(assets.id, row.id));
      await applyChoice(input.id, input.tool, content);
      return { ok: true };
    }),

  /** Ticks a checklist item. */
  toggleTask: authed
    .input(z.object({ id: z.number(), taskId: z.string(), done: z.boolean() }))
    .handler(async ({ input, context }) => {
      await ownBusiness(context.user.id, input.id);
      const row = await db.query.assets.findFirst({
        where: and(eq(assets.businessId, input.id), eq(assets.tool, "launch-checklist")),
      });
      const content = (row?.content ?? {}) as { items?: { id: string; done: boolean }[] };
      if (!row || !content.items) throw new ORPCError("NOT_FOUND", { message: "Checklist not generated yet." });
      const items = content.items.map((it) => (it.id === input.taskId ? { ...it, done: input.done } : it));
      await db.update(assets).set({ content: { ...content, items }, updatedAt: new Date() }).where(eq(assets.id, row.id));
      return { ok: true };
    }),

  remove: authed.input(z.object({ id: z.number() })).handler(async ({ input, context }) => {
    await ownBusiness(context.user.id, input.id);
    await db.delete(assets).where(eq(assets.businessId, input.id));
    await db.delete(leads).where(eq(leads.businessId, input.id));
    await db.delete(bizTable).where(eq(bizTable.id, input.id));
    return { ok: true };
  }),
};
