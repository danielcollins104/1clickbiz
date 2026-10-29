import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, Zap, Sparkles, Check, Rocket, Globe, Compass, MessageSquare } from "lucide-react";
import { useProducts } from "../queries/products";
import { CardSkeleton } from "../components/product-card";
import { ProductArt, ProductIcon } from "../components/product-art";
import { Ticker } from "../components/layout";
import { money } from "../lib/format";
import { useCart } from "../lib/cart";
import { QuickStartSection } from "../components/QuickStartSection";
import { SocialProofTicker } from "../components/SocialProofTicker";
import { SocialProof } from "../components/SocialProof";
import { RoiCalculator } from "../components/RoiCalculator";
import { IncomeFreedomCalculator } from "../components/IncomeFreedomCalculator";
import { AboutCreator } from "../components/AboutCreator";
import { SubscriptionPlans } from "../components/SubscriptionPlans";
import { InteractiveDeliverableExplorer } from "../components/InteractiveDeliverableExplorer";
import { PlatformBenefitsHighlight } from "../components/PlatformBenefitsHighlight";
import { useSession } from "../queries/business";

function Hero() {
  const { data } = useProducts();
  const { add, clear } = useCart();
  const [, navigate] = useLocation();
  const { data: session } = useSession();
  const booking = data?.products.find((p) => p.slug === "idea-wizard");
  const bundle = data?.products.find((p) => p.slug === "phase-1-launch");

  const handleSubscribeAllAccess = () => {
    if (bundle) {
      clear();
      add(bundle, { open: false });
      navigate("/subscribe");
    } else {
      navigate("/pricing");
    }
  };

  return (
    <section className="relative overflow-hidden border-b-[3px] border-ink">
      {/* Intuitive 3-Step Value Bar */}
      <div className="border-b-[3px] border-ink bg-cream px-4 py-2.5">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-2 md:gap-5">
            <span className="inline-flex items-center gap-1.5 bg-ink px-2.5 py-1 text-sun">
              <Sparkles className="h-3.5 w-3.5 text-mint" /> Start Here: How This Website Works
            </span>
            <a href="#quick-start-section" className="flex items-center gap-1.5 no-underline text-ink hover:underline">
              <span className="grid h-5 w-5 place-items-center bg-sun border border-ink text-[10px]">1</span>
              Pick a Business Model (or Enter Your Idea)
            </a>
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" strokeWidth={3} />
            <Link to="/dashboard" className="flex items-center gap-1.5 no-underline text-ink hover:underline">
              <span className="grid h-5 w-5 place-items-center bg-mint border border-ink text-[10px]">2</span>
              13 AI Tools Build Your Plan, Brand &amp; Website
            </Link>
            <ArrowRight className="h-3.5 w-3.5 hidden sm:inline" strokeWidth={3} />
            <Link to="/sites/mouth-off" className="flex items-center gap-1.5 no-underline text-ink hover:underline">
              <span className="grid h-5 w-5 place-items-center bg-sun border border-ink text-[10px]">3</span>
              Share Your Free Live Site &amp; Collect Leads
            </Link>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <Link to="/funnel" className="bg-ink text-sun px-2.5 py-1 text-xs font-black uppercase no-underline hover:bg-mint hover:text-ink border border-ink">
              ⚡ Open Automated Sales Funnel →
            </Link>
            <a href="#platform-benefits" className="ulink text-ink">
              6 Key Benefits ↓
            </a>
            <a href="#how-to-start" className="ulink text-ink">
              See 4-Step Guide ↓
            </a>
          </div>
        </div>
      </div>

      {/* headline */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-6 md:px-8 md:pt-8">
        <h1 className="display text-center text-[13.5vw] leading-[0.82] xl:text-[200px]">
          <span className="rise inline-block" style={{ animationDelay: "0.05s" }}>Launch</span>{" "}
          <span className="rise inline-block" style={{ animationDelay: "0.15s" }}>it</span>
        </h1>
      </div>

      <div className="relative">
        {/* ticker behind model */}
        <Ticker
          className="relative z-10 -rotate-1 md:mt-2"
          words={["Idea", "Plan", "Name", "Brand", "Logo", "Website", "Ads", "Social", "Funding", "Customers", "Launched"]}
        />

        {/* stage */}
        <div className="relative mx-auto h-[560px] max-w-[1400px] md:h-[700px]">
          <div className="dots absolute right-6 top-10 hidden h-48 w-48 opacity-30 md:block" />
          <div className="absolute left-1/2 top-24 hidden h-[520px] w-[520px] -translate-x-1/2 rounded-full border-[3px] border-ink md:block" />

          <img
            src="/images/hero-cutout.webp"
            alt="Founder holding a laptop"
            className="rise absolute bottom-0 left-1/2 z-20 h-[calc(100%+70px)] max-w-none -translate-x-1/2 object-contain md:h-[calc(100%+150px)]"
            style={{ animationDelay: "0.35s" }}
          />

          {/* left copy */}
          <div className="rise absolute bottom-8 left-4 z-30 max-w-[340px] md:bottom-14 md:left-8 md:max-w-md" style={{ animationDelay: "0.55s" }}>
            <div className="b3 hard bg-paper p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Own Your Income Today</p>
                <span className="bg-mint px-2 py-0.5 border border-ink text-[10px] font-black uppercase">13 AI Income Engines</span>
              </div>
              <p className="display mt-2 text-2xl md:text-3xl">Build a business that pays you—not a boss.</p>
              <p className="mt-2 hidden text-sm font-semibold text-muted sm:block">
                Ready for real financial independence? Pick a proven business model below or answer 8 quick questions. Our 13 AI engines build your business plan, brand, vector logo, free live website, ads, grants list, and customer CRM in 60 seconds.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  to="/funnel"
                  className="btn btn-sm btn-yellow cursor-pointer font-black"
                >
                  <Rocket className="h-4 w-4 fill-ink" strokeWidth={2.5} /> Start 60s Sales Funnel →
                </Link>
                <a
                  href="#income-freedom-calculator"
                  className="btn btn-sm bg-mint text-ink font-black"
                >
                  Calculate My Income ↓
                </a>
              </div>
            </div>
          </div>

          {/* floating product tags */}
          {booking && (
            <Link
              to={`/product/${booking.slug}`}
              className="rise absolute left-[6%] top-16 z-30 hidden w-48 no-underline md:block lg:left-[12%]"
              style={{ animationDelay: "0.7s" }}
            >
              <div className="b3 hard rotate-[-4deg] bg-paper p-2.5 transition-transform hover:rotate-0">
                <ProductArt tone={booking.tone} icon={booking.icon} num={booking.num} size="sm" className="aspect-[4/3] w-full" />
                <p className="mt-2 text-center text-xs font-extrabold uppercase">Step 01 · Idea Wizard</p>
                <p className="text-center text-[10px] font-bold text-muted">Included in All-Access</p>
              </div>
            </Link>
          )}
          {bundle && (
            <button
              type="button"
              onClick={handleSubscribeAllAccess}
              className="rise absolute bottom-24 right-4 z-30 hidden w-60 text-left no-underline sm:block md:right-8 lg:right-[8%] cursor-pointer"
              style={{ animationDelay: "0.85s" }}
            >
              <div className="b3 hard rotate-[3deg] bg-ink p-4 text-sun transition-transform hover:rotate-0">
                <p className="text-xs font-extrabold uppercase tracking-widest text-mint">Most Popular Plan</p>
                <p className="display mt-1 text-xl">All-Access · 13 Engines</p>
                <p className="mt-1 text-[11px] font-semibold text-cream/80">500 AI gens/mo + Free hosted site</p>
                <div className="mt-2 flex items-end justify-between border-t border-sun/20 pt-2">
                  <span className="display text-3xl">{money(bundle.price)}<span className="font-sans text-xs normal-case">/mo</span></span>
                  <span className="inline-flex items-center gap-1 bg-sun px-2 py-0.5 text-[10px] font-black uppercase text-ink">
                    Subscribe <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* side index */}
          <div className="absolute right-4 top-1/3 z-30 hidden flex-col gap-2 xl:flex">
            <span className="h-10 w-3 bg-ink" />
            <span className="h-3 w-3 bg-ink" />
            <span className="h-3 w-3 bg-ink" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StartHereRoadmap() {
  const steps = [
    {
      num: "STEP 1",
      title: "Pick an Idea or Answer 8 Questions",
      desc: "Don't have a business idea yet? Pick one of our 6 proven models below, or answer 8 simple questions. Once done, go right to Step 2 ➔",
      nextHint: "Leads to Step 2: 13 AI Engines Build Everything ➔",
      actionLabel: "Start Step 1 Below ↓",
      href: "#quick-start-section",
      badge: "Takes 60 seconds",
      bg: "bg-sun",
      icon: Compass,
    },
    {
      num: "STEP 2",
      title: "Let 13 AI Tools Build Your Assets",
      desc: "Your answers automatically build your 5-year plan, company name, brand voice, logo, and ad copy. Approve your favorites, then go to Step 3 ➔",
      nextHint: "Leads to Step 3: Launch Your Free Live Website ➔",
      actionLabel: "Open Step 2 Dashboard →",
      to: "/dashboard",
      badge: "Automated Pipeline",
      bg: "bg-mint",
      icon: Zap,
    },
    {
      num: "STEP 3",
      title: "Publish Your Free Live Website",
      desc: "Open our Generative AI Website & Web App Builder to create, iterate until you love it, and host free! Then move to Step 4 to start earning ➔",
      nextHint: "Leads to Step 4: Collect Customers & Earn Income! ➔",
      actionLabel: "Open Live Website Studio ↗",
      to: "/sites/mouth-off",
      badge: "Free Hosting + SSL",
      bg: "bg-paper",
      icon: Globe,
    },
    {
      num: "STEP 4",
      title: "Get Funding, Leads & Real Income!",
      desc: "Share your live link, collect paying customer inquiries in your CRM, apply to matched grants, and ask Vanguard-X™ how to scale your income daily!",
      nextHint: "🎉 Goal Reached: Financial Independence & Real Income!",
      actionLabel: "Ask Vanguard-X™ Advisor →",
      to: "/advisor",
      badge: "Earn & Scale Daily",
      bg: "bg-cream",
      icon: MessageSquare,
    },
  ];

  return (
    <section id="how-to-start" className="border-b-[3px] border-ink bg-cream py-14 px-4 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-ink text-sun px-3 py-1 text-xs font-black uppercase tracking-widest border border-ink">
              <Sparkles className="h-3.5 w-3.5 text-mint" /> Day 1 of Your Financial Independence · 4 Simple Steps
            </span>
            <h2 className="display mt-3 text-4xl sm:text-5xl md:text-6xl leading-none">
              Your Guided Path to Real Business Income
            </h2>
          </div>
          <p className="max-w-md text-sm font-bold text-ink/85">
            Each step leads directly into the next—no coding or business degree required! Complete these 4 steps in order and you will own a live business ready to bring real income into your life.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.num} className="b3 hard flex flex-col justify-between bg-paper p-5">
                <div>
                  {s.num === "STEP 3" && (
                    <div className="mb-3 border-2 border-ink bg-mint px-2.5 py-2 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] leading-snug">
                      🔥 KEEP GOING — YOUR FINANCIAL INDEPENDENCE IS TAKING SHAPE! Once you complete this step, your business is officially LIVE to bring in real income!
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b-2 border-ink">
                    <span className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-ink ${s.bg}`}>
                      {s.num}
                    </span>
                    <span className="text-[11px] font-extrabold uppercase text-muted">{s.badge}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-2.5">
                    <span className={`grid h-9 w-9 shrink-0 place-items-center border-2 border-ink ${s.bg}`}>
                      <Icon className="h-5 w-5 text-ink" strokeWidth={2.5} />
                    </span>
                    <h3 className="display text-xl leading-tight">{s.title}</h3>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm font-semibold text-ink/80 leading-relaxed">
                    {s.desc}
                  </p>
                  <p className="mt-2.5 text-[11px] font-black text-emerald-800 bg-cream/90 border border-ink/20 px-2 py-1">
                    {s.nextHint}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-dashed border-ink/30">
                  {s.href ? (
                    <a href={s.href} className="btn btn-sm btn-yellow w-full justify-between text-xs font-black">
                      <span>{s.actionLabel}</span>
                    </a>
                  ) : (
                    <Link to={s.to!} className="btn btn-sm btn-quiet w-full justify-between text-xs font-black">
                      <span>{s.actionLabel}</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const STAGES = [
  { cat: "Plan", img: "/images/stage-2.webp", alt: "Notebook with growth charts", title: "Plan it", give: "8 questions about you", tools: ["idea-wizard", "business-plan", "launch-checklist", "funding-finder"] },
  { cat: "Brand", img: "/images/stage-3.webp", alt: "Colour swatches, stamp and pattern cards", title: "Brand it", give: "Pick from shortlists", tools: ["name-generator", "brand-generator", "logo-generation", "color-font-system"] },
  { cat: "Market", img: "/images/cat-market.webp", alt: "Blue megaphone on black", title: "Market it", give: "Review, tweak, publish", tools: ["website-generator", "ad-generator", "social-generator"] },
  { cat: "Run", img: "/images/stage-4.webp", alt: "Founder hanging an open sign", title: "Run it", give: "Ask anything", tools: ["customer-crm", "ai-advisor"] },
];

function Flow() {
  const { data, isLoading } = useProducts();
  const bySlug = new Map((data?.products ?? []).map((p) => [p.slug, p]));
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em]">How Phase 1 builds itself</p>
          <h2 className="display text-6xl md:text-8xl">
            You answer. It <mark className="bg-mint px-2">builds.</mark>
          </h2>
        </div>
        <p className="text-lg font-semibold md:col-span-4">
          Every tool hands its output to the next. Your idea becomes a plan, the plan becomes a brand, the brand
          becomes a website, ads and posts — and every lead lands in your CRM.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-4">
        {STAGES.map((st, i) => (
          <div key={st.cat} className="relative">
            <div className="b3 hard flex h-full flex-col bg-paper">
              <div className={`flex items-center justify-between border-b-[3px] border-ink px-4 py-3 ${i % 2 ? "bg-ink text-sun" : "bg-sun"}`}>
                <span className="display text-2xl">{st.title}</span>
                <span className="display text-xl">0{i + 1}</span>
              </div>
              <div className="aspect-[4/3] overflow-hidden border-b-[3px] border-ink bg-ink">
                <img src={st.img} alt={st.alt} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="border-b-[3px] border-dashed border-ink/30 px-4 py-3">
                <p className="text-xs font-extrabold uppercase tracking-widest">You do</p>
                <p className="font-extrabold">{st.give}</p>
              </div>
              <ul className="flex-1 p-2">
                {isLoading
                  ? st.tools.map((t) => <li key={t}><CardSkeleton className="my-1 h-10" /></li>)
                  : st.tools.map((t) => {
                      const p = bySlug.get(t);
                      if (!p) return null;
                      return (
                        <li key={t}>
                          <Link to={`/product/${p.slug}`} className="group flex items-center gap-3 px-3 py-2.5 no-underline hover:bg-cream transition-colors">
                            <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="sm" className="h-10 w-10 shrink-0 [&_span]:hidden" />
                            <span className="min-w-0 flex-1 text-sm font-black text-ink leading-tight">{p.name}</span>
                            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100" strokeWidth={3} />
                          </Link>
                        </li>
                      );
                    })}
              </ul>
            </div>
            {i < STAGES.length - 1 && (
              <span className="absolute -right-5 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 place-items-center bg-mint b3 md:grid">
                <ArrowRight className="h-4 w-4" strokeWidth={3} />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 grid max-w-3xl grid-cols-3 gap-4">
        {[
          ["13", "AI tools"],
          ["8", "questions"],
          ["1", "brand, used everywhere"],
        ].map(([n, l]) => (
          <div key={l} className="b3 hard bg-paper p-4">
            <p className="display text-2xl md:text-4xl">{n}</p>
            <p className="text-xs font-extrabold uppercase">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Editorial() {
  return (
    <section className="border-t-[3px] border-ink">
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 py-20 md:grid-cols-12 md:px-8">
        <div className="relative md:col-span-5">
          <div className="b3 hard relative aspect-[4/5] overflow-hidden bg-ink">
            <img src="/images/advisor.webp" alt="Founder thinking at a laptop" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="md:col-span-7">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em]">Vanguard-X™ Sovereign AI Advisor + Founder Notebook</p>
          <h2 className="display text-5xl md:text-7xl">An executive co-founder that already read your plan.</h2>
          <p className="mt-4 text-sm sm:text-base font-bold text-ink/80 max-w-xl">
            Ask anything about pricing, closing your first customers, or scaling your income—then <strong>click any paragraph of advice</strong> to save it straight into your slide-out <strong>Founder Notebook</strong>!
          </p>
          <p className="mt-6 text-xs font-extrabold uppercase tracking-widest">Example conversation</p>
          <div className="mt-3 space-y-4">
            {[
              ["You", "What should I charge for my first package to hit $5,000/mo fast?"],
              ["Vanguard-X™", "Your plan prices the starter package at $120 and lists two local competitors charging more. Launch a 'Founding Member' tier at $179/mo—you only need 28 clients to cross $5,000/mo. Click this text to save it to your Founder Notebook, or let me update your website & ads now!"],
            ].map(([who, msg]) => (
              <div key={who} className={`b3 max-w-lg p-4 ${who === "You" ? "bg-paper" : "hard ml-auto bg-ink text-sun"}`}>
                <p className={`text-xs font-extrabold uppercase tracking-widest ${who === "You" ? "" : "text-mint"}`}>{who}</p>
                <p className="mt-1 font-bold">{msg}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/advisor" className="btn btn-yellow">
              Launch Vanguard-X™ Advisor <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
            <Link to="/product/ai-advisor" className="btn btn-quiet">
              Advisor Details
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BundleBlock() {
  const { data } = useProducts();
  const { add, clear } = useCart();
  const [, navigate] = useLocation();
  const bundle = data?.products.find((p) => p.slug === "phase-1-launch");
  const apps = data?.products.filter((p) => p.category !== "Bundle") ?? [];
  const sum = apps.reduce((s, p) => s + p.price, 0);

  return (
    <section className="border-y-[3px] border-ink bg-ink text-sun">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        {/* Top Feature Split */}
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="chip border-sun bg-mint text-ink font-black">
              All-Access Subscription{sum > 0 && bundle ? ` · save ${money(sum - bundle.price)}/mo` : ""}
            </span>
            <h2 className="display mt-4 text-6xl md:text-8xl">13 Engines. One Plan.</h2>
            <p className="mt-4 max-w-md text-lg font-semibold text-cream">
              Subscribe once and unlock all 13 AI launch engines in one connected workspace. Your answers flow automatically from initial idea to live website and customer CRM.
            </p>
            <div className="mt-8 flex items-end gap-4">
              <span className="display text-7xl md:text-8xl">{bundle ? money(bundle.price) : "—"}</span>
              <div className="pb-3">
                <p className="font-bold text-lg">/month · cancel anytime</p>
                {sum > 0 && <p className="font-bold text-mint line-through decoration-[3px] text-sm">{money(sum)}/mo if subscribed separately</p>}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                disabled={!bundle}
                onClick={() => {
                  if (bundle) {
                    clear();
                    add(bundle, { open: false });
                    navigate("/subscribe");
                  }
                }}
                className="btn btn-yellow border-sun cursor-pointer"
                style={{ boxShadow: "6px 6px 0 #79e784" }}
              >
                <Zap className="h-5 w-5" strokeWidth={3} /> Start All-Access Subscription ($99/mo)
              </button>
              <Link to="/product/phase-1-launch" className="btn border-sun" style={{ boxShadow: "6px 6px 0 #3b74ff" }}>
                See Full Plan Specs
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="b3 relative aspect-[16/9] overflow-hidden border-sun shadow-[8px_8px_0px_#3b74ff]">
              <img
                src="/images/bundle-kit.webp"
                alt="Thirteen launch tools laid out on electric blue"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="display absolute left-4 top-4 bg-sun px-3.5 py-1.5 text-xl text-ink b3 border border-ink">
                ALL-ACCESS PASS
              </span>
              <div className="absolute bottom-4 right-4 bg-ink/90 border border-sun px-3 py-1.5 text-xs font-black uppercase text-sun backdrop-blur">
                ⚡ 500 AI Generations / Mo Included
              </div>
            </div>
          </div>
        </div>

        {/* Upgraded 13-Tool Launch Suite Showcase */}
        <div className="mt-16 border-t-2 border-sun/30 pt-12">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-mint flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 fill-mint" /> Complete Ecosystem Included in Your Membership
              </p>
              <h3 className="display text-3xl md:text-5xl text-sun mt-1">
                All 13 Integrated AI Launch Engines
              </h3>
            </div>
            <p className="text-xs font-bold text-cream/80 max-w-md">
              Click any engine below to inspect its sample deliverables or subscribe to it individually.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {apps.map((p) => (
              <Link
                key={p.slug}
                to={`/product/${p.slug}`}
                className="group relative flex flex-col justify-between border-2 border-sun/40 bg-[#141416] p-4 text-sun hover:border-sun hover:bg-[#1f1f23] hover:shadow-[4px_4px_0px_#fde047] hover:-translate-y-1 transition-all no-underline"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 bg-sun text-ink b3 border border-ink grid place-items-center group-hover:scale-105 transition-transform">
                        <ProductIcon name={p.icon} className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="font-mono text-xs font-black text-mint">
                        #{p.num}
                      </span>
                    </div>
                    <span className="border border-sun/40 bg-sun/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sun">
                      {p.category}
                    </span>
                  </div>

                  <h4 className="font-black text-sm uppercase tracking-wide text-sun group-hover:text-mint transition-colors">
                    {p.name.replace("1-Click ", "")}
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-cream/70 line-clamp-2">
                    {p.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-sun/20 flex items-center justify-between text-xs">
                  <span className="text-cream/60 font-bold">
                    Single plan: <span className="text-cream/90">{money(p.price)}/mo</span>
                  </span>
                  <span className="font-black uppercase text-mint flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <Check className="h-3 w-3" strokeWidth={3} /> In All-Access
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Index() {
  return (
    <>
      <Hero />
      <StartHereRoadmap />
      <PlatformBenefitsHighlight />
      <QuickStartSection />
      <IncomeFreedomCalculator />
      <SocialProofTicker />
      <InteractiveDeliverableExplorer />
      <Flow />
      <SubscriptionPlans />
      <Editorial />
      <RoiCalculator />
      <BundleBlock />
      <SocialProof />
      <AboutCreator />
      <Ticker words={["Own your income", "Financial independence", "13 AI engines", "Cancel anytime"]} />
    </>
  );
}
