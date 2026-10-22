import { Resend } from "resend";
import { and, eq, lt } from "drizzle-orm";
import { db } from "../database";
import { notifications } from "../database/schema";
import { emailTemplate } from "./email-templates";
export const emailEnabled = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
export const appUrl = (path = "/dashboard") =>
  `${(process.env.WEBSITE_URL ?? "https://1clickbiz.run.place").replace(/\/$/, "")}${path}`;
/** No provider configuration means no send. Never jeopardize a signup, purchase or lead. */
export async function notify(opts: {
  to: string;
  title: string;
  message: string;
  url?: string;
  action?: string;
  key?: string;
  replyTo?: string;
}) {
  if (!emailEnabled()) {
    console.info(`[email skipped] ${opts.title}`);
    return false;
  }
  if (opts.key) {
    // Recover abandoned claims. Provider idempotency also protects concurrent retries.
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.key, opts.key),
          eq(notifications.status, "sending"),
          lt(notifications.createdAt, new Date(Date.now() - 10 * 60_000)),
        ),
      );
    const [claim] = await db
      .insert(notifications)
      .values({ key: opts.key, status: "sending" })
      .onConflictDoNothing()
      .returning();
    if (!claim) {
      const prior = await db.query.notifications.findFirst({
        where: eq(notifications.key, opts.key),
      });
      return prior?.status === "sent";
    }
  }
  try {
    const res = await new Resend(process.env.RESEND_API_KEY).emails.send(
      {
        from: process.env.EMAIL_FROM!,
        to: opts.to,
        subject: opts.title,
        replyTo: opts.replyTo,
        text: `${opts.message}\n${opts.url ?? ""}`,
        html: emailTemplate(opts.title, opts.message, opts.url, opts.action),
      },
      opts.key ? { idempotencyKey: opts.key } : undefined,
    );
    if (res.error) throw new Error(res.error.message);
    if (opts.key)
      await db.update(notifications).set({ status: "sent" }).where(eq(notifications.key, opts.key));
    return true;
  } catch (e) {
    if (opts.key) await db.delete(notifications).where(eq(notifications.key, opts.key));
    console.error("[email failed]", opts.title, e instanceof Error ? e.message : e);
    return false;
  }
}
