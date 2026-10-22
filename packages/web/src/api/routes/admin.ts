import { z } from "zod";
import { and, count, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "../database";
import {
  assets,
  businesses,
  user,
  generationLog,
  supportMessages,
  adminAudit,
} from "../database/schema";
import { adminOnly, isAdmin } from "../middleware/admin";
import { withUser } from "../middleware/auth";
import { autumn, invalidateAccess } from "../lib/autumn";
import { PRODUCTS, planIdFor, GENERATIONS } from "../catalog";
import { signImages } from "../lib/s3";
const choices = PRODUCTS.map((p) => planIdFor(p.slug));
async function customerBilling(id: string) {
  try {
    const c = await autumn.customers.get({
      customerId: id,
      expand: ["subscriptions.plan"],
    });
    const plans = (c.subscriptions ?? [])
      .filter((s) => s.status === "active")
      .map((s) => ({
        id: s.planId,
        name: s.plan?.name ?? s.planId,
        monthly: s.plan?.price?.amount ?? 0,
        canceling: s.canceledAt != null,
        comp: s.plan?.price == null || s.plan.price.amount === 0,
      }));
    const b = c.balances?.[GENERATIONS];
    return {
      plans,
      monthly: plans.reduce((n, p) => n + p.monthly, 0),
      used: Math.max(0, Number(b?.granted ?? 0) - Number(b?.remaining ?? 0)),
      granted: Number(b?.granted ?? 0),
      billingUnavailable: false,
    };
  } catch {
    return {
      plans: [],
      monthly: 0,
      used: 0,
      granted: 0,
      billingUnavailable: true,
    };
  }
}
async function snapshot() {
  const us = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      verified: user.emailVerified,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
  const bs = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      userId: businesses.userId,
    })
    .from(businesses);
  const rows = [];
  for (let i = 0; i < us.length; i += 5) {
    rows.push(
      ...(await Promise.all(
        us.slice(i, i + 5).map(async (u) => ({
          ...u,
          ...(await customerBilling(u.id)),
          businesses: bs.filter((b) => b.userId === u.id),
        })),
      )),
    );
  }
  return rows;
}
type Snapshot = Awaited<ReturnType<typeof snapshot>>;
let cached: { at: number; rows: Snapshot } | undefined;
let loading: Promise<Snapshot> | undefined;
async function getSnapshot() {
  if (cached && Date.now() - cached.at < 60_000) return cached.rows;
  if (!loading)
    loading = snapshot()
      .then((rows) => {
        cached = { at: Date.now(), rows };
        return rows;
      })
      .finally(() => {
        loading = undefined;
      });
  return loading;
}
export const admin = {
  status: withUser.handler(({ context }) => ({
    allowed: isAdmin(context.user),
  })),
  overview: adminOnly.handler(async () => {
    const rows = await getSnapshot();
    const now = Date.now();
    const [errors] = await db.select({ n: count() }).from(generationLog);
    return {
      customers: rows.length,
      mrr: rows.reduce((n, u) => n + u.monthly, 0),
      activeSubscriptions: rows.reduce((n, u) => n + u.plans.length, 0),
      bundles: rows.flatMap((u) => u.plans).filter((p) => p.id === "phase_1_launch").length,
      singles: rows.flatMap((u) => u.plans).filter((p) => p.id.startsWith("tool_")).length,
      new7: rows.filter((u) => +u.createdAt > now - 7 * 86400_000).length,
      new30: rows.filter((u) => +u.createdAt > now - 30 * 86400_000).length,
      errors: errors!.n,
      unavailable: rows.filter((u) => u.billingUnavailable).length,
      sandbox: !process.env.AUTUMN_SECRET_KEY?.startsWith("am_sk_live_"),
      emailReady: !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
      webhookReady: !!process.env.AUTUMN_WEBHOOK_SECRET,
    };
  }),
  customers: adminOnly
    .input(
      z.object({
        search: z.string().max(200).default(""),
        page: z.number().int().min(0).default(0),
      }),
    )
    .handler(async ({ input }) => {
      const rows = (await getSnapshot()).filter((u) =>
        `${u.email} ${u.name}`.toLowerCase().includes(input.search.toLowerCase()),
      );
      return {
        rows: rows.slice(input.page * 20, input.page * 20 + 20),
        total: rows.length,
      };
    }),
  customer: adminOnly.input(z.object({ id: z.string() })).handler(async ({ input }) => {
    const u = (await getSnapshot()).find((u) => u.id === input.id);
    if (!u) throw new ORPCError("NOT_FOUND");
    return {
      ...u,
      errors: await db
        .select()
        .from(generationLog)
        .where(eq(generationLog.userId, input.id))
        .orderBy(desc(generationLog.createdAt))
        .limit(50),
      audit: await db
        .select()
        .from(adminAudit)
        .where(eq(adminAudit.userId, input.id))
        .orderBy(desc(adminAudit.createdAt))
        .limit(30),
    };
  }),
  outputs: adminOnly.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    const biz = await db.query.businesses.findFirst({
      where: eq(businesses.id, input.id),
    });
    if (!biz) throw new ORPCError("NOT_FOUND");
    const rows = await db.select().from(assets).where(eq(assets.businessId, input.id));
    return {
      business: { id: biz.id, name: biz.name },
      assets: await Promise.all(
        rows.map(async (a) => ({
          tool: a.tool,
          content: a.content ? await signImages(a.content) : null,
        })),
      ),
    };
  }),
  errors: adminOnly
    .input(z.object({ page: z.number().int().min(0).default(0) }))
    .handler(async ({ input }) => {
      const [total] = await db.select({ n: count() }).from(generationLog);
      return {
        total: total!.n,
        rows: await db
          .select()
          .from(generationLog)
          .orderBy(desc(generationLog.createdAt))
          .limit(30)
          .offset(input.page * 30),
      };
    }),
  messages: adminOnly.handler(() =>
    db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt)).limit(100),
  ),
  resolve: adminOnly
    .input(z.object({ id: z.number(), resolved: z.boolean() }))
    .handler(async ({ input }) => {
      await db
        .update(supportMessages)
        .set({ resolved: input.resolved })
        .where(eq(supportMessages.id, input.id));
      return { ok: true };
    }),
  comp: adminOnly
    .input(z.object({ userId: z.string(), planId: z.string(), revoke: z.boolean() }))
    .handler(async ({ input, context }) => {
      if (!choices.includes(input.planId)) throw new ORPCError("BAD_REQUEST");
      const u = await db.query.user.findFirst({
        where: eq(user.id, input.userId),
      });
      if (!u) throw new ORPCError("NOT_FOUND");
      const c = await autumn.customers.getOrCreate({
        customerId: u.id,
        email: u.email,
        name: u.name,
        expand: ["subscriptions.plan"],
      });
      const current = (c.subscriptions ?? []).find(
        (p) => p.planId === input.planId && p.status === "active",
      );
      if (
        !input.revoke &&
        input.planId === "phase_1_launch" &&
        (c.subscriptions ?? []).some(
          (p) =>
            p.status === "active" && p.plan && !p.plan.addOn && (p.plan.price?.amount ?? 0) > 0,
        )
      )
        throw new ORPCError("CONFLICT", {
          message: "A paid base plan is active. A free bundle must not replace it.",
        });
      if (current?.plan?.price && current.plan.price.amount > 0)
        throw new ORPCError("CONFLICT", {
          message:
            "This is a paid plan. Manage it in Stripe; comps never change paid subscriptions.",
        });
      if (input.revoke) {
        const grant = await db.query.adminAudit.findFirst({
          where: and(
            eq(adminAudit.userId, u.id),
            eq(adminAudit.planId, input.planId),
            eq(adminAudit.action, "grant"),
          ),
        });
        if (!grant)
          throw new ORPCError("BAD_REQUEST", {
            message: "Only admin-granted free plans can be revoked here.",
          });
        if (current)
          await autumn.billing.update({
            customerId: u.id,
            planId: input.planId,
            cancelAction: "cancel_immediately",
          });
      } else {
        if (current)
          throw new ORPCError("CONFLICT", {
            message: "This plan is already active.",
          });
        const r = await autumn.billing.attach({
          customerId: u.id,
          planId: input.planId,
          customize: { price: null },
          redirectMode: "never",
        });
        if (r.paymentUrl)
          throw new ORPCError("BAD_GATEWAY", {
            message: "Free plan unexpectedly required checkout. Nothing was confirmed.",
          });
      }
      await db.insert(adminAudit).values({
        actor: context.user.email,
        userId: u.id,
        planId: input.planId,
        action: input.revoke ? "revoke" : "grant",
      });
      invalidateAccess(u.id);
      cached = undefined;
      return { ok: true };
    }),
};
