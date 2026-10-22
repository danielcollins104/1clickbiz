import { autumn } from '../lib/autumn';
import { notify, appUrl, emailEnabled } from './email';
/** Checkout-return fallback; shares the activation idempotency key with the webhook. */
export async function billingEmail(user: { id: string; email: string }) {
  if (!emailEnabled()) { console.info('[email skipped] tools unlocked confirmation'); return; }
  try {
    const c = await autumn.customers.get({ customerId: user.id });
    for (const p of c.subscriptions ?? []) {
      if (p.status !== 'active') continue;
      await notify({ to: user.email, title: 'Your tools are unlocked', message: `Your ${p.planId.replace(/_/g, ' ')} plan is active. Review your payment receipt in Stripe.`, url: appUrl(), key: `activation-${user.id}-${p.planId}-${p.startedAt}` });
    }
  } catch (e) { console.error('[billing email]', e); }
}
