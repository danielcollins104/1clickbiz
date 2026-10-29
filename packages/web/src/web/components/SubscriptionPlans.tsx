import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Crown,
  Layers,
  RefreshCw,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { BUNDLE_SLUG, PRODUCTS, type Product } from "../../api/catalog";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { useAccess, useCheckout, useSession, errorMessage } from "../queries/business";
import { ProductIcon } from "./product-art";

const STAGE_STACKS: {
  id: string;
  label: string;
  tagline: string;
  slugs: string[];
}[] = [
  {
    id: "plan",
    label: "Plan & Validate Stack",
    tagline: "Idea validation, full business plan & grant funding leads.",
    slugs: ["idea-wizard", "business-plan", "funding-finder"],
  },
  {
    id: "brand",
    label: "Brand & Identity Stack",
    tagline: "Company name, brand voice, color palette & vector logos.",
    slugs: ["name-generator", "brand-generator", "logo-generation"],
  },
  {
    id: "market",
    label: "Website & Marketing Stack",
    tagline: "Live hosted website, ad creatives & 2 weeks of social posts.",
    slugs: ["website-generator", "ad-generator", "social-generator"],
  },
  {
    id: "growth",
    label: "Growth & Sales Stack",
    tagline: "Cold outreach sequences, SEO pillar engine & customer CRM.",
    slugs: ["cold-outreach", "seo-engine", "customer-crm"],
  },
];

export function SubscriptionPlans({ compact = false }: { compact?: boolean }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const singleTools = PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG);
  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG)!;

  const [selectedToolSlug, setSelectedToolSlug] = useState<string>(
    singleTools[0]?.slug ?? "idea-wizard"
  );
  const [selectedStackId, setSelectedStackId] = useState<string>("market");
  const [subError, setSubError] = useState<string | null>(null);
  const [startingTier, setStartingTier] = useState<string | null>(null);

  const { add, clear } = useCart();
  const { data: session } = useSession();
  const { data: access } = useAccess();
  const checkout = useCheckout();
  const [, navigate] = useLocation();

  const selectedTool =
    singleTools.find((p) => p.slug === selectedToolSlug) ?? singleTools[0]!;
  const selectedStack =
    STAGE_STACKS.find((s) => s.id === selectedStackId) ?? STAGE_STACKS[0]!;
  const stackProducts = selectedStack.slugs
    .map((slug) => PRODUCTS.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));

  const stackMonthlyPrice = stackProducts.reduce((sum, p) => sum + p.price, 0);
  const separateTotal = singleTools.reduce((sum, p) => sum + p.price, 0);

  const displayPrice = (monthly: number) =>
    billingCycle === "annual" ? Math.round(monthly * 0.8) : monthly;

  const bundleOwned = access?.plans.some(
    (p) => p.planId === "phase_1_launch" && p.status === "active"
  );

  const handleSubscribe = (productsToSubscribe: Product[], tierKey: string) => {
    setSubError(null);
    clear();
    productsToSubscribe.forEach((p) => add(p, { open: false }));

    if (!session) {
      navigate(`/login?next=${encodeURIComponent("/subscribe")}`);
      return;
    }

    setStartingTier(tierKey);
    checkout.mutate(
      { slugs: productsToSubscribe.map((p) => p.slug) },
      {
        onSuccess: (res) => {
          setStartingTier(null);
          if (res.url) {
            window.location.href = res.url;
          } else {
            navigate("/dashboard?checkout=success");
          }
        },
        onError: (e) => {
          setStartingTier(null);
          setSubError(errorMessage(e, "Could not start subscription checkout."));
        },
      }
    );
  };

  return (
    <section
      id="subscription-plans"
      className={`${compact ? "py-10" : "border-b-[3px] border-ink bg-cream py-20"}`}
    >
      <div id="pricing" className="mx-auto max-w-[1400px] px-4 md:px-8">
        {/* Header & Billing Cycle Toggle */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4" strokeWidth={3} /> Invest in Your Own Income Stream · Cancel Anytime
            </p>
            <h2 className="display text-5xl md:text-7xl">
              One subscription. <mark className="bg-mint px-2">Your own income.</mark>
            </h2>
            <p className="mt-3 max-w-2xl text-base font-bold text-muted md:text-lg">
              Landing just <strong>1 paying customer</strong> from your free live website &amp; ad campaigns pays for your membership many times over. Unlock all 13 AI income engines, pick a 3-tool stack, or start with a single engine.
            </p>
          </div>

          {/* Monthly / Annual Toggle */}
          <div className="b3 hard flex items-center bg-paper p-1.5">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`cursor-pointer px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                billingCycle === "monthly"
                  ? "bg-ink text-sun"
                  : "text-ink hover:bg-cream"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`flex cursor-pointer items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wider transition-all ${
                billingCycle === "annual"
                  ? "bg-ink text-sun"
                  : "text-ink hover:bg-cream"
              }`}
            >
              <span>Annual</span>
              <span className="border border-ink bg-mint px-1.5 py-0.5 text-[10px] font-black text-ink">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* High-Conversion Buyer Value Banner */}
        <div className="b3 hard mt-8 bg-ink text-paper p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center bg-sun text-ink border-2 border-sun font-black">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-mint">
                Why 10,000+ Founders Choose All-Access to Build Their Income:
              </p>
              <p className="text-xs sm:text-sm font-bold text-cream mt-0.5">
                You keep <strong>100% of the revenue</strong> your business generates—zero platform commissions, free live website &amp; web app hosting included forever, and a 14-day 100% money-back guarantee.
              </p>
            </div>
          </div>
          <a
            href="#income-freedom-calculator"
            className="bg-sun text-ink px-3.5 py-1.5 text-xs font-black uppercase border-2 border-sun no-underline hover:bg-mint shrink-0"
          >
            Calculate Your Monthly Income ↓
          </a>
        </div>

        {subError && (
          <div
            role="alert"
            className="b3 hard mt-6 border-[3px] border-ink bg-paper p-4 text-sm font-extrabold"
          >
            {subError}
          </div>
        )}

        {/* 3 Subscription Tiers Grid */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {/* Tier 1: Single Engine Subscription */}
          <div className="b3 hard flex flex-col justify-between bg-paper p-6 md:p-8">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-muted">
                  Starter Subscription
                </span>
                <span className="border-2 border-ink bg-cream px-2.5 py-0.5 text-xs font-black uppercase">
                  1 AI Engine
                </span>
              </div>
              <h3 className="display mt-3 text-3xl md:text-4xl">Single Engine Plan</h3>
              <p className="mt-2 text-sm font-semibold text-muted">
                Subscribe to any individual launch tool. Ideal when you only need one specific deliverable right now.
              </p>

              <div className="mt-6 flex items-baseline gap-2 border-y-[3px] border-ink py-4">
                <span className="display text-5xl md:text-6xl">
                  {money(displayPrice(selectedTool.price))}
                </span>
                <div>
                  <span className="font-extrabold">/month</span>
                  {billingCycle === "annual" && (
                    <p className="text-xs font-bold text-muted">
                      Standard {money(selectedTool.price)}/mo billed monthly
                    </p>
                  )}
                </div>
              </div>

              {/* Tool Picker */}
              <div className="mt-5">
                <label
                  htmlFor="single-tool-select"
                  className="block text-xs font-black uppercase tracking-wider text-ink"
                >
                  Choose your AI engine:
                </label>
                <select
                  id="single-tool-select"
                  value={selectedToolSlug}
                  onChange={(e) => setSelectedToolSlug(e.target.value)}
                  className="input mt-2 font-bold text-sm"
                >
                  {singleTools.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      #{t.num} {t.name} ({money(displayPrice(t.price))}/mo)
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex items-center gap-3 border-2 border-ink bg-cream p-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center bg-sun b3">
                    <ProductIcon name={selectedTool.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <Link
                      to={`/product/${selectedTool.slug}`}
                      className="display text-sm hover:underline block truncate"
                    >
                      {selectedTool.name}
                    </Link>
                    <p className="text-xs font-semibold text-muted truncate">
                      {selectedTool.tagline}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2.5 text-sm font-bold">
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  Full access to {selectedTool.name}
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  60 AI generations per month
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  Unlimited edits by typing what to change
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  Upgrade to All-Access anytime in 1 click
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-ink/20">
              <button
                type="button"
                disabled={startingTier === "single"}
                onClick={() => handleSubscribe([selectedTool], "single")}
                className="btn btn-quiet w-full cursor-pointer font-black"
              >
                {startingTier === "single" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> Starting…
                  </>
                ) : (
                  <>
                    Subscribe to {selectedTool.name} <ArrowRight className="h-4 w-4" strokeWidth={3} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tier 2: Phase 1 All-Access Subscription (Featured Center) */}
          <div className="b3 hard relative flex flex-col justify-between bg-ink p-6 text-sun md:p-8 lg:-translate-y-3 shadow-[10px_10px_0px_#79e784]">
            <div className="absolute -top-4 left-6 flex items-center gap-1.5 border-[3px] border-ink bg-mint px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-[3px_3px_0px_#000]">
              <Crown className="h-4 w-4 fill-ink" /> Most Popular · Fastest Path to Income
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-mint">
                  All-Access Income Pass
                </span>
                <span className="border border-sun bg-sun px-2.5 py-0.5 text-xs font-black uppercase text-ink">
                  All 13 Engines
                </span>
              </div>
              <h3 className="display mt-3 text-4xl md:text-5xl text-sun">
                Phase 1 — Complete Launch Pass
              </h3>
              <p className="mt-2 text-sm font-semibold text-cream/90">
                Everything you need to start your own business and create your own income: all 13 AI engines build your idea, plan, name, brand, logo, live website &amp; web app, ads, social posts, funding leads, and CRM automatically.
              </p>

              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-y-[3px] border-sun/40 py-4">
                <div className="flex items-baseline gap-2">
                  <span className="display text-6xl md:text-7xl text-sun">
                    {money(displayPrice(bundle.price))}
                  </span>
                  <div>
                    <span className="font-extrabold text-cream">/month</span>
                    <p className="text-xs font-bold text-mint line-through decoration-2">
                      {money(separateTotal)}/mo separate
                    </p>
                  </div>
                </div>
                <span className="border-2 border-ink bg-mint px-2.5 py-1 text-xs font-black uppercase text-ink">
                  Save {money(separateTotal - bundle.price)}/mo
                </span>
              </div>

              <ul className="mt-6 space-y-3 text-sm font-bold text-cream">
                {[
                  "All 13 Phase 1 AI Launch Engines unlocked",
                  "Generative AI Website & Interactive Web App Studio (Unlimited Iterations)",
                  "Free Hosted Live Business Website (/sites/your-name) + Custom Domain",
                  "Per-Facet Idea Card Approval & Simple Iteration",
                  "Vanguard-X™ Sovereign AI Advisor + Slide-Out Founder Notebook",
                  "Built-in Customer CRM, Grant Finder & 30-Day Ad/Social Suite",
                  "14-Day 100% Money-Back Guarantee · Cancel in 1 Click",
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-mint text-ink b3">
                      <Check className="h-3 w-3" strokeWidth={4} />
                    </span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-sun/30 space-y-3">
              {bundleOwned ? (
                <Link
                  to="/dashboard"
                  className="btn btn-yellow w-full border-sun font-black text-ink"
                >
                  <Check className="h-5 w-5" strokeWidth={3} /> Active Subscription · Open Dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={startingTier === "bundle"}
                  onClick={() => handleSubscribe([bundle], "bundle")}
                  className="btn btn-yellow w-full cursor-pointer border-sun text-base font-black text-ink shadow-[5px_5px_0px_#79e784]"
                >
                  {startingTier === "bundle" ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Starting Subscription…
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 fill-ink" strokeWidth={2.5} /> Start All-Access Subscription · {money(displayPrice(bundle.price))}/mo
                    </>
                  )}
                </button>
              )}
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-cream/80">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-mint" /> 14-day refund guarantee
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <RefreshCw className="h-3.5 w-3.5 text-mint" /> Cancel in 1 click
                </span>
              </div>
            </div>
          </div>

          {/* Tier 3: 3-Engine Stage Stack Subscription */}
          <div className="b3 hard flex flex-col justify-between bg-paper p-6 md:p-8">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-muted">
                  Stage Stack Subscription
                </span>
                <span className="border-2 border-ink bg-sun px-2.5 py-0.5 text-xs font-black uppercase">
                  3 Connected Engines
                </span>
              </div>
              <h3 className="display mt-3 text-3xl md:text-4xl">3-Tool Launch Stack</h3>
              <p className="mt-2 text-sm font-semibold text-muted">
                Subscribe to a focused 3-engine workflow tailored to your current stage of growth.
              </p>

              <div className="mt-6 flex items-baseline gap-2 border-y-[3px] border-ink py-4">
                <span className="display text-5xl md:text-6xl">
                  {money(displayPrice(stackMonthlyPrice))}
                </span>
                <div>
                  <span className="font-extrabold">/month</span>
                  <p className="text-xs font-bold text-muted">
                    3 engines · 180 AI generations/mo
                  </p>
                </div>
              </div>

              {/* Stack Selector */}
              <div className="mt-5">
                <span className="block text-xs font-black uppercase tracking-wider text-ink">
                  Select your 3-engine stack:
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {STAGE_STACKS.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStackId(st.id)}
                      className={`cursor-pointer border-2 border-ink p-2 text-left text-xs font-black transition-all ${
                        selectedStackId === st.id
                          ? "bg-sun text-ink shadow-[2px_2px_0px_#000]"
                          : "bg-cream text-ink hover:bg-paper"
                      }`}
                    >
                      {st.label.replace(" Stack", "")}
                    </button>
                  ))}
                </div>
                <p className="mt-2.5 text-xs font-semibold text-muted">
                  {selectedStack.tagline}
                </p>

                <ul className="mt-3 space-y-2">
                  {stackProducts.map((p) => (
                    <li
                      key={p.slug}
                      className="flex items-center justify-between border-2 border-ink bg-cream px-3 py-2 text-xs font-bold"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <ProductIcon name={p.icon} className="h-4 w-4 shrink-0" />
                        <span className="truncate font-extrabold">{p.name}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px]">
                        {money(displayPrice(p.price))}/mo
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <ul className="mt-5 space-y-2 text-sm font-bold">
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  180 AI generations per month
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center bg-mint b3">
                    <Check className="h-3 w-3" strokeWidth={4} />
                  </span>
                  Shared intake context across all 3 tools
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t-2 border-ink/20">
              <button
                type="button"
                disabled={startingTier === "stack"}
                onClick={() => handleSubscribe(stackProducts, "stack")}
                className="btn w-full cursor-pointer font-black"
              >
                {startingTier === "stack" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> Starting…
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" strokeWidth={3} /> Subscribe to 3-Tool Stack · {money(displayPrice(stackMonthlyPrice))}/mo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
