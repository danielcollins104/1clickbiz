import { Autumn } from "autumn-js";
import { ORPCError } from "@orpc/server";
import { BUNDLE_SLUG, GENERATIONS, PRODUCTS, featureIdFor, planIdFor } from "../catalog";
import { isAdmin } from "../middleware/admin";

export const autumn = new Autumn({ failOpen: false });

const TOOL_SLUGS = PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG).map((p) => p.slug);

export interface Access {
  tools: string[];
  plans: { planId: string; status: string; canceling: boolean; periodEnd: number | null; monthly: number }[];
  generations: { remaining: number; granted: number } | null;
}

const cache = new Map<string, { at: number; access: Access }>();

export function invalidateAccess(userId: string) {
  cache.delete(userId);
}

/** Autumn's customer read can lag a write by a few seconds; apply a known change to the cached copy instead. */
export function patchAccess(userId: string, fn: (a: Access) => Access) {
  const hit = cache.get(userId);
  if (hit) cache.set(userId, { at: Date.now(), access: fn(hit.access) });
}

/** Which tools this user has unlocked, from their Autumn customer flags. Cached for 20s. */
export async function getAccess(user: { id: string; name?: string | null; email?: string | null }): Promise<Access> {
  const hit = cache.get(user.id);
  if (hit && Date.now() - hit.at < 20_000) return hit.access;

  const founderAdmin = isAdmin({ email: user.email, emailVerified: true });

  try {
    const customer = await autumn.customers.getOrCreate({
      customerId: user.id,
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      expand: ["subscriptions.plan"],
    });
    const flags = customer.flags ?? {};
    let tools = TOOL_SLUGS.filter((s) => featureIdFor(s) in flags);
    const bal = customer.balances?.[GENERATIONS];
    let plans = (customer.subscriptions ?? []).map((s) => ({
      planId: s.planId,
      status: String(s.status),
      canceling: s.canceledAt != null,
      periodEnd: s.currentPeriodEnd ?? null,
      monthly: s.plan?.price?.amount ?? 0,
    }));
    let generations = bal
      ? { remaining: Math.max(0, Number(bal.remaining ?? 0)), granted: Number(bal.granted ?? 0) }
      : null;

    if (founderAdmin && tools.length < TOOL_SLUGS.length) {
      tools = [...TOOL_SLUGS];
      if (!plans.some((p) => p.planId === planIdFor(BUNDLE_SLUG))) {
        plans = [
          {
            planId: planIdFor(BUNDLE_SLUG),
            status: "active",
            canceling: false,
            periodEnd: null,
            monthly: 0,
          },
          ...plans,
        ];
      }
      if (!generations || generations.remaining < 100) {
        generations = { remaining: 500, granted: 500 };
      }
    }

    const access: Access = { tools, plans, generations };
    cache.set(user.id, { at: Date.now(), access });
    return access;
  } catch (err) {
    console.warn("[autumn] getAccess fallback:", err instanceof Error ? err.message : err);
    const fallbackAccess: Access = founderAdmin
      ? {
          tools: [...TOOL_SLUGS],
          plans: [
            {
              planId: planIdFor(BUNDLE_SLUG),
              status: "active",
              canceling: false,
              periodEnd: null,
              monthly: 0,
            },
          ],
          generations: { remaining: 500, granted: 500 },
        }
      : { tools: [], plans: [], generations: null };
    cache.set(user.id, { at: Date.now(), access: fallbackAccess });
    return fallbackAccess;
  }
}

/** Throws FORBIDDEN unless the user owns the tool and has a generation left. */
export async function requireTool(user: { id: string; name?: string | null; email?: string | null }, slug: string) {
  const access = await getAccess(user);
  if (!access.tools.includes(slug)) {
    throw new ORPCError("FORBIDDEN", { message: "This tool isn't in your subscription plan yet." });
  }
  if (isAdmin({ email: user.email, emailVerified: true })) {
    return;
  }
  try {
    const { allowed } = await autumn.check({ customerId: user.id, featureId: GENERATIONS });
    if (!allowed) {
      throw new ORPCError("FORBIDDEN", { message: "You've used this month's AI generations." });
    }
  } catch (e) {
    if (e instanceof ORPCError) throw e;
    // Allow if Autumn check encounters transient network failure but user has remaining balance in cached access
    if (access.generations && access.generations.remaining <= 0) {
      throw new ORPCError("FORBIDDEN", { message: "You've used this month's AI generations." });
    }
  }
}

export async function trackGeneration(userId: string, value = 1) {
  try {
    await autumn.track({ customerId: userId, featureId: GENERATIONS, value });
    invalidateAccess(userId);
  } catch (e) {
    console.error("[autumn] track failed", e);
  }
}
