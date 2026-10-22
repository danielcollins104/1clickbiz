import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Check, Loader2, Lock, ShieldCheck, Trash2, Zap, CreditCard, Star } from "lucide-react";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { ProductArt } from "../components/product-art";
import { BUNDLE_SLUG, PRODUCTS } from "../../api/catalog";
import { errorMessage, useAccess, useCheckout, useSession } from "../queries/business";
import { SubscriptionPlans } from "../components/SubscriptionPlans";

const BUNDLE = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG)!;

export default function CartPage() {
  const { lines, remove, subtotal, add, hasBundle, clear } = useCart();
  const { data: session } = useSession();
  const { data: access } = useAccess();
  const checkout = useCheckout();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  const owned = new Set(access?.tools ?? []);
  const bundleOwned = access?.plans.some((p) => p.planId === "phase_1_launch" && p.status === "active");
  const bundleSaves = !hasBundle && subtotal > BUNDLE.price;

  const subscribe = () => {
    setError(null);
    if (!session) {
      navigate(`/login?next=${encodeURIComponent("/subscribe")}`);
      return;
    }
    checkout.mutate(
      { slugs: lines.map((l) => l.slug) },
      {
        onSuccess: (res) => {
          if (res.url) {
            window.location.href = res.url;
          } else {
            clear();
            navigate("/dashboard?checkout=success");
          }
        },
        onError: (e) => setError(errorMessage(e, "Subscription checkout couldn't start. Try again.")),
      },
    );
  };

  if (lines.length === 0) {
    return (
      <div>
        <div className="mx-auto max-w-[1400px] px-4 pt-12 md:px-8">
          <div className="b3 hard bg-paper p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <span className="chip bg-mint text-ink text-xs font-black">SaaS Subscription Checkout</span>
              <h1 className="display mt-2 text-4xl md:text-6xl">Choose Your Subscription Plan</h1>
              <p className="mt-2 text-base font-bold text-muted max-w-2xl">
                Select a single AI launch engine, a 3-tool stage stack, or unlock all 13 engines with the Phase 1 All-Access Subscription. Cancel or switch plans anytime in 1 click.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-yellow shrink-0 cursor-pointer font-black"
              onClick={() => add(BUNDLE, { open: false })}
            >
              <Zap className="h-4 w-4 fill-ink" /> Select All-Access Pass · {money(BUNDLE.price)}/mo
            </button>
          </div>
        </div>
        <SubscriptionPlans compact />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Active Subscription Selection</p>
          <h1 className="display mt-1 text-5xl md:text-7xl">Your Subscription</h1>
        </div>
        <Link to="/pricing" className="btn btn-sm btn-quiet">
          Change or compare plans <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </Link>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
        <div>
          <ul className="b3 bg-paper">
            {lines.map((l) => {
              const p = PRODUCTS.find((x) => x.slug === l.slug);
              const already = l.slug === BUNDLE_SLUG ? bundleOwned : owned.has(l.slug);
              return (
                <li key={l.key} className="flex gap-4 border-b-[3px] border-ink p-4 last:border-0 md:gap-6 md:p-5">
                  <Link to={`/product/${l.slug}`} className="shrink-0">
                    {p?.image ? (
                      <img src={p.image} alt={l.name} className="b3 h-24 w-24 object-cover md:h-28 md:w-28" />
                    ) : (
                      <ProductArt tone={l.tone} icon={l.icon} num={l.num} size="sm" className="h-24 w-24" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link to={`/product/${l.slug}`}>
                          <p className="display text-xl leading-tight md:text-2xl">{l.name}</p>
                        </Link>
                        <p className="mt-1 text-sm font-semibold text-muted">{p?.tagline}</p>
                      </div>
                      <button type="button" onClick={() => remove(l.key)} aria-label={`Remove ${l.name}`} className="shrink-0 p-1.5 hover:bg-sun">
                        <Trash2 className="h-5 w-5" strokeWidth={2.75} />
                      </button>
                    </div>
                    <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-3">
                      {already ? (
                        <span className="chip bg-mint"><Check className="h-3.5 w-3.5" strokeWidth={4} /> Already in your plan</span>
                      ) : (
                        <span className="text-xs font-extrabold uppercase tracking-wide">Monthly · {l.slug === BUNDLE_SLUG ? "500" : "60"} AI generations</span>
                      )}
                      <span className="display text-2xl">
                        {money(l.price)}
                        <span className="font-sans text-sm normal-case">/mo</span>
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {!hasBundle && subtotal < BUNDLE.price && (
            <div className="b3 hard mt-8 grid items-center gap-4 bg-sun p-5 text-ink sm:grid-cols-[120px_1fr_auto]">
              <img src="/images/bundle-kit.webp" alt="The 13-piece launch kit laid out on blue" className="hidden aspect-square w-full border-[3px] border-ink object-cover sm:block" />
              <div>
                <span className="chip bg-mint text-ink text-xs font-black">All-Access Subscription Upgrade · Save $115/mo</span>
                <p className="display mt-1.5 text-2xl">Upgrade to all 13 engines for {money(BUNDLE.price)}/mo</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  You selected {lines.length} tool{lines.length === 1 ? "" : "s"} ({money(subtotal)}/mo). For just <strong>{money(BUNDLE.price - subtotal)}/mo</strong> more, unlock all 13 Phase 1 engines and 500 AI generations/mo.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-yellow font-black shadow-[4px_4px_0_#000] cursor-pointer"
                onClick={() => {
                  lines.forEach((l) => remove(l.key));
                  add(BUNDLE, { open: false });
                }}
              >
                <Zap className="h-4 w-4 fill-ink" /> Upgrade to All-Access
              </button>
            </div>
          )}

          {bundleSaves && (
            <div className="b3 hard mt-8 grid items-center gap-4 bg-ink p-5 text-sun sm:grid-cols-[120px_1fr_auto]">
              <img src="/images/bundle-kit.webp" alt="The 13-piece launch kit laid out on blue" className="hidden aspect-square w-full border-[3px] border-sun object-cover sm:block" />
              <div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-mint">Save with All-Access Pass</p>
                <p className="display mt-1 text-2xl">All 13 engines for {money(BUNDLE.price)}/mo</p>
                <p className="mt-1 text-sm font-semibold text-cream">
                  Your selected tools total {money(subtotal)}/mo. Switching to the All-Access Subscription saves you {money(subtotal - BUNDLE.price)}/mo and unlocks every engine.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-yellow border-sun font-black shadow-[4px_4px_0_#79e784] cursor-pointer"
                onClick={() => {
                  lines.forEach((l) => remove(l.key));
                  add(BUNDLE, { open: false });
                }}
              >
                Switch to All-Access &amp; Save
              </button>
            </div>
          )}
        </div>

        <aside id="checkout" className="lg:sticky lg:top-24 lg:self-start">
          <div className="b3 hard bg-cream">
            <div className="border-b-[3px] border-ink bg-ink px-5 py-3 text-sm font-extrabold uppercase text-sun">Subscription Summary</div>
            <div className="space-y-3 p-5">
              {lines.map((l) => (
                <div key={l.key} className="flex justify-between gap-4 text-sm font-bold">
                  <span className="min-w-0 truncate">{l.name}</span>
                  <span>{money(l.price)}/mo</span>
                </div>
              ))}
              <div className="flex items-baseline justify-between border-t-[3px] border-ink pt-4">
                <span className="font-extrabold uppercase">Monthly Total</span>
                <span className="display text-4xl">
                  {money(subtotal)}
                  <span className="font-sans text-base normal-case">/mo</span>
                </span>
              </div>
              <div className="bg-mint/40 border-2 border-ink p-2 text-xs font-black text-ink flex items-center justify-between">
                <span>Agency retainer equivalent: ~$2,500+</span>
                <span className="text-emerald-950 bg-mint px-1.5 py-0.5 border border-ink font-black">
                  97% Saved
                </span>
              </div>
              <p className="text-xs font-semibold text-muted">Taxes, if any, are calculated by Stripe before you subscribe.</p>

              <p className="text-xs font-semibold">By subscribing you agree to our <Link to="/terms" className="ulink">Terms</Link> and <Link to="/refunds" className="ulink">Refund policy</Link>. Subscriptions renew monthly until cancelled.</p>

              {error && <p role="alert" className="b3 bg-paper p-3 text-sm font-extrabold">{error}</p>}

              <button
                type="button"
                className="btn btn-yellow w-full text-base font-black shadow-[4px_4px_0_#000] cursor-pointer"
                onClick={subscribe}
                disabled={checkout.isPending}
              >
                {checkout.isPending ? (
                  <><Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Starting subscription…</>
                ) : session ? (
                  <><Zap className="h-5 w-5 fill-ink" strokeWidth={2.5} /> Start Subscription · {money(subtotal)}/mo</>
                ) : (
                  <><Lock className="h-5 w-5" strokeWidth={3} /> Sign in &amp; Start Subscription</>
                )}
              </button>
              <ul className="space-y-1.5 pt-2 text-sm font-bold">
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={3} /> 14-Day 100% Money-Back Guarantee</li>
                <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" strokeWidth={3} /> Secure 256-bit Stripe payment</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" strokeWidth={3} /> Tools unlock as soon as payment clears</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4" strokeWidth={3} /> Cancel anytime from your account</li>
                {(access?.plans.length ?? 0) > 0 && (
                  <li className="flex items-center gap-2"><CreditCard className="h-4 w-4" strokeWidth={3} /> Card on file is charged straight away</li>
                )}
                {hasBundle && access?.plans.some((p) => p.status === "active" && p.planId !== "phase_1_launch") && (
                  <li className="flex items-start gap-2 text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={3} /> Your single-tool plans keep billing until you stop them. One click on your Account page once the bundle is active.</li>
                )}
              </ul>
            </div>
          </div>

          {/* 14-Day Risk-Reversal Guarantee Block */}
          <div className="b3 hard bg-paper border-[3px] border-ink p-4 mt-4 shadow-[4px_4px_0_#000]">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center bg-mint text-ink b3 shrink-0 border border-ink">
                <ShieldCheck className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div>
                <p className="display text-sm">100% Risk-Free Guarantee</p>
                <p className="text-[10px] font-black uppercase text-muted">14-Day No-Questions-Asked Refund</p>
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold leading-relaxed text-ink/90">
              Generate your brand, logo, plan, and website. If it doesn't accelerate your business launch, request a full refund with 1 click in your account.
            </p>
          </div>

          {/* Checkout Social Proof Endorsement */}
          <div className="b3 bg-cream border-2 border-ink p-3.5 mt-3 shadow-[2px_2px_0_#000]">
            <div className="flex text-amber-500 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs font-bold italic text-ink leading-snug">
              "We replaced $4,000 in agency retainers and had our branding and site live in 48 hours."
            </p>
            <p className="text-[10px] font-black uppercase text-muted mt-1.5">
              — Elena R., Verified Founder of TerraCycle
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
