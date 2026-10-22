import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { base } from "../__core/app";
import { authed } from "../middleware/auth";
import { db } from "../database";
import { assets, businesses, leads } from "../database/schema";
import { signImages } from "../lib/s3";
import { notify, appUrl } from "../services/email";
import { user } from "../database/schema";
import { palette } from "../agent/generators";

/** Simple in-memory rate limit for the public lead form: 5 submissions / 10 min / IP+site. */
const hits = new Map<string, number[]>();
function limited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > 5;
}

export const sites = {
  /** Public: everything needed to render /sites/:slug. */
  get: base.input(z.object({ slug: z.string() })).handler(async ({ input }) => {
    const biz = await db.query.businesses.findFirst({ where: eq(businesses.slug, input.slug) });
    if (!biz) throw new ORPCError("NOT_FOUND", { message: "Site not found" });
    const rows = await db.select().from(assets).where(eq(assets.businessId, biz.id));
    const map = Object.fromEntries(rows.filter((r) => r.content).map((r) => [r.tool, r.content!]));
    if (!map["website-generator"]) throw new ORPCError("NOT_FOUND", { message: "This site hasn't been generated yet." });
    const logo = map["logo-generation"] as { concepts?: { image: { key: string } }[]; chosen?: number } | undefined;
    const chosenLogo = logo?.concepts?.[logo.chosen ?? 0]?.image ?? null;
    const theme = palette({ businessId: biz.id, slug: biz.slug, intake: biz.intake, name: biz.name, assets: map });
    const names = map["name-generator"] as { names?: { tagline: string }[]; chosen?: number } | undefined;
    return {
      name: biz.name,
      tagline: names?.names?.[names.chosen ?? 0]?.tagline ?? "",
      location: biz.intake.location,
      theme,
      logo: chosenLogo ? await signImages(chosenLogo) : null,
      site: await signImages(map["website-generator"]),
    };
  }),

  /** Public: lead form submission from a generated site → lands in that business's CRM. */
  submitLead: base
    .input(
      z.object({
        slug: z.string(),
        name: z.string().trim().min(1).max(120),
        email: z.email().max(200),
        phone: z.string().max(40).optional(),
        message: z.string().max(2000).optional(),
        company: z.string().max(0).optional(), // honeypot — must stay empty
      }),
    )
    .handler(async ({ input, context }) => {
      const ip = context.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
      if (limited(`${ip}:${input.slug}`)) {
        throw new ORPCError("TOO_MANY_REQUESTS", { message: "Too many messages — try again in a few minutes." });
      }
      const biz = await db.query.businesses.findFirst({ where: eq(businesses.slug, input.slug) });
      if (!biz) throw new ORPCError("NOT_FOUND", { message: "Site not found" });
      const [lead] = await db.insert(leads).values({
        businessId: biz.id,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        message: input.message || null,
        source: "website",
      }).returning();
      const owner = await db.query.user.findFirst({ where: eq(user.id, biz.userId) });
      if (owner) await notify({ to: owner.email, title: `New lead for ${biz.name}`, message: `${input.name} (${input.email}) contacted you.
${input.message ?? ""}`, url: appUrl(`/dashboard/customer-crm?b=${biz.id}`), key: `lead-${lead!.id}` });
      return { ok: true };
    }),
};

const STATUS = z.enum(["new", "contacted", "qualified", "won", "lost"]);

async function own(userId: string, businessId: number) {
  const biz = await db.query.businesses.findFirst({
    where: and(eq(businesses.id, businessId), eq(businesses.userId, userId)),
  });
  if (!biz) throw new ORPCError("NOT_FOUND", { message: "Business not found" });
}

export const crm = {
  list: authed.input(z.object({ businessId: z.number() })).handler(async ({ input, context }) => {
    await own(context.user.id, input.businessId);
    return db.select().from(leads).where(eq(leads.businessId, input.businessId)).orderBy(desc(leads.createdAt));
  }),

  add: authed
    .input(
      z.object({
        businessId: z.number(),
        name: z.string().trim().min(1).max(120),
        email: z.email().max(200),
        phone: z.string().max(40).optional(),
        notes: z.string().max(2000).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      await own(context.user.id, input.businessId);
      await db.insert(leads).values({
        businessId: input.businessId,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        notes: input.notes || null,
        source: "manual",
      });
      return { ok: true };
    }),

  update: authed
    .input(
      z.object({
        businessId: z.number(),
        id: z.number(),
        status: STATUS.optional(),
        notes: z.string().max(4000).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      await own(context.user.id, input.businessId);
      const patch: Partial<typeof leads.$inferInsert> = {};
      if (input.status) patch.status = input.status;
      if (input.notes !== undefined) patch.notes = input.notes;
      await db
        .update(leads)
        .set(patch)
        .where(and(eq(leads.id, input.id), eq(leads.businessId, input.businessId)));
      return { ok: true };
    }),

  remove: authed.input(z.object({ businessId: z.number(), id: z.number() })).handler(async ({ input, context }) => {
    await own(context.user.id, input.businessId);
    await db.delete(leads).where(and(eq(leads.id, input.id), eq(leads.businessId, input.businessId)));
    return { ok: true };
  }),
};
