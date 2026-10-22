import { Webhook } from "svix";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { user } from "../database/schema";
import { invalidateAccess } from "../lib/autumn";
import { notify, appUrl } from "../services/email";
const payload = z.object({
  type: z.string(),
  data: z.object({
    customer_id: z.string(),
    plan_changes: z
      .array(
        z.object({
          action: z.string(),
          subscription: z
            .object({
              plan_id: z.string(),
              canceled_at: z.number().nullable().optional(),
              current_period_end: z.number().nullable().optional(),
              started_at: z.number().optional(),
            })
            .optional(),
          previous_attributes: z
            .record(z.string(), z.unknown())
            .nullable()
            .optional(),
        }),
      )
      .default([]),
  }),
});
export async function autumnWebhook(request: Request): Promise<Response> {
  if (!process.env.AUTUMN_WEBHOOK_SECRET)
    return Response.json({ error: "Webhook not configured" }, { status: 503 });
  let event: z.infer<typeof payload>;
  try {
    const headers = {
      "svix-id": request.headers.get("svix-id") ?? "",
      "svix-timestamp": request.headers.get("svix-timestamp") ?? "",
      "svix-signature": request.headers.get("svix-signature") ?? "",
    };
    const body = await request.text();
    new Webhook(process.env.AUTUMN_WEBHOOK_SECRET).verify(body, headers);
    event = payload.parse(JSON.parse(body));
  } catch {
    return Response.json(
      { error: "Invalid signature or event" },
      { status: 400 },
    );
  }
  if (event.type !== "billing.updated") return Response.json({ ok: true });
  invalidateAccess(event.data.customer_id);
  const u = await db.query.user.findFirst({
    where: eq(user.id, event.data.customer_id),
  });
  if (!u) return Response.json({ ok: true });
  for (const change of event.data.plan_changes) {
    const s = change.subscription;
    if (!s) continue;
    if (change.action === "activated") {
      const sent = await notify({
        to: u.email,
        title: "Your tools are unlocked",
        message: `Your ${s.plan_id.replace(/_/g, " ")} plan is active. Review your payment receipt in Stripe.`,
        url: appUrl(),
        key: `activation-${u.id}-${s.plan_id}-${s.started_at ?? request.headers.get("svix-id")}`,
      });
      if (!sent && process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
        return Response.json({ error: "Email retry needed" }, { status: 503 });
    } else if (
      change.action === "expired" ||
      (change.action === "updated" &&
        s.canceled_at &&
        change.previous_attributes &&
        "canceled_at" in change.previous_attributes)
    ) {
      const sent = await notify({
        to: u.email,
        title:
          change.action === "expired"
            ? "Your plan has ended"
            : "Your plan will end",
        message: `Your ${s.plan_id.replace(/_/g, " ")} plan ${change.action === "expired" ? "has ended." : `is cancelled and stays available until ${s.current_period_end ? new Date(s.current_period_end).toLocaleDateString("en-US") : "the end of the paid period"}.`} You can manage your plans from your account.`,
        url: appUrl("/account"),
        key: `cancel-${request.headers.get("svix-id")}-${s.plan_id}`,
      });
      if (!sent && process.env.RESEND_API_KEY && process.env.EMAIL_FROM)
        return Response.json({ error: "Email retry needed" }, { status: 503 });
    }
  }
  return Response.json({ ok: true });
}
