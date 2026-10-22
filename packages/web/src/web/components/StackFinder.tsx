import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Compass, Sparkles, Check, Zap, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import type { Product } from "../../api/catalog";
import { BUNDLE_SLUG, PRODUCTS } from "../../api/catalog";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { ProductArt } from "./product-art";

type BusinessType = "dtc" | "agency" | "local" | "saas";
type GoalType = "idea" | "brand" | "launch" | "turnkey";

interface StackPreset {
  title: string;
  description: string;
  slugs: string[];
  rationale: Record<string, string>;
}

const STACK_PRESETS: Record<`${BusinessType}_${GoalType}`, StackPreset> = {
  // DTC / E-Commerce
  dtc_idea: {
    title: "DTC Idea Validation Stack",
    description: "Validate profitable product concepts, unit economics, and customer positioning.",
    slugs: ["idea-wizard", "business-plan", "name-generator"],
    rationale: {
      "idea-wizard": "Find high-margin niche physical products",
      "business-plan": "Map cost of goods, margins and break-even",
      "name-generator": "Generate memorable consumer retail names",
    },
  },
  dtc_brand: {
    title: "DTC Brand Identity Stack",
    description: "Establish packaging, typography, and cohesive aesthetic across unboxing and social.",
    slugs: ["brand-generator", "color-font-system", "logo-generation"],
    rationale: {
      "brand-generator": "Brand voice that converts browsing shoppers",
      "color-font-system": "High-contrast palette for packaging & web",
      "logo-generation": "Vector logo for labels and favicons",
    },
  },
  dtc_launch: {
    title: "DTC Acquisition & Storefront Stack",
    description: "Publish your product storefront and start acquiring customers from paid ads.",
    slugs: ["website-generator", "ad-generator", "social-generator"],
    rationale: {
      "website-generator": "Mobile-first conversion landing page",
      "ad-generator": "Meta & TikTok ad copy variations",
      "social-generator": "2 weeks of daily lifestyle feed posts",
    },
  },
  dtc_turnkey: {
    title: "Complete DTC Brand Launch Suite",
    description: "Turn your product idea into an active branded business with all 13 tools.",
    slugs: [BUNDLE_SLUG],
    rationale: {
      [BUNDLE_SLUG]: "All 13 launch tools + 500 AI generations/mo",
    },
  },

  // Agency / Consulting
  agency_idea: {
    title: "High-Ticket Service Positioning Stack",
    description: "Define your specialized advisory offer, pricing tiers, and client avatar.",
    slugs: ["idea-wizard", "business-plan", "ai-advisor"],
    rationale: {
      "idea-wizard": "Find underserved B2B niche problems",
      "business-plan": "High-ticket retainer financial projections",
      "ai-advisor": "On-demand executive sparring partner",
    },
  },
  agency_brand: {
    title: "Executive Credibility Stack",
    description: "Build the polished aesthetic required to close $5k+ retainer clients.",
    slugs: ["name-generator", "brand-generator", "logo-generation"],
    rationale: {
      "name-generator": "Authoritative corporate name",
      "brand-generator": "Clear value proposition & elevator pitch",
      "logo-generation": "Minimalist vector monogram",
    },
  },
  agency_launch: {
    title: "Client Pipeline & Lead Gen Stack",
    description: "Launch your client-facing authority site, manage leads, and pitch high-ticket clients.",
    slugs: ["cold-outreach", "website-generator", "customer-crm"],
    rationale: {
      "cold-outreach": "5-step personalized cold outreach & LinkedIn pitch sequence",
      "website-generator": "Authority portfolio site with inquiry form",
      "customer-crm": "Track deal stages and pipeline conversations",
    },
  },
  agency_turnkey: {
    title: "Full Agency Operations Suite",
    description: "From service design to lead capture and contract readiness.",
    slugs: [BUNDLE_SLUG],
    rationale: {
      [BUNDLE_SLUG]: "Every Phase 1 tool + 500 AI generations/mo",
    },
  },

  // Local / Services
  local_idea: {
    title: "Local Market Feasibility Stack",
    description: "Identify high-demand local trade, food, or service gaps in your geography.",
    slugs: ["idea-wizard", "business-plan", "funding-finder"],
    rationale: {
      "idea-wizard": "Pinpoint local service monopolies",
      "business-plan": "Local equipment and staffing projections",
      "funding-finder": "SBA loans and local commercial grant matching",
    },
  },
  local_brand: {
    title: "Local Trust & Signage Stack",
    description: "Visual branding built for work vans, storefront signage, and local ads.",
    slugs: ["name-generator", "color-font-system", "logo-generation"],
    rationale: {
      "name-generator": "Memorable community-first trade name",
      "color-font-system": "High-visibility signage color codes",
      "logo-generation": "Clean logo for apparel and vehicle wraps",
    },
  },
  local_launch: {
    title: "Local Bookings & Inquiries Stack",
    description: "Get found on Google, capture calls, and organize service appointments.",
    slugs: ["website-generator", "customer-crm", "launch-checklist"],
    rationale: {
      "website-generator": "Local booking page with map & click-to-call",
      "customer-crm": "Log repeat customer service records",
      "launch-checklist": "Permits, licenses, and local opening steps",
    },
  },
  local_turnkey: {
    title: "Turnkey Brick-and-Mortar / Trade Suite",
    description: "All 13 launch tools to open your doors and book your calendar.",
    slugs: [BUNDLE_SLUG],
    rationale: {
      [BUNDLE_SLUG]: "Complete Phase 1 Launch + 500 AI generations/mo",
    },
  },

  // SaaS / Tech
  saas_idea: {
    title: "SaaS Problem-Solution & Moat Stack",
    description: "Validate MVP scope, analyze competitors, and build your defensible moat.",
    slugs: ["idea-wizard", "competitor-radar", "business-plan"],
    rationale: {
      "idea-wizard": "B2B SaaS workflow pain points",
      "competitor-radar": "Audit incumbent competitors, pricing weaknesses & gaps",
      "business-plan": "MRR/ARR SaaS economics and CAC/LTV model",
    },
  },
  saas_brand: {
    title: "Developer & Tech Brand Stack",
    description: "Modern dark-mode/light-mode palette, sharp typography, and sleek logo.",
    slugs: ["brand-generator", "color-font-system", "logo-generation"],
    rationale: {
      "brand-generator": "Precise product positioning statement",
      "color-font-system": "Tech palette (monospace and display pairings)",
      "logo-generation": "Sleek geometric app icon & logo",
    },
  },
  saas_launch: {
    title: "Product Waitlist & Organic Inbound Stack",
    description: "High-converting SaaS waitlist landing page, organic SEO, and lead CRM.",
    slugs: ["website-generator", "seo-engine", "customer-crm"],
    rationale: {
      "website-generator": "Feature breakdown & waitlist signup form",
      "seo-engine": "Target high-intent search terms to drive organic founders",
      "customer-crm": "Beta tester onboarding and feedback CRM",
    },
  },
  saas_turnkey: {
    title: "Complete Founder Tech Launch Suite",
    description: "From product idea to funded launch and customer pipeline.",
    slugs: [BUNDLE_SLUG],
    rationale: {
      [BUNDLE_SLUG]: "All 13 Phase 1 tools + 500 AI generations/mo",
    },
  },
};

export function StackFinder() {
  const [isOpen, setIsOpen] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessType>("dtc");
  const [goal, setGoal] = useState<GoalType>("launch");
  const { add } = useCart();
  const [, navigate] = useLocation();

  const currentKey = `${businessType}_${goal}` as const;
  const currentStack = STACK_PRESETS[currentKey] || STACK_PRESETS.dtc_launch;

  const stackProducts = useMemo(() => {
    return currentStack.slugs
      .map((slug) => PRODUCTS.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  }, [currentStack]);

  const totalPrice = stackProducts.reduce((sum, p) => sum + p.price, 0);
  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG);
  const isBundle = currentStack.slugs.includes(BUNDLE_SLUG);

  const handleAddStack = () => {
    stackProducts.forEach((p) => {
      add(p, { open: false });
    });
    navigate("/subscribe");
  };

  return (
    <div className="my-8 b3 hard border-[3px] border-ink bg-paper shadow-[6px_6px_0px_#000]">
      {/* Header bar / accordion toggle */}
      <button
        type="button"
        aria-label="Toggle Launch Stack Finder"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 md:p-5 bg-sun border-b-[3px] border-ink cursor-pointer text-left hover:bg-yellow-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-ink text-sun b3">
            <Compass className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <div>
            <span className="chip bg-mint text-ink text-[10px] font-black uppercase">
              Interactive Tool Selector
            </span>
            <h2 className="display text-xl md:text-2xl mt-0.5 text-ink">
              Not sure which tools you need? Find your 3-Tool Launch Stack
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black uppercase text-ink hidden sm:inline">
            {isOpen ? "Hide Selector" : "Find Your Stack"}
          </span>
          <span className="grid h-8 w-8 place-items-center bg-ink text-sun b3">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </div>
      </button>

      {/* Main Interactive Body */}
      {isOpen && (
        <div className="p-6 md:p-8 space-y-8 bg-paper">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Step 1: Business Type */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted mb-2">
                1. Select What You're Building:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "dtc", label: "E-Commerce / DTC", emoji: "🛍️" },
                  { id: "agency", label: "Agency / Consulting", emoji: "💼" },
                  { id: "local", label: "Local / Trades / Food", emoji: "☕" },
                  { id: "saas", label: "Tech / SaaS / App", emoji: "⚡" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBusinessType(b.id as BusinessType)}
                    className={`p-3 text-left b3 border-2 border-ink text-xs font-black cursor-pointer transition-all ${
                      businessType === b.id
                        ? "bg-ink text-sun shadow-[3px_3px_0px_#79e784]"
                        : "bg-cream text-ink hover:bg-yellow-50"
                    }`}
                  >
                    <span className="text-lg block mb-1">{b.emoji}</span>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Immediate Goal */}
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-muted mb-2">
                2. Select Your Current Stage:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "idea", label: "Idea & Validation", emoji: "💡" },
                  { id: "brand", label: "Branding & Logo", emoji: "🎨" },
                  { id: "launch", label: "Website & Sales", emoji: "🚀" },
                  { id: "turnkey", label: "All 13 Tools (Save)", emoji: "👑" },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id as GoalType)}
                    className={`p-3 text-left b3 border-2 border-ink text-xs font-black cursor-pointer transition-all ${
                      goal === g.id
                        ? "bg-ink text-sun shadow-[3px_3px_0px_#79e784]"
                        : "bg-cream text-ink hover:bg-yellow-50"
                    }`}
                  >
                    <span className="text-lg block mb-1">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Curated Stack Result Box */}
          <div className="border-[3px] border-ink bg-cream p-5 md:p-6 b3 hard">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-4">
              <div>
                <span className="chip bg-mint text-ink text-[11px] font-black">
                  Recommended Configuration
                </span>
                <h3 className="display text-2xl md:text-3xl mt-1.5">{currentStack.title}</h3>
                <p className="text-sm font-bold text-muted mt-0.5">{currentStack.description}</p>
              </div>

              <div className="text-right">
                <span className="display text-3xl md:text-4xl text-ink">
                  {money(totalPrice)}
                  <span className="font-sans text-xs normal-case">/mo</span>
                </span>
                {!isBundle && totalPrice >= 79 && (
                  <p className="text-[11px] font-black text-emerald-800">
                    Bundle saves you ${totalPrice - 79}/mo
                  </p>
                )}
              </div>
            </div>

            {/* Tool Breakdown */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stackProducts.map((p) => (
                <div key={p.slug} className="b3 border-2 border-ink bg-paper p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-10 w-10 shrink-0 overflow-hidden b3 border border-ink">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="sm" className="h-full w-full border-0" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link to={`/product/${p.slug}`} className="hover:underline">
                          <p className="display text-sm truncate">{p.name}</p>
                        </Link>
                        <p className="text-[11px] font-bold text-muted">{money(p.price)}/mo</p>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-ink bg-yellow-50 p-2 border border-ink/30 rounded-xs">
                      ⚡ <em>{currentStack.rationale[p.slug] || p.tagline}</em>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA action bar */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-ink">
              <p className="text-xs font-extrabold text-muted flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ink" />
                Answers flow automatically between these tools so you never type the same thing twice.
              </p>

              <div className="flex flex-wrap gap-3">
                {!isBundle && bundle && (
                  <button
                    type="button"
                    onClick={() => {
                      add(bundle, { open: false });
                      navigate("/subscribe");
                    }}
                    className="btn btn-sm btn-yellow text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    <Zap className="h-4 w-4 fill-ink" />
                    Unlock All 13 Engines ({money(bundle.price)}/mo)
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAddStack}
                  className="btn btn-sm bg-ink text-sun text-xs font-black shadow-[2px_2px_0px_#79e784] flex items-center gap-1.5 cursor-pointer hover:bg-neutral-800"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                  Subscribe to {isBundle ? "All-Access" : "This 3-Tool Stack"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
