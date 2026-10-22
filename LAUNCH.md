# 1 Click Business — launch checklist

## Current state

Launch polish is implemented. On October 6, 2026, the owner approved switching the root configuration to the live Autumn key and setting `WEBSITE_URL=https://1clickbiz.run.place`. Production prices and allowances match the catalog, with no configuration diff.

**Live checkout verified:** after replacing the Autumn key and fixing the connected Stripe restricted-key permissions, the Stripe-hosted bundle checkout displays **$99.00 per month** with no test-mode banner. The app now uses that verified replacement key; its checkout API returns 200 and a hosted Stripe checkout URL. No card was entered or payment submitted; QA customers/logins were removed. Purchase completion, unlock after a real payment and live cancellation have not been exercised.

Resend email and the Autumn webhook remain disabled without credentials. Publishing happens through Runable, not this sandbox. The running preview now uses live configuration; the published deployment has not been updated or verified.

## 1. Administrator access

Sign in with **Google** using `mr.danielbjorke@gmail.com` or `danielcollins104@gmail.com`, then open `/admin`. Only verified allowlisted accounts can access the console. Merely signing up with one of those email addresses does not grant access.

Customers, subscriptions, monthly recurring list-price totals, current generation balances, failures, hosted sites and read-only generated outputs are available. Complimentary grants are audited. Paid plans cannot be converted or revoked through comp controls. Customer lists refresh every minute; billing changes can take a few seconds to propagate.

MRR reflects active subscriptions of registered app users, includes subscriptions ending at period end, excludes free plans, and does not adjust for discounts/tax. It is not cash collected. Historical sandbox subscriptions may have older incorrect prices; use fresh customers for price verification.

## 2. Autumn and Stripe live setup

1. In Autumn, deploy/connect the production environment to your live Stripe account. Finish any Stripe activation requirements.
2. Supply the production Autumn key securely as `AUTUMN_PROD_SECRET_KEY` in the root `.env`. This is a CLI credential, not the application's active billing key.
3. Preview configuration with `bunx atmn push -p`. Inspect every live plan and the diff before applying it. The bundle must produce **$99/month** at checkout; individual prices must match the storefront. This installed Autumn API uses whole-dollar price amounts, verified in sandbox checkout; do not multiply by 100 based on older examples.
4. After approving the pricing diff, apply with `bunx atmn push -p --yes`.
5. **Explicitly approve live charging before replacing `AUTUMN_SECRET_KEY` with the live key.** Preview and local app share the root `.env`; changing that value makes their checkouts live too. No live purchase has been submitted by testing.
6. At the launch switch, set `WEBSITE_URL=https://1clickbiz.run.place`. Restart/redeploy the application so it uses the new configuration.

Never put credentials in chat, source control, or another env file. The root `.env` is the only deployment configuration source.

## 3. Stripe receipts

In the **live** Stripe Dashboard: **Settings → Business → Customer emails → Payments → Successful payments**, turn on receipt emails. Optionally turn on refund emails and failed-payment notices. Check your branding and support details. This setting is not enabled by app code. Stripe's normal automated receipt behavior is live-mode only.

Reference: https://docs.stripe.com/receipts

## 4. Enable the six app emails

1. Verify a sending domain in Resend. The Runable hosting URL is not a domain you own for sending email.
2. Add `RESEND_API_KEY` and a verified `EMAIL_FROM` sender securely to the root `.env`. Both are required. `SUPPORT_EMAIL` is currently `mr.danielbjorke@gmail.com`.
3. In Autumn, add a webhook endpoint for `billing.updated` at `https://1clickbiz.run.place/api/webhooks/autumn`. Add its Svix signing secret as `AUTUMN_WEBHOOK_SECRET`. Use the matching sandbox/live environment.
4. Restart/redeploy and test delivery with accounts you own: welcome, password reset, tools unlocked, first complete business build, new website lead, cancellation/end of access. Test signed webhook delivery/retries in Autumn.

Email templates are implemented but real delivery and email-based password reset still need credentialed testing. Without credentials no app email is sent; contact submissions remain available in the admin console. Google sign-in remains available. Billing access does not depend on email delivery. Failed sends are logged; billing webhook failures ask Autumn to retry. Other transactional failures are best-effort and have no background retry queue. Resend idempotency and DB claims limit duplicates; abandoned sending claims can be reclaimed after ten minutes on a subsequent attempt.

## 5. Publishing and final checks

Use **Publish** in the Runable website preview dashboard to update the published site. Review Terms, Privacy and Refund language for AI Service Hub LLC (Minnesota, USA) with the owner/legal adviser before accepting paying customers. No routine refunds; statutory rights still apply; cancellation retains access through the paid period.

Check the published site after publishing:
- Google sign-in and authorized admin access; non-admin access denied.
- Fresh checkout is live and displays the approved price/currency/renewal interval. Open checkout only unless a real charge has been explicitly authorized.
- Purchase return, plan unlock, billing portal and period-end cancellation.
- Inline checklist progress/dismissal; no popup tour.
- Hosted site `/sites/mouth-off` and lead form.
- Terms, Privacy, Refund, Contact, mobile layout and footer links.
- Each email and signed webhook with real provider credentials.

The contact form has a basic per-process rate limit and honeypot, not a distributed abuse prevention system. The error feed records business-tool generation failures, not advisor-chat failures. Usage metrics show current provider balances, not historical daily usage.