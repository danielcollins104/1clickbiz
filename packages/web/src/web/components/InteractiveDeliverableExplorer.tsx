import { useState } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Globe,
  Palette,
  FileText,
  Megaphone,
  Users,
  Copy,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";

interface DemoBusiness {
  id: string;
  presetId: string;
  label: string;
  brandName: string;
  slug: string;
  tagline: string;
  category: string;
  plan: {
    summary: string;
    targetCustomer: string;
    avgTicket: number;
    monthlyTargetSales: number;
    startupBudget: string;
    timeToFirstSale: string;
    topGrant: { name: string; amount: string; deadline: string };
  };
  brand: {
    mission: string;
    voice: string[];
    colors: { name: string; hex: string }[];
    headingFont: string;
    bodyFont: string;
    slogans: string[];
  };
  market: {
    heroHeadline: string;
    heroSubhead: string;
    ctaText: string;
    services: { title: string; price: string; desc: string }[];
    adHook: string;
    adBody: string;
    socialPost: string;
  };
  run: {
    leads: { name: string; inquiry: string; value: string; status: string }[];
    advisorTip: string;
    checklistDone: number;
    checklistTotal: number;
  };
}

const DEMO_BUSINESSES: DemoBusiness[] = [
  {
    id: "ai-agency",
    presetId: "ai-agency",
    label: "AI Automation Agency",
    brandName: "SignalStack AI",
    slug: "signalstack-ai",
    tagline: "Done-for-you AI lead capture & workflow automation for local service businesses.",
    category: "B2B Agency",
    plan: {
      summary:
        "SignalStack AI installs 24/7 SMS/web lead-response agents and automated appointment booking for local dental practices, HVAC companies, and home remodelers.",
      targetCustomer: "Local service owners ($300k–$2M revenue) losing leads to slow callbacks",
      avgTicket: 1500,
      monthlyTargetSales: 6,
      startupBudget: "$500",
      timeToFirstSale: "7 days",
      topGrant: {
        name: "State Small Business Digital Innovation Micro-Grant",
        amount: "$10,000",
        deadline: "Rolling",
      },
    },
    brand: {
      mission: "Eliminate missed customer calls so local businesses never lose a job to voicemail.",
      voice: ["Direct", "ROI-Focused", "Executive", "Zero-Jargon"],
      colors: [
        { name: "Obsidian Ink", hex: "#111111" },
        { name: "Electric Mint", hex: "#79E784" },
        { name: "Signal Sun", hex: "#FDE047" },
        { name: "Warm Paper", hex: "#FAF7F0" },
      ],
      headingFont: "Bricolage Grotesque",
      bodyFont: "Plus Jakarta Sans",
      slogans: [
        "Every Lead Answered in 8 Seconds.",
        "Turn Missed Calls Into Booked Jobs Automatically.",
        "Your 24/7 AI Front Desk.",
      ],
    },
    market: {
      heroHeadline: "Never Lose Another High-Ticket Job to Voicemail.",
      heroSubhead:
        "We install custom AI intake & booking systems that reply to your web and phone inquiries in under 10 seconds—24/7.",
      ctaText: "Book Your Free 15-Min Pipeline Audit",
      services: [
        {
          title: "24/7 Instant SMS & Web Lead Responder",
          price: "$950/mo",
          desc: "Qualifies inquiries and books directly onto your calendar.",
        },
        {
          title: "Full CRM & Past-Customer Reactivation",
          price: "$1,500/mo",
          desc: "Automated follow-ups, review requests, and repeat bookings.",
        },
        {
          title: "Custom Voice + Multi-Location Suite",
          price: "$2,500/mo",
          desc: "Complete AI dispatch and multi-crew routing.",
        },
      ],
      adHook: "Local Contractors: How many $2,000+ jobs went to a competitor last week because you were on a roof when they called?",
      adBody:
        "SignalStack AI replies to every missed call and web form in 8 seconds, qualifies the homeowner, and books the estimate on your calendar.",
      socialPost:
        "Case study: We turned 412 dead leads in a local HVAC CRM into $18,400 in booked seasonal tune-ups in 72 hours—with zero ad spend.",
    },
    run: {
      leads: [
        { name: "Apex Heating & Air", inquiry: "Wants 24/7 missed-call text back + booking", value: "$1,500/mo", status: "Call Booked" },
        { name: "BrightSmile Dental", inquiry: "Patient reactivation + web chat intake", value: "$1,500/mo", status: "Proposal Sent" },
        { name: "Summit Roofing Co.", inquiry: "Storm season lead qualifier", value: "$2,500/mo", status: "Won · Active" },
      ],
      advisorTip:
        "Your highest-converting offer is the 'Past-Customer Reactivation Sprint'. Offer a 7-day free reactivation test to 10 local HVAC owners this week—it requires zero ad spend for them and proves ROI in 48 hours.",
      checklistDone: 11,
      checklistTotal: 14,
    },
  },
  {
    id: "artisan-bakery",
    presetId: "artisan-bakery",
    label: "Artisan Bakery & Subscription",
    brandName: "Hearth & Crumb",
    slug: "hearth-and-crumb",
    tagline: "Small-batch organic sourdough boxes delivered warm to your porch every Friday.",
    category: "Local Food & Subscription",
    plan: {
      summary:
        "A neighborhood micro-bakery operating on a pre-paid weekly bread box subscription model plus high-margin corporate morning catering.",
      targetCustomer: "Local families, remote professionals, and boutique offices within 8 miles",
      avgTicket: 48,
      monthlyTargetSales: 140,
      startupBudget: "$1,800",
      timeToFirstSale: "5 days",
      topGrant: {
        name: "USDA Value-Added Producer & Local Food Micro-Grant",
        amount: "$15,000",
        deadline: "Quarterly",
      },
    },
    brand: {
      mission: "Bring slow-fermented, organic neighborhood bread back to the family table.",
      voice: ["Warm", "Artisanal", "Community-First", "Sensory"],
      colors: [
        { name: "Crust Espresso", hex: "#2C1E16" },
        { name: "Golden Crumb", hex: "#F5C26B" },
        { name: "Sage Herb", hex: "#84B59F" },
        { name: "Flour Linen", hex: "#FDFBF7" },
      ],
      headingFont: "Fraunces",
      bodyFont: "DM Sans",
      slogans: [
        "36-Hour Ferment. Delivered Warm Every Friday.",
        "Real Flour, Water, Salt & Time.",
        "Your Neighborhood Bread Club.",
      ],
    },
    market: {
      heroHeadline: "Warm Organic Sourdough on Your Porch Every Friday Morning.",
      heroSubhead:
        "Join 120+ local households in our weekly bake club. Naturally leavened for 36 hours using stone-milled organic grain.",
      ctaText: "Reserve Your Friday Bread Box",
      services: [
        {
          title: "Weekly Porch Bread Club",
          price: "$48/mo",
          desc: "1 signature country loaf + rotating seasonal bake every Friday.",
        },
        {
          title: "Family Feast Subscription",
          price: "$84/mo",
          desc: "2 loaves + cultured butter + 4 laminated morning pastries.",
        },
        {
          title: "Office Morning Pastry Crate",
          price: "$145/box",
          desc: "Serves 15–20 with warm sourdough croissants & seasonal jam.",
        },
      ],
      adHook: "Why does supermarket bread have 19 ingredients when real sourdough only needs 3?",
      adBody:
        "Our Friday bake club is opening 25 new neighborhood spots this week. Naturally fermented for 36 hours and delivered warm to your door.",
      socialPost:
        "6:00 AM oven pull: Country boules, rosemary sea-salt focaccia, and brown-butter cardamom knots heading out to our Friday subscribers!",
    },
    run: {
      leads: [
        { name: "Sarah Jenkins", inquiry: "Family Feast Subscription (Maple St.)", value: "$84/mo", status: "Subscribed" },
        { name: "Studio North Architecture", inquiry: "Weekly Friday Office Pastry Crate", value: "$580/mo", status: "Active Account" },
        { name: "Marcus Vance", inquiry: "Weekly Porch Bread Club", value: "$48/mo", status: "Subscribed" },
      ],
      advisorTip:
        "Because 100% of your loaves are pre-sold via subscription by Wednesday night, your food waste is 0%. Pitch 5 local real estate agents on gifting your '$48 Bread Club' as a closing gift to new homeowners.",
      checklistDone: 13,
      checklistTotal: 14,
    },
  },
  {
    id: "eco-dtc",
    presetId: "eco-dtc",
    label: "Eco-Friendly E-Commerce",
    brandName: "Verdant Refill",
    slug: "verdant-refill",
    tagline: "Zero-waste concentrated home & personal care essentials in forever glass bottles.",
    category: "DTC E-Commerce",
    plan: {
      summary:
        "Direct-to-consumer refillable home cleaning and botanical hand soap tablets paired with weighty architectural glass dispensers.",
      targetCustomer: "Design-conscious, eco-minded households seeking plastic-free daily essentials",
      avgTicket: 64,
      monthlyTargetSales: 110,
      startupBudget: "$1,500",
      timeToFirstSale: "10 days",
      topGrant: {
        name: "Circular Economy & Sustainable Packaging Founder Award",
        amount: "$12,500",
        deadline: "Rolling",
      },
    },
    brand: {
      mission: "Eliminate single-use plastic bottles without compromising modern countertop design.",
      voice: ["Minimalist", "Clean", "Transparent", "Modern"],
      colors: [
        { name: "Deep Botanical", hex: "#14281D" },
        { name: "Eucalyptus Mint", hex: "#79E784" },
        { name: "Amber Glass", hex: "#EAB308" },
        { name: "Raw Alabaster", hex: "#F8F7F4" },
      ],
      headingFont: "Outfit",
      bodyFont: "Plus Jakarta Sans",
      slogans: [
        "Stop Shipping Water. Start Refilling Forever.",
        "Architectural Glass. Botanical Concentrates.",
        "Zero Plastic. 100% Countertop Worthy.",
      ],
    },
    market: {
      heroHeadline: "The Last Soap Bottle You Will Ever Buy.",
      heroSubhead:
        "Architectural amber glass dispensers paired with plant-powered dissolve tablets. Save 18 plastic bottles a year.",
      ctaText: "Build Your Starter Kit (20% Off)",
      services: [
        {
          title: "The Countertop Starter Ritual",
          price: "$64",
          desc: "3 weighted glass bottles + 6 months of botanical refill tablets.",
        },
        {
          title: "Quarterly Refill Drop",
          price: "$29/qtr",
          desc: "Compostable pouch of 12 concentrated tablets shipped free.",
        },
        {
          title: "Whole-Home Zero-Waste Bundle",
          price: "$112",
          desc: "Kitchen, bath, glass, and laundry concentrates.",
        },
      ],
      adHook: "91% of liquid soap is just water shipped in single-use plastic.",
      adBody:
        "Switch to Verdant Refill: weighted amber glass dispensers + plant-derived tablets. Just add warm tap water.",
      socialPost:
        "3,400 single-use plastic bottles kept out of landfills this month by our founding subscribers.",
    },
    run: {
      leads: [
        { name: "Chloe & Liam T.", inquiry: "Whole-Home Zero-Waste Bundle + Refill Sub", value: "$112", status: "Fulfilled" },
        { name: "The Haven Boutique Hotel", inquiry: "Wholesale inquiry for 24 guest suites", value: "$1,850", status: "Sample Shipped" },
        { name: "Elena Rostova", inquiry: "Countertop Starter Ritual", value: "$64", status: "Fulfilled" },
      ],
      advisorTip:
        "Your unit economics jump 3.4x when customers opt into the Quarterly Refill Drop at checkout. Default the starter kit toggle to 'Subscribe & Save 15%'.",
      checklistDone: 12,
      checklistTotal: 14,
    },
  },
  {
    id: "home-services",
    presetId: "home-services",
    label: "Local Home Maintenance",
    brandName: "SteadyHome Pro",
    slug: "steadyhome-pro",
    tagline: "Subscription preventative home maintenance & vetted 24-hour handyman dispatch.",
    category: "Local Trade & Services",
    plan: {
      summary:
        "Recurring residential home care membership covering seasonal gutter, HVAC filter, dryer vent, and minor electrical/plumbing fixes.",
      targetCustomer: "Busy suburban homeowners & small rental property owners",
      avgTicket: 129,
      monthlyTargetSales: 55,
      startupBudget: "$800",
      timeToFirstSale: "4 days",
      topGrant: {
        name: "Local Workforce & Skilled Trades Entrepreneurship Grant",
        amount: "$8,500",
        deadline: "Rolling",
      },
    },
    brand: {
      mission: "Give homeowners one trusted pro on speed-dial so small repairs never turn into $5,000 emergencies.",
      voice: ["Dependable", "Neighborly", "Clear", "Punctual"],
      colors: [
        { name: "Blueprint Navy", hex: "#0F172A" },
        { name: "Safety Sun", hex: "#FDE047" },
        { name: "Trust Emerald", hex: "#79E784" },
        { name: "Crisp White", hex: "#FFFFFF" },
      ],
      headingFont: "Archivo",
      bodyFont: "Public Sans",
      slogans: [
        "Your Home's Dedicated Maintenance Partner.",
        "One Monthly Plan. Zero Honey-Do List.",
        "On Time, Vetted, Guaranteed.",
      ],
    },
    market: {
      heroHeadline: "Cross Off Your Entire Home Repair List in One Visit.",
      heroSubhead:
        "Quarterly 22-point preventative home tune-ups plus priority handyman booking with upfront pricing.",
      ctaText: "Book Your $79 First Home Tune-Up",
      services: [
        {
          title: "Homeowner Peace-of-Mind Club",
          price: "$99/mo",
          desc: "Seasonal 22-point maintenance visit + 2 hours of priority repairs.",
        },
        {
          title: "Half-Day Punch-List Blitz",
          price: "$349",
          desc: "4 hours with a master tech to knock out fixtures, drywall & doors.",
        },
        {
          title: "Landlord Turnkey Care",
          price: "$179/mo",
          desc: "Tenant repair triage + seasonal inspection report with photos.",
        },
      ],
      adHook: "Tired of calling 6 contractors just to get 3 small repairs done?",
      adBody:
        "SteadyHome Pro sends a vetted, background-checked master tech on your schedule—backed by our 100% workmanship guarantee.",
      socialPost:
        "Before & after from today's 4-hour Punch-List Blitz: 3 ceiling fans installed, gutter guard repair, and smart thermostat setup.",
    },
    run: {
      leads: [
        { name: "David & Priya K.", inquiry: "Half-Day Punch-List Blitz + Monthly Plan", value: "$349 + $99/mo", status: "Scheduled" },
        { name: "Oakridge Property Mgmt", inquiry: "6 rental units on Landlord Care", value: "$1,074/mo", status: "Contract Signed" },
        { name: "process@millerfamily.com", inquiry: "Homeowner Peace-of-Mind Club", value: "$99/mo", status: "Active" },
      ],
      advisorTip:
        "Use the Half-Day Punch-List Blitz ($349) as your front-end offer, then waive $100 off their bill if they join the $99/mo Peace-of-Mind Club before the technician leaves.",
      checklistDone: 12,
      checklistTotal: 14,
    },
  },
];

const STAGES = [
  { id: "plan", num: "01", label: "Plan & Validate", sub: "Idea, Plan, Unit Economics & Grants", icon: FileText },
  { id: "brand", num: "02", label: "Brand & Identity", sub: "Name, Voice, Colors & Logo", icon: Palette },
  { id: "market", num: "03", label: "Website & Marketing", sub: "Hosted Site, Ads & Social Calendar", icon: Megaphone },
  { id: "run", num: "04", label: "Run & Scale", sub: "Customer CRM, Checklist & AI Advisor", icon: Users },
] as const;

export function InteractiveDeliverableExplorer() {
  const [selectedBizId, setSelectedBizId] = useState<string>(DEMO_BUSINESSES[0]!.id);
  const [activeStage, setActiveStage] = useState<"plan" | "brand" | "market" | "run">("plan");
  const [customBrandOverride, setCustomBrandOverride] = useState<string>("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Interactive unit economics sliders in Stage 1 so visitors get hands-on value
  const biz = DEMO_BUSINESSES.find((b) => b.id === selectedBizId) ?? DEMO_BUSINESSES[0]!;
  const [priceOverride, setPriceOverride] = useState<number | null>(null);
  const [salesOverride, setSalesOverride] = useState<number | null>(null);

  const { openQuickStart } = useQuickStart();

  const activeBrandName = customBrandOverride.trim() || biz.brandName;
  const activeSlug = customBrandOverride.trim()
    ? customBrandOverride.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")
    : biz.slug;

  const unitPrice = priceOverride ?? biz.plan.avgTicket;
  const monthlySales = salesOverride ?? biz.plan.monthlyTargetSales;
  const projectedMrr = unitPrice * monthlySales;
  const projectedArr = projectedMrr * 12;

  const handleSelectBiz = (id: string) => {
    setSelectedBizId(id);
    setPriceOverride(null);
    setSalesOverride(null);
  };

  const handleCopyBlueprint = () => {
    const summaryText = [
      `1 CLICK BUSINESS — LAUNCH BLUEPRINT: ${activeBrandName.toUpperCase()}`,
      `Tagline: ${biz.tagline}`,
      `Executive Summary: ${biz.plan.summary}`,
      `Target Customer: ${biz.plan.targetCustomer}`,
      `Projected Monthly Revenue: $${projectedMrr.toLocaleString()}/mo ($${unitPrice} avg x ${monthlySales} sales/mo)`,
      `Top Funding Lead: ${biz.plan.topGrant.name} (${biz.plan.topGrant.amount})`,
      `Brand Palette: ${biz.brand.colors.map((c) => `${c.name} (${c.hex})`).join(", ")}`,
      `Website Headline: ${biz.market.heroHeadline}`,
      `Live Hosted URL: https://1clickbiz.run.place/sites/${activeSlug}`,
    ].join("\n");

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    });
  };

  return (
    <section id="interactive-demo" className="border-b-[3px] border-ink bg-paper py-20">
      <div id="live-preview" className="mx-auto max-w-[1400px] px-4 md:px-8">
        {/* Section Header */}
        <div className="mb-5"><img src="/images/you-get-red.svg" alt="You get:" className="h-20 sm:h-24 md:h-28 w-auto select-none" /></div>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em]">
              <Eye className="h-4 w-4" strokeWidth={3} /> Interactive Deliverable Explorer · See What You Get
            </p>
            <h2 className="display text-4xl sm:text-5xl md:text-6xl leading-[1.15]">
              Inspect a <span className="inline-block bg-sun px-2.5 py-0.5 border-2 border-ink my-1">complete build</span> before you subscribe.
            </h2>
            <p className="mt-3 max-w-2xl text-base font-bold text-muted md:text-lg">
              Pick a business example below (or type your own brand name) and click through all 4 stages to see how the 13 AI engines connect your plan, brand, live website, and CRM.
            </p>
          </div>

          {/* Custom Brand Name Live Preview Input */}
          <div className="b3 hard bg-cream p-3.5 sm:min-w-[340px]">
            <label
              htmlFor="explorer-brand-override"
              className="block text-[11px] font-black uppercase tracking-wider text-ink"
            >
              ⚡ Personalize this preview with your brand name:
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="explorer-brand-override"
                type="text"
                value={customBrandOverride}
                onChange={(e) => setCustomBrandOverride(e.target.value)}
                placeholder={`e.g. ${biz.brandName}`}
                className="input !py-1.5 text-sm font-bold bg-paper"
              />
              {customBrandOverride && (
                <button
                  type="button"
                  onClick={() => setCustomBrandOverride("")}
                  className="btn btn-sm btn-quiet text-xs"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 1: Pick a Business Example Bar */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5 border-b-[3px] border-ink pb-5">
          <span className="text-xs font-black uppercase tracking-wider text-muted mr-2">
            1. Choose Example Business:
          </span>
          {DEMO_BUSINESSES.map((b) => {
            const active = b.id === selectedBizId;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBiz(b.id)}
                className={`cursor-pointer border-[2.5px] border-ink px-4 py-2 text-xs font-black uppercase tracking-wide transition-all ${
                  active
                    ? "bg-ink text-sun shadow-[3px_3px_0px_#79e784] -translate-y-0.5"
                    : "bg-cream text-ink hover:bg-sun"
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>

        {/* Step 2: 4-Stage Interactive Pipeline Tabs */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STAGES.map((st) => {
            const Icon = st.icon;
            const isActive = activeStage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStage(st.id)}
                className={`b3 cursor-pointer p-4 text-left transition-all ${
                  isActive
                    ? "bg-sun text-ink shadow-[5px_5px_0px_#000] -translate-y-0.5"
                    : "bg-cream text-ink hover:bg-paper"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="display text-2xl">{st.num}. {st.label}</span>
                  <span className={`grid h-8 w-8 place-items-center b3 ${isActive ? "bg-ink text-sun" : "bg-paper text-ink"}`}>
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-ink/80">{st.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Step 3: Live Deliverable Canvas */}
        <div className="b3 hard mt-6 bg-cream p-6 md:p-8">
          {/* Top Bar inside Canvas */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-muted">
                <span>{biz.category}</span>
                <span aria-hidden="true">·</span>
                <span>Startup Budget: {biz.plan.startupBudget}</span>
                <span aria-hidden="true">·</span>
                <span>Time to First Sale: {biz.plan.timeToFirstSale}</span>
              </div>
              <h3 className="display mt-1 text-3xl md:text-5xl text-ink">
                {activeBrandName}
              </h3>
              <p className="mt-1 text-sm font-bold text-ink/80">{biz.tagline}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyBlueprint}
                className="btn btn-sm btn-quiet cursor-pointer text-xs font-black"
              >
                {copiedSummary ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" strokeWidth={3} /> Copied Blueprint!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" strokeWidth={2.5} /> Copy Free Summary
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => openQuickStart(biz.presetId)}
                className="btn btn-sm btn-yellow cursor-pointer text-xs font-black shadow-[3px_3px_0px_#000]"
              >
                <Zap className="h-4 w-4 fill-ink" strokeWidth={2.5} /> Customize &amp; Launch This Blueprint
              </button>
            </div>
          </div>

          {/* STAGE 01: PLAN & VALIDATE */}
          {activeStage === "plan" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Engine #01 &amp; #04 · Idea Wizard + Executive Business Plan
                  </p>
                  <h4 className="display mt-2 text-2xl">Executive Summary</h4>
                  <p className="mt-2 font-semibold leading-relaxed text-ink">
                    {biz.plan.summary}
                  </p>
                  <div className="mt-4 border-t-2 border-dashed border-ink/20 pt-3">
                    <p className="text-xs font-black uppercase text-muted">Target Customer Profile</p>
                    <p className="mt-1 text-sm font-bold">{biz.plan.targetCustomer}</p>
                  </div>
                </div>

                <div className="b3 bg-mint/40 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-ink">
                      Engine #10 · Funding &amp; Grants Finder Match
                    </p>
                    <span className="border border-ink bg-mint px-2 py-0.5 text-xs font-black">
                      {biz.plan.topGrant.amount} Grant Match
                    </span>
                  </div>
                  <h4 className="display mt-2 text-xl">{biz.plan.topGrant.name}</h4>
                  <p className="mt-1 text-xs font-bold text-ink/80">
                    Deadline: {biz.plan.topGrant.deadline} · Matched automatically to your industry and location.
                  </p>
                </div>
              </div>

              {/* Interactive Revenue & Unit Economics Simulator */}
              <div className="b3 hard bg-ink p-6 text-sun lg:col-span-5">
                <p className="text-xs font-black uppercase tracking-widest text-mint">
                  Interactive Unit Economics Simulator
                </p>
                <h4 className="display mt-1 text-2xl text-sun">
                  Test Your Monthly Revenue
                </h4>
                <p className="mt-1 text-xs font-semibold text-cream/80">
                  Drag the sliders to model your pricing and customer volume for {activeBrandName}:
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-black uppercase">
                      <span className="text-cream">Average Package Price</span>
                      <span className="font-mono text-base text-sun">${unitPrice}</span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(15, Math.round(biz.plan.avgTicket * 0.4))}
                      max={Math.round(biz.plan.avgTicket * 2.5)}
                      step={5}
                      value={unitPrice}
                      onChange={(e) => setPriceOverride(Number(e.target.value))}
                      aria-label="Average Package Price"
                      className="mt-2 w-full accent-mint cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-black uppercase">
                      <span className="text-cream">Customers / Sales per Month</span>
                      <span className="font-mono text-base text-sun">{monthlySales} / mo</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={Math.max(30, biz.plan.monthlyTargetSales * 2)}
                      step={1}
                      value={monthlySales}
                      onChange={(e) => setSalesOverride(Number(e.target.value))}
                      aria-label="Customers per Month"
                      className="mt-2 w-full accent-mint cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-sun/30 pt-5">
                  <div className="border border-sun/40 bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase text-cream/70">Projected Monthly</p>
                    <p className="display mt-1 font-mono text-3xl text-mint">
                      ${projectedMrr.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-cream/80">per month</p>
                  </div>
                  <div className="border border-sun/40 bg-white/5 p-3">
                    <p className="text-[10px] font-black uppercase text-cream/70">Annual Run Rate</p>
                    <p className="display mt-1 font-mono text-3xl text-sun">
                      ${projectedArr.toLocaleString()}
                    </p>
                    <p className="text-[11px] font-bold text-cream/80">per year</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 02: BRAND & IDENTITY */}
          {activeStage === "brand" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-6">
                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Engine #03 &amp; #05 · Brand Voice &amp; Positioning
                  </p>
                  <h4 className="display mt-2 text-2xl">Brand Mission Statement</h4>
                  <p className="mt-2 text-lg font-extrabold text-ink">"{biz.brand.mission}"</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {biz.brand.voice.map((v) => (
                      <span
                        key={v}
                        className="border-2 border-ink bg-sun px-3 py-1 text-xs font-black uppercase"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Generated Campaign Taglines
                  </p>
                  <ul className="mt-3 space-y-2">
                    {biz.brand.slogans.map((s, idx) => (
                      <li
                        key={s}
                        className="flex items-center gap-3 border-2 border-ink bg-cream px-3.5 py-2.5 text-sm font-extrabold"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center bg-ink text-xs text-sun">
                          0{idx + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5 lg:col-span-6">
                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Engine #06 · Color &amp; Typography System
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {biz.brand.colors.map((c) => (
                      <div key={c.hex} className="b3 overflow-hidden bg-cream">
                        <div
                          className="h-16 w-full border-b-[3px] border-ink"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="p-2">
                          <p className="text-xs font-black truncate">{c.name}</p>
                          <p className="font-mono text-[11px] font-bold text-muted">{c.hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-ink/20 pt-4">
                    <div className="border-2 border-ink bg-cream p-3">
                      <p className="text-[10px] font-black uppercase text-muted">Display Heading Font</p>
                      <p className="display mt-1 text-lg">{biz.brand.headingFont}</p>
                    </div>
                    <div className="border-2 border-ink bg-cream p-3">
                      <p className="text-[10px] font-black uppercase text-muted">Body Copy Font</p>
                      <p className="mt-1 text-base font-extrabold">{biz.brand.bodyFont}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 03: WEBSITE & MARKETING */}
          {activeStage === "market" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              {/* Simulated Live Website Preview */}
              <div className="b3 hard overflow-hidden bg-paper lg:col-span-7">
                <div className="flex items-center justify-between border-b-[3px] border-ink bg-ink px-4 py-2.5 text-sun">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-mint" />
                    <span className="font-mono text-xs font-bold text-sun">
                      /sites/{activeSlug}
                    </span>
                  </div>
                  <span className="bg-mint px-2 py-0.5 text-[10px] font-black uppercase text-ink">
                    Engine #08 · Hosted Live Website Included
                  </span>
                </div>

                <div className="p-6">
                  <span className="text-xs font-black uppercase tracking-widest text-muted">
                    {activeBrandName}
                  </span>
                  <h4 className="display mt-2 text-3xl md:text-4xl leading-tight">
                    {biz.market.heroHeadline}
                  </h4>
                  <p className="mt-2 text-sm font-semibold text-muted">
                    {biz.market.heroSubhead}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 border-2 border-ink bg-sun px-4 py-2 text-xs font-black uppercase shadow-[3px_3px_0px_#000]">
                    {biz.market.ctaText} <ArrowRight className="h-3.5 w-3.5" />
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3 border-t-2 border-ink pt-5">
                    {biz.market.services.map((srv) => (
                      <div key={srv.title} className="border-2 border-ink bg-cream p-3">
                        <p className="font-mono text-sm font-black text-ink">{srv.price}</p>
                        <p className="mt-1 text-xs font-black leading-snug">{srv.title}</p>
                        <p className="mt-1 text-[11px] font-semibold text-muted">{srv.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ad Copy & Social Posts */}
              <div className="space-y-4 lg:col-span-5">
                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Engine #09 · Ready-to-Run Ad Creative &amp; Hook
                  </p>
                  <p className="mt-2 font-extrabold text-ink">"{biz.market.adHook}"</p>
                  <p className="mt-2 text-xs font-semibold text-muted leading-relaxed">
                    {biz.market.adBody}
                  </p>
                </div>

                <div className="b3 bg-paper p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-muted">
                    Engine #10 · 14-Day Social Media Post Sample
                  </p>
                  <p className="mt-2 text-sm font-bold text-ink leading-relaxed">
                    "{biz.market.socialPost}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 04: RUN & SCALE */}
          {activeStage === "run" && (
            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              <div className="b3 bg-paper p-5 lg:col-span-7">
                <div className="flex items-center justify-between border-b-2 border-ink pb-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted">
                      Engine #12 · Embedded Customer CRM
                    </p>
                    <h4 className="display mt-1 text-2xl">
                      Live Leads Captured from /sites/{activeSlug}
                    </h4>
                  </div>
                  <span className="border-2 border-ink bg-mint px-2.5 py-1 text-xs font-black uppercase">
                    Auto-Synced
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  {biz.run.leads.map((lead) => (
                    <div
                      key={lead.name}
                      className="flex flex-wrap items-center justify-between gap-2 border-2 border-ink bg-cream p-3"
                    >
                      <div>
                        <p className="font-extrabold text-sm">{lead.name}</p>
                        <p className="text-xs font-semibold text-muted">{lead.inquiry}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black">{lead.value}</span>
                        <span className="border border-ink bg-sun px-2 py-0.5 text-[10px] font-black uppercase">
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 lg:col-span-5">
                <div className="b3 hard bg-ink p-5 text-sun">
                  <p className="text-xs font-black uppercase tracking-widest text-mint">
                    Engine #02 · AI Business Advisor Next Action
                  </p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-cream">
                    "{biz.run.advisorTip}"
                  </p>
                  <Link
                    to="/advisor"
                    className="btn btn-sm btn-yellow mt-4 border-sun text-xs font-black text-ink"
                  >
                    Ask the AI Business Advisor <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="b3 bg-paper p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-muted">
                      Engine #11 · Launch Legal &amp; Ops Checklist
                    </p>
                    <span className="font-mono text-xs font-black">
                      {biz.run.checklistDone}/{biz.run.checklistTotal} Complete
                    </span>
                  </div>
                  <div className="b3 mt-2 h-4 bg-cream">
                    <div
                      className="h-full bg-mint"
                      style={{
                        width: `${Math.round((biz.run.checklistDone / biz.run.checklistTotal) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-bold text-muted">
                    Tasks tick off automatically as each AI engine finishes its output.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Stage Navigation Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t-[3px] border-ink pt-5">
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <Sparkles className="h-4 w-4" strokeWidth={3} />
              <span>All 13 deliverables above are generated automatically from 8 intake questions.</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="#pricing" className="btn btn-sm btn-quiet text-xs font-black">
                See Subscription Plans ($99/mo All-Access)
              </a>
              <button
                type="button"
                onClick={() => openQuickStart(biz.presetId)}
                className="btn btn-sm bg-ink text-sun text-xs font-black cursor-pointer"
              >
                Build My Business Like This <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
