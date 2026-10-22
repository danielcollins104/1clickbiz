import { billingEmail } from "../services/billing-email";
import { z } from "zod";
import { ORPCError } from "@orpc/server";
import { authed } from "../middleware/auth";
import { autumn, getAccess, invalidateAccess, patchAccess } from "../lib/autumn";
import { BUNDLE_SLUG, PRODUCTS, planIdFor } from "../catalog";

const origin = (headers: Headers) =>
  headers.get("origin") ?? process.env.WEBSITE_URL ?? "http://localhost:4200";

export const billing = {
  /** Unlocked tools, active plans and remaining AI generations for the signed-in user. */
  access: authed.handler(async ({ context }) => getAccess(context.user)),

  /** Starts Stripe checkout for the cart. Returns a URL to redirect to, or null if nothing to pay. */
  checkout: authed
    .input(z.object({ slugs: z.array(z.string()).min(1).max(20) }))
    .handler(async ({ input, context }) => {
      const valid = new Set(PRODUCTS.map((p) => p.slug));
      const slugs = [...new Set(input.slugs)].filter((s) => valid.has(s));
      if (!slugs.length) throw new ORPCError("BAD_REQUEST", { message: "Your cart is empty." });

      const access = await getAccess(context.user);
      const owned = new Set(access.plans.filter((p) => p.status === "active").map((p) => p.planId));
      const unlocked = new Set(access.tools);
      // Bundle replaces singles; singles already unlocked (e.g. via the bundle) are skipped.
      const wanted = slugs.includes(BUNDLE_SLUG) ? [BUNDLE_SLUG] : slugs.filter((s) => !unlocked.has(s));
      const planIds = wanted.map(planIdFor).filter((id) => !owned.has(id));
      if (!planIds.length) return { url: null, alreadyOwned: true };

      const successUrl = `${origin(context.headers)}/dashboard?checkout=success`;
      invalidateAccess(context.user.id);
      try {
        const res =
          planIds.length === 1
            ? await autumn.billing.attach({ customerId: context.user.id, planId: planIds[0]!, successUrl })
            : await autumn.billing.multiAttach({
                customerId: context.user.id,
                plans: planIds.map((planId) => ({ planId })),
                successUrl,
              });
        return { url: res.paymentUrl, alreadyOwned: false };
      } catch (e) {
        console.error("[billing] checkout failed", e);
        throw new ORPCError("BAD_GATEWAY", {
          message: e instanceof Error ? e.message : "Checkout couldn't start. Try again.",
        });
      }
    }),

  /** Stripe customer portal for managing / cancelling subscriptions. */
  portal: authed.handler(async ({ context }) => {
    const res = await autumn.billing.openCustomerPortal({
      customerId: context.user.id,
      returnUrl: `${origin(context.headers)}/account`,
    });
    return { url: res.url };
  }),

  /** With the bundle active, single-tool plans are redundant: stop them at the end of their paid period. */
  dropSingles: authed.handler(async ({ context }) => {
    const access = await getAccess(context.user);
    const active = access.plans.filter((p) => p.status === "active");
    if (!active.some((p) => p.planId === planIdFor(BUNDLE_SLUG))) {
      throw new ORPCError("BAD_REQUEST", { message: "Your Phase 1 bundle isn't active yet." });
    }
    const singles = active.filter((p) => p.planId.startsWith("tool_") && !p.canceling);
    for (const p of singles) {
      await autumn.billing.update({ customerId: context.user.id, planId: p.planId, cancelAction: "cancel_end_of_cycle" });
    }
    const stopped = new Set(singles.map((p) => p.planId));
    patchAccess(context.user.id, (a) => ({
      ...a,
      plans: a.plans.map((p) => (stopped.has(p.planId) ? { ...p, canceling: true } : p)),
    }));
    return { stopped: singles.length };
  }),

  refresh: authed.handler(async ({ context }) => {
    invalidateAccess(context.user.id);
    const access = await getAccess(context.user);
    await billingEmail(context.user);
    return access;
  }),
};
