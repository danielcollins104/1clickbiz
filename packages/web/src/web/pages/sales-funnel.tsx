import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  ShieldCheck,
  Rocket,
  Crown,
  Globe,
  Brain,
  BookOpen,
  DollarSign,
  CheckCircle2,
  Play,
  Pause,
  Loader2,
  Star,
  Clock,
  TrendingUp,
  Gift,
  Lock,
  MessageSquare,
} from "lucide-react";
import { BUNDLE_SLUG, PRODUCTS, type Product } from "../../api/catalog";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { useAccess, useCheckout, useSession, errorMessage } from "../queries/business";
import { useNotebook } from "../context/NotebookContext";
import { useQuickStart } from "../context/QuickStartContext";
import { IncomeFreedomCalculator } from "../components/IncomeFreedomCalculator";
import { PlatformBenefitsHighlight } from "../components/PlatformBenefitsHighlight";

interface QuizState {
  incomeGoal: number;
  nicheId: string;
  hoursPerWeek: number;
  visitorName: string;
  visitorEmail: string;
  includeFastTrackBonus: boolean;
  billingCycle: "monthly" | "annual";
}

const NICHE_MODELS = [
  {
    id: "ai-agency",
    label: "AI Automation & Digital Service",
    headline: "ApexFlow AI Studio",
    pitch: "Done-for-you AI lead capture & website automation for local businesses.",
    avgClientValue: 750,
    startupCost: "$0 upfront",
    whyItWorks: "Every local business wants more leads; you deliver in 1 click using our 13 engines.",
  },
  {
    id: "consulting",
    label: "Coaching, Advisory & Consulting",
    headline: "Sovereign Growth Partners",
    pitch: "Productized 90-day revenue & operations sprints for busy founders.",
    avgClientValue: 1250,
    startupCost: "$0 upfront",
    whyItWorks: "High-ticket recurring retainers with 95%+ profit margins and zero inventory.",
  },
  {
    id: "local-service",
    label: "High-Demand Local / Home Service",
    headline: "PrimeBrite Property & Mobile Pros",
    pitch: "Subscription-based residential & commercial care with instant online booking.",
    avgClientValue: 450,
    startupCost: "< $100",
    whyItWorks: "Immediate local cash flow—2 to 3 jobs per week replaces a full-time paycheck.",
  },
  {
    id: "digital-product",
    label: "Digital Templates, E-Commerce & Micro-SaaS",
    headline: "LaunchVault Digital Collective",
    pitch: "Turnkey industry playbooks, toolkits, and interactive web apps sold 24/7.",
    avgClientValue: 150,
    startupCost: "$0 upfront",
    whyItWorks: "Build once with our Generative AI Studio and sell unlimited copies while you sleep.",
  },
];

const AUTOMATED_FAQS = [
  {
    q: "Do I need to wait for Daniel or anyone on the team to set up my account?",
    a: "No! This entire funnel and onboarding pipeline is 100% automated. The second you click Start All-Access, your 13 AI engines, Solomon™ Advisor, Slide-Out Founder Notebook, and free live website hosting are unlocked and provisioned automatically.",
  },
  {
    q: "Do I need coding, design, or prior business experience?",
    a: "Zero experience required. You simply answer 8 plain-English questions (or pick a preset above), approve the facets of your business idea card with a checkmark, and our 13 connected engines write your plan, design your logo, and publish your live website automatically.",
  },
  {
    q: "Is live website & interactive web app hosting really free?",
    a: "Yes! Every business you launch includes free instant hosting at /sites/your-name plus free custom domain DNS + SSL support—saving you $29 to $99/month in separate web hosting fees forever.",
  },
  {
    q: "What if I want to change something the AI generated?",
    a: "You have unlimited iterations! On your Idea Cards, check off the parts you love and regenerate only the unchecked parts. In the Live Website Studio, type any change or switch creative presets with full version history.",
  },
  {
    q: "What if it's not a fit for me?",
    a: "You are protected by Daniel Collins's 14-Day 100% Money-Back Guarantee, and you can cancel your subscription in 1 click from your Account page at any time—no calls or emails needed.",
  },
];

export default function SalesFunnelPage() {
  const { add, clear } = useCart();
  const { data: session } = useSession();
  const { data: access } = useAccess();
  const checkout = useCheckout();
  const { addNote, openNotebook } = useNotebook();
  const { openQuickStart } = useQuickStart();
  const [, navigate] = useLocation();

  // Funnel Interactive State
  const [activeStage, setActiveStage] = useState<number>(1);
  const [autoTour, setAutoTour] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<QuizState>({
    incomeGoal: 6000,
    nicheId: "ai-agency",
    hoursPerWeek: 10,
    visitorName: "",
    visitorEmail: "",
    includeFastTrackBonus: true,
    billingCycle: "monthly",
  });
  const [subError, setSubError] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);
  const [blueprintSaved, setBlueprintSaved] = useState<boolean>(false);

  // Live Progressive Ticker (ad-campaign-studio pattern)
  const [liveProjectedVolume, setLiveProjectedVolume] = useState<number>(4829450);
  const [spotsRemaining] = useState<number>(7);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveProjectedVolume((prev) => prev + Math.floor(Math.random() * 45) + 15);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  // Optional hands-free auto-pilot tour progression
  useEffect(() => {
    if (!autoTour) return;
    const timer = setInterval(() => {
      setActiveStage((prev) => (prev < 4 ? prev + 1 : 1));
    }, 5500);
    return () => clearInterval(timer);
  }, [autoTour]);

  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG)!;
  const singleTools = PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG);
  const separateTotal = singleTools.reduce((s, p) => s + p.price, 0);

  const selectedNiche =
    NICHE_MODELS.find((n) => n.id === quiz.nicheId) ?? NICHE_MODELS[0]!;
  const clientsNeededPerMonth = Math.max(
    1,
    Math.ceil(quiz.incomeGoal / selectedNiche.avgClientValue)
  );
  const clientsNeededPerWeek = (clientsNeededPerMonth / 4.33).toFixed(1);
  const annualProjectedIncome = quiz.incomeGoal * 12;

  const bundleOwned = access?.plans.some(
    (p) => p.planId === "phase_1_launch" && p.status === "active"
  );

  const displayPrice = (monthly: number) =>
    quiz.billingCycle === "annual" ? Math.round(monthly * 0.8) : monthly;

  const handleSaveBlueprintToNotebook = () => {
    const content = [
      `🚀 MY CUSTOM 1-CLICK INCOME BLUEPRINT (${selectedNiche.headline})`,
      `• Target Monthly Income: $${quiz.incomeGoal.toLocaleString()}/mo ($${annualProjectedIncome.toLocaleString()}/yr)`,
      `• Chosen Model: ${selectedNiche.label} — "${selectedNiche.pitch}"`,
      `• Math to Freedom: Only ${clientsNeededPerMonth} clients/mo (~${clientsNeededPerWeek}/week) at $${selectedNiche.avgClientValue} avg package.`,
      `• Time Commitment: ${quiz.hoursPerWeek} hrs/week`,
      `• Next Step: Activate All-Access 13 AI Engines -> Approve Idea Card Facets -> Publish Free Live Website.`,
    ].join("\n");

    addNote(content, {
      title: `My $${quiz.incomeGoal.toLocaleString()}/mo Freedom Blueprint`,
      source: "Automated Sales Funnel",
      openDrawer: true,
    });
    setBlueprintSaved(true);
  };

  const handleAutomatedCheckout = (productsToBuy: Product[]) => {
    setSubError(null);
    clear();
    productsToBuy.forEach((p) => add(p, { open: false }));

    // Save their funnel quiz choices in localStorage so onboarding can pre-fill automatically
    try {
      localStorage.setItem(
        "1cb_AutomatedFunnelLead",
        JSON.stringify({
          ...quiz,
          selectedNiche: selectedNiche.label,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }

    if (!session) {
      navigate(`/login?next=${encodeURIComponent("/subscribe")}`);
      return;
    }

    setIsCheckingOut(true);
    checkout.mutate(
      { slugs: productsToBuy.map((p) => p.slug) },
      {
        onSuccess: (res) => {
          setIsCheckingOut(false);
          if (res.url) {
            window.location.href = res.url;
          } else {
            navigate("/dashboard?checkout=success");
          }
        },
        onError: (e) => {
          setIsCheckingOut(false);
          setSubError(errorMessage(e, "Could not start automated checkout."));
        },
      }
    );
  };

  return (
    <div className="bg-cream text-ink">
      {/* 1. TOP VEGAS MARQUEE HOOK & LIVE TICKER BAR (ad-campaign-studio pattern) */}
      <div className="border-b-[3px] border-ink bg-ink text-sun px-4 py-2.5">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-wider">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-sun text-ink px-2.5 py-1 border border-sun shadow-[2px_2px_0px_#79e784]">
              <Crown className="h-3.5 w-3.5 fill-ink" /> DANIEL COLLINS VIP EDITION · 100% AUTOMATED LAUNCH FUNNEL
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-mint">
              <TrendingUp className="h-3.5 w-3.5" />
              Live Modelled Founder Income:{" "}
              <span className="font-mono text-sun underline">
                ${liveProjectedVolume.toLocaleString()}+
              </span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint text-mint px-2.5 py-0.5 text-[11px]">
              <Clock className="h-3 w-3" /> Instant 24/7 Unattended Activation · {spotsRemaining} VIP Bonus Spots Left Today
            </span>
            <a
              href="#automated-funnel-engine"
              className="hidden md:inline-block bg-sun text-ink px-3 py-1 font-black no-underline hover:bg-mint"
            >
              Start 60s Funnel ↓
            </a>
          </div>
        </div>
      </div>

      {/* 2. HERO SPLASH SCREEN ANCHORED BY DANIEL'S PORTRAIT & AI KEY ART (creative-studio pattern) */}
      <section className="relative overflow-hidden border-b-[3px] border-ink bg-ink text-paper py-12 md:py-16 px-4 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Column: High-Impact Copy + Offer Hook */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-mint text-ink px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-sun shadow-[3px_3px_0px_#fde047]">
                  ⚡ 100% Automated Business-in-a-Box
                </span>
                <span className="bg-ink text-sun border border-sun/60 px-3 py-1 text-xs font-black uppercase tracking-wider">
                  ★ 4.9/5 Founder Rating · Zero Coding Required
                </span>
              </div>

              <h1 className="display text-4xl sm:text-5xl md:text-6xl leading-[1.18] text-sun">
                Stop Building From Scratch.{" "}
                <span className="inline-block bg-mint text-ink px-2.5 py-0.5 border-2 border-sun my-1">
                  Own a Live, Income-Ready Business
                </span>{" "}
                in 60 Seconds.
              </h1>

              <p className="text-base sm:text-lg font-bold text-cream/90 max-w-2xl leading-relaxed">
                Answer 3 quick questions in our automated funnel below. Watch our{" "}
                <strong className="text-sun">13 connected AI engines</strong> validate your idea card facets, build your 5-year business plan, design your brand &amp; logo, publish your{" "}
                <strong className="text-mint">free live website &amp; interactive web app</strong>, and pair you with{" "}
                <strong className="text-sun">Solomon™ Sovereign AI Advisor</strong>—automatically, 24/7, with zero waiting!
              </p>

              {/* Tangible VIP Value Stack Pills */}
              <div className="pt-2"><img src="/images/you-get-red.svg" alt="You get:" className="h-16 sm:h-20 w-auto select-none" /></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  "✓ 13 Connected AI Engines",
                  "✓ Free Custom Domain Hosting",
                  "✓ Per-Facet ✓ Idea Card Control",
                  "✓ Solomon™ Sovereign AI",
                  "✓ Slide-Out Founder Notebook",
                  "✓ Keep 100% of Your Revenue",
                ].map((tag) => (
                  <div
                    key={tag}
                    className="border border-sun/50 bg-[#1c1c21] px-3 py-2 text-xs font-black text-sun"
                  >
                    {tag}
                  </div>
                ))}
              </div>

              {/* High-Contrast Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#automated-funnel-engine"
                  className="btn btn-yellow border-sun text-ink text-base font-black px-6 py-4 shadow-[6px_6px_0px_#79e784] hover:translate-x-[1px] hover:translate-y-[1px]"
                >
                  <Rocket className="h-5 w-5 fill-ink" strokeWidth={2.5} />
                  <span>STEP 1: CUSTOMIZE MY INCOME FUNNEL ↓</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleAutomatedCheckout([bundle])}
                  disabled={isCheckingOut}
                  className="btn bg-mint text-ink border-sun text-sm font-black px-5 py-4 cursor-pointer"
                >
                  <Zap className="h-4 w-4 fill-ink" />
                  <span>
                    {isCheckingOut
                      ? "Activating Workspace…"
                      : `Instant All-Access Pass (${money(displayPrice(bundle.price))}/mo) →`}
                  </span>
                </button>
              </div>

              <p className="text-xs font-extrabold uppercase tracking-wider text-cream/75">
                🔒 Instant Unattended Provisioning • 14-Day 100% Money-Back Guarantee • Cancel in 1 Click Anytime
              </p>
            </div>

            {/* Right Column: Hero Showcase Frame with Daniel Collins + AI Key Art */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="absolute -bottom-3 -right-3 h-full w-full bg-mint border-[3px] border-sun" />
                <div className="relative b3 border-[3px] border-sun bg-[#141416] overflow-hidden shadow-[8px_8px_0px_#fde047]">
                  {/* Dual Visual Header: AI Key Art + Founder Portrait */}
                  <div className="grid grid-cols-12 border-b-[3px] border-sun">
                    <div className="col-span-5 relative aspect-[3/4] overflow-hidden border-r-[3px] border-sun bg-ink">
                      <img
                        src="/assets/aistudio/GlanceAi_1918294047_e107fa5b.png"
                        alt="Daniel Collins — Creator of 1 Click Business"
                        className="h-full w-full object-cover object-[center_55%]"
                      />
                      <span className="absolute bottom-2 left-2 bg-ink/90 border border-sun px-2 py-0.5 text-[10px] font-black uppercase text-sun">
                        Daniel Collins
                      </span>
                    </div>
                    <div className="col-span-7 relative aspect-[4/3] sm:aspect-auto overflow-hidden bg-ink">
                      <img
                        src="/images/funnel-hero-keyart.png"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/bundle-kit.webp";
                        }}
                        alt="1-Click Business 13 AI Engines Command Center"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-sun text-ink border border-ink px-2 py-0.5 text-[10px] font-black uppercase">
                        13 AI Engines Live
                      </span>
                    </div>
                  </div>

                  {/* Embedded Short About Me with Daniel's Message */}
                  <div className="p-5 bg-paper text-ink">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="bg-sun border border-ink px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        Meet Your Creator · Daniel Collins
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified Founder
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-ink leading-snug">
                      "Hi, I'm <strong>Daniel Collins</strong>. I built <strong>1 Click Business</strong> so you don't need $15,000 for agencies or months of tech frustration to claim your financial independence. Follow the 4 automated steps below—the system builds your plan, brand, and live website immediately without needing to wait on me!"
                    </p>
                    <div className="mt-3 pt-3 border-t-2 border-dashed border-ink/25 flex items-center justify-between text-xs font-black">
                      <span>✓ 100% Automated 24/7 Onboarding</span>
                      <a href="#founder-spotlight" className="underline text-ink hover:text-emerald-800">
                        Read My Story ↓
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE 4-STAGE AUTOMATED SALES FUNNEL ENGINE */}
      <section
        id="automated-funnel-engine"
        className="border-b-[3px] border-ink bg-cream py-16 px-4 md:px-8"
      >
        <div className="mx-auto max-w-[1400px]">
          {/* Funnel Header + Auto-Tour Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-ink text-sun px-3 py-1 text-xs font-black uppercase tracking-widest border border-ink">
                <Sparkles className="h-3.5 w-3.5 text-mint" /> Interactive 4-Step Automated Sales Funnel
              </span>
              <h2 className="display mt-3 text-4xl sm:text-6xl leading-[1.15]">
                Build &amp; Activate Your Income Blueprint in 4 Clicks
              </h2>
              <p className="mt-2 text-sm sm:text-base font-bold text-ink/80 max-w-2xl">
                Each stage below automatically configures the next—from your income target to your live AI business preview, VIP bonus vault, and instant workspace activation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setAutoTour((prev) => !prev)}
                className={`btn btn-sm cursor-pointer font-black text-xs ${
                  autoTour ? "bg-mint text-ink" : "btn-quiet"
                }`}
              >
                {autoTour ? (
                  <>
                    <Pause className="h-3.5 w-3.5" /> Pause Auto-Guided Tour
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" /> Watch Automated Funnel Tour
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => openQuickStart()}
                className="btn btn-sm btn-yellow cursor-pointer font-black text-xs"
              >
                <Zap className="h-3.5 w-3.5 fill-ink" /> Or Launch 1-Click Wizard Directly
              </button>
            </div>
          </div>

          {/* 4-Stage Progress Stepper */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              {
                step: 1,
                label: "STAGE 1 · DIAGNOSTIC",
                title: "Set Income & Niche Goal",
                sub: "Takes 15 seconds",
              },
              {
                step: 2,
                label: "STAGE 2 · AI PREVIEW",
                title: "Your Custom Business Blueprint",
                sub: "Instant math + live site",
              },
              {
                step: 3,
                label: "STAGE 3 · VIP VALUE STACK",
                title: "$15,400+ Vault & Bonuses",
                sub: "Free Fast-Track Bonus",
              },
              {
                step: 4,
                label: "STAGE 4 · INSTANT ACCESS",
                title: "1-Click Automated Launch",
                sub: "Unattended 24/7 setup",
              },
            ].map((item) => {
              const isCurrent = activeStage === item.step;
              const isCompleted = activeStage > item.step;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => {
                    setAutoTour(false);
                    setActiveStage(item.step);
                  }}
                  className={`b3 p-4 text-left cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-ink text-sun shadow-[5px_5px_0px_#79e784] -translate-y-0.5"
                      : isCompleted
                      ? "bg-mint text-ink shadow-[3px_3px_0px_#000]"
                      : "bg-paper text-ink hover:bg-sun/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                        isCurrent
                          ? "bg-sun text-ink border-sun"
                          : "bg-cream text-ink border-ink"
                      }`}
                    >
                      {item.label}
                    </span>
                    {isCompleted && <Check className="h-4 w-4 shrink-0" strokeWidth={3} />}
                  </div>
                  <p className="display text-lg sm:text-xl mt-2 leading-tight">{item.title}</p>
                  <p
                    className={`text-xs font-bold mt-0.5 ${
                      isCurrent ? "text-cream/80" : "text-ink/70"
                    }`}
                  >
                    {item.sub}
                  </p>
                </button>
              );
            })}
          </div>

          {/* STAGE 1 CONTENT: 30-SECOND INCOME & NICHE DIAGNOSTIC */}
          {activeStage === 1 && (
            <div className="b3 hard bg-paper p-6 md:p-10 animate-in fade-in duration-150">
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <span className="bg-sun border-2 border-ink px-2.5 py-1 text-xs font-black uppercase">
                      Funnel Stage 1 of 4 · Personalize Your Income Engine
                    </span>
                    <h3 className="display text-3xl sm:text-4xl mt-3">
                      How Much Monthly Income Do You Want Your Business to Generate?
                    </h3>
                    <p className="text-sm font-bold text-muted mt-1">
                      Select your target monthly take-home pay and preferred business model below. Our funnel will automatically calculate your client math and build your custom preview in Stage 2!
                    </p>
                  </div>

                  {/* Step 1A: Monthly Income Target */}
                  <div className="border-2 border-ink bg-cream p-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="funnel-income-slider"
                        className="text-xs font-black uppercase tracking-wider"
                      >
                        1. Your Monthly Income Target:
                      </label>
                      <span className="display text-3xl bg-sun px-3 py-0.5 border-2 border-ink">
                        ${quiz.incomeGoal.toLocaleString()}/mo
                      </span>
                    </div>
                    <input
                      id="funnel-income-slider"
                      type="range"
                      min={2000}
                      max={25000}
                      step={500}
                      value={quiz.incomeGoal}
                      onChange={(e) =>
                        setQuiz((q) => ({ ...q, incomeGoal: Number(e.target.value) }))
                      }
                      className="mt-3 w-full accent-ink cursor-pointer"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[3000, 5000, 8000, 12000, 20000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setQuiz((q) => ({ ...q, incomeGoal: val }))}
                          className={`px-2.5 py-1 text-xs font-black border border-ink cursor-pointer ${
                            quiz.incomeGoal === val ? "bg-ink text-sun" : "bg-paper hover:bg-sun"
                          }`}
                        >
                          ${val.toLocaleString()}/mo
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 1B: Choose Business Model */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-2">
                      2. Pick Your Income Vehicle — My business is most like (choose a business below):
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {NICHE_MODELS.map((m) => {
                        const active = quiz.nicheId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setQuiz((q) => ({ ...q, nicheId: m.id }))}
                            className={`p-3.5 text-left border-2 border-ink cursor-pointer transition-all ${
                              active
                                ? "bg-sun shadow-[4px_4px_0px_#000] -translate-y-0.5"
                                : "bg-cream hover:bg-paper"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-black text-xs uppercase">{m.label}</span>
                              {active && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                            </div>
                            <p className="text-xs font-semibold text-ink/80 mt-1 line-clamp-2">
                              {m.pitch}
                            </p>
                            <p className="mt-2 text-[11px] font-black text-emerald-900">
                              Avg Client Value: ${m.avgClientValue} · Startup: {m.startupCost}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Instant Live Preview Summary & Next Stage Button */}
                <div className="lg:col-span-5 flex flex-col justify-between border-[3px] border-ink bg-ink text-sun p-6 shadow-[6px_6px_0px_#79e784]">
                  <div>
                    <span className="bg-mint text-ink px-2.5 py-1 text-xs font-black uppercase">
                      Live Funnel Calculation
                    </span>
                    <h4 className="display text-3xl mt-3 text-sun">
                      {selectedNiche.headline}
                    </h4>
                    <p className="text-xs font-bold text-cream/85 mt-1">
                      {selectedNiche.pitch}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-y-2 border-sun/30 py-4">
                      <div className="bg-[#1d1d22] p-3 border border-sun/40">
                        <p className="text-[10px] font-black uppercase text-mint">
                          Annual Income Target
                        </p>
                        <p className="display text-2xl sm:text-3xl text-sun mt-0.5">
                          ${annualProjectedIncome.toLocaleString()}/yr
                        </p>
                      </div>
                      <div className="bg-[#1d1d22] p-3 border border-sun/40">
                        <p className="text-[10px] font-black uppercase text-mint">
                          Clients Needed
                        </p>
                        <p className="display text-2xl sm:text-3xl text-sun mt-0.5">
                          {clientsNeededPerMonth}/mo{" "}
                          <span className="text-xs font-sans text-cream/80">
                            (~{clientsNeededPerWeek}/wk)
                          </span>
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs font-bold text-cream/90 leading-relaxed">
                      💡 <strong>Why this is so achievable:</strong> You don't need thousands of followers. Landing just{" "}
                      <span className="text-mint underline">
                        {clientsNeededPerWeek} customers a week
                      </span>{" "}
                      with your free live website &amp; done-for-you ad campaigns hits your{" "}
                      <strong>${quiz.incomeGoal.toLocaleString()}/month</strong> freedom goal!
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-sun/30 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveStage(2)}
                      className="btn btn-yellow w-full border-sun text-ink font-black text-sm cursor-pointer shadow-[4px_4px_0px_#79e784]"
                    >
                      <span>Continue to Stage 2: Preview My AI Business ➔</span>
                    </button>
                    <p className="text-[11px] text-center font-bold text-cream/70">
                      Step 1 leads directly to Step 2 — no email wall required!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2 CONTENT: PERSONALIZED AI BUSINESS & LIVE WEBSITE PREVIEW */}
          {activeStage === 2 && (
            <div className="b3 hard bg-paper p-6 md:p-10 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-4 mb-6">
                <div>
                  <span className="bg-mint border-2 border-ink px-2.5 py-1 text-xs font-black uppercase">
                    Funnel Stage 2 of 4 · Your Tailored Deliverables Preview
                  </span>
                  <h3 className="display text-3xl sm:text-4xl mt-2">
                    Here Is What Our 13 AI Engines Build for{" "}
                    <span className="underline decoration-sun">{selectedNiche.headline}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleSaveBlueprintToNotebook}
                  className="btn btn-sm bg-sun text-ink border-2 border-ink font-black text-xs cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {blueprintSaved
                      ? "✓ Saved to Slide-Out Founder Notebook!"
                      : "Save This Blueprint to Founder Notebook"}
                  </span>
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Preview Card 1: Per-Facet Idea Card */}
                <div className="b3 bg-cream p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-ink">
                      <span className="text-xs font-black uppercase bg-sun px-2 py-0.5 border border-ink">
                        Engines #01–#03 · Plan &amp; Brand
                      </span>
                      <span className="text-[11px] font-black text-emerald-800">
                        ✓ 5/5 Facets Ready
                      </span>
                    </div>
                    <h4 className="display text-2xl mt-3">{selectedNiche.headline}</h4>
                    <p className="text-xs font-bold text-ink/80 mt-1">{selectedNiche.pitch}</p>
                    <ul className="mt-3 space-y-1.5 text-xs font-bold">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Per-Facet Checkmark Approval &amp; Iteration</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>5-Year Financial Plan + Pricing Tiers</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Custom Vector Logo + Color/Font System</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/dashboard/idea-wizard"
                    className="mt-4 text-xs font-black underline text-ink inline-flex items-center gap-1"
                  >
                    Inspect Idea Card Facets →
                  </Link>
                </div>

                {/* Preview Card 2: Free Live Website + Interactive Web App */}
                <div className="b3 bg-cream p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-ink">
                      <span className="text-xs font-black uppercase bg-mint px-2 py-0.5 border border-ink">
                        Engines #07–#09 · Live Site &amp; Ads
                      </span>
                      <span className="text-[11px] font-black text-emerald-800">
                        $0/mo Hosting
                      </span>
                    </div>
                    <h4 className="display text-2xl mt-3">
                      Free Live Website &amp; Web App Studio
                    </h4>
                    <p className="text-xs font-bold text-ink/80 mt-1">
                      Hosted immediately at <code>/sites/your-brand</code> or your own custom domain with interactive calculators &amp; lead forms.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs font-bold">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Unlimited AI design &amp; copy iterations</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Ready-to-run Meta/Google Ads + 30-day social</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Leads flow straight into your Customer CRM</span>
                      </li>
                    </ul>
                  </div>
                  <Link
                    to="/sites/mouth-off"
                    className="mt-4 text-xs font-black underline text-ink inline-flex items-center gap-1"
                  >
                    Open Live Website Studio Demo ↗
                  </Link>
                </div>

                {/* Preview Card 3: Solomon + Slide-Out Notebook */}
                <div className="b3 bg-cream p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-ink">
                      <span className="text-xs font-black uppercase bg-ink text-sun px-2 py-0.5 border border-ink">
                        Engines #10–#13 · Scale &amp; Advisor
                      </span>
                      <span className="text-[11px] font-black text-emerald-800">
                        Tri-Core Brain
                      </span>
                    </div>
                    <h4 className="display text-2xl mt-3">
                      Solomon™ + Slide-Out Notebook
                    </h4>
                    <p className="text-xs font-bold text-ink/80 mt-1">
                      Your 24/7 sovereign executive co-founder already knows your plan, pricing, and local market.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-xs font-bold">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Click any advice paragraph to save to Notebook</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>Matched small-business grants &amp; SBA loans</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} />
                        <span>First $1,000 Income Playbook included</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNotebook()}
                    className="mt-4 text-xs font-black underline text-left text-ink inline-flex items-center gap-1 cursor-pointer"
                  >
                    Open Slide-Out Founder Notebook →
                  </button>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5">
                <button
                  type="button"
                  onClick={() => setActiveStage(1)}
                  className="btn btn-sm btn-quiet cursor-pointer font-black"
                >
                  ← Back to Stage 1
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStage(3)}
                  className="btn btn-yellow cursor-pointer font-black shadow-[5px_5px_0px_#000]"
                >
                  <span>Continue to Stage 3: Unlock VIP Value Stack &amp; Bonuses ➔</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3 CONTENT: VIP FOUNDER'S VALUE STACK + FREE FAST-TRACK BONUS */}
          {activeStage === 3 && (
            <div className="b3 hard bg-ink text-sun p-6 md:p-10 animate-in fade-in duration-150">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span className="bg-mint text-ink px-3 py-1 text-xs font-black uppercase tracking-widest">
                    🔥 KEEP GOING — YOU ARE 1 STEP AWAY FROM OWNING YOUR BUSINESS!
                  </span>
                  <h3 className="display text-4xl sm:text-5xl text-sun">
                    The Complete VIP Founder's Business-in-a-Box Stack
                  </h3>
                  <p className="text-sm font-bold text-cream/90">
                    Hiring agencies and subscribing to disconnected tools costs over{" "}
                    <span className="line-through text-mint">$15,400+</span>. Your All-Access Pass unlocks everything below automatically:
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {[
                      ["13 Connected Phase-1 AI Launch Engines (500 AI Gens/mo)", "$292/mo Value"],
                      ["Generative AI Live Website & Web App Builder + Free Custom Domain Hosting", "$99/mo Value"],
                      ["Per-Facet Idea Card Approval & Unlimited Simple Iteration", "$49/mo Value"],
                      ["Solomon™ Sovereign AI Advisor + Slide-Out Founder Notebook", "$97/mo Value"],
                      ["First $1,000 Income Playbook + Customer CRM + Grant Finder", "$149/mo Value"],
                      ["100% Revenue Ownership (Zero Platform Commissions Ever)", "Priceless"],
                    ].map(([item, val]) => (
                      <div
                        key={item}
                        className="flex items-center justify-between gap-3 border border-sun/40 bg-[#1b1b20] px-3.5 py-2.5 text-xs sm:text-sm font-bold"
                      >
                        <span className="flex items-center gap-2 text-cream">
                          <Check className="h-4 w-4 text-mint shrink-0" strokeWidth={3} />
                          {item}
                        </span>
                        <span className="font-mono text-xs font-black text-mint shrink-0">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Free VIP Bonus Toggle */}
                  <label className="mt-4 flex items-start gap-3 border-2 border-mint bg-mint/15 p-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quiz.includeFastTrackBonus}
                      onChange={(e) =>
                        setQuiz((q) => ({ ...q, includeFastTrackBonus: e.target.checked }))
                      }
                      className="mt-1 h-5 w-5 accent-mint cursor-pointer"
                    />
                    <div>
                      <span className="inline-flex items-center gap-1 bg-mint text-ink px-2 py-0.5 text-[10px] font-black uppercase">
                        <Gift className="h-3 w-3" /> VIP Fast-Action Bonus · Included $0 Today
                      </span>
                      <p className="font-black text-sm text-sun mt-1">
                        YES! Include Daniel's "First $1,000 in 7 Days" Outreach Scripts &amp; Closing Playbook (Normally $197 — FREE Today)
                      </p>
                      <p className="text-xs font-semibold text-cream/80 mt-0.5">
                        Pre-loaded directly into your Dashboard &amp; Slide-Out Founder Notebook the moment you activate.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Right Column: VIP Vault Visual + Price Summary */}
                <div className="lg:col-span-5">
                  <div className="b3 border-[3px] border-sun bg-paper text-ink p-5 shadow-[8px_8px_0px_#79e784]">
                    <div className="aspect-[16/10] overflow-hidden border-2 border-ink bg-ink mb-4">
                      <img
                        src="/images/funnel-vip-vault.png"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/images/bundle-kit.webp";
                        }}
                        alt="VIP Founder Business-in-a-Box Vault"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex items-baseline justify-between border-b-2 border-ink pb-3">
                      <div>
                        <p className="text-xs font-black uppercase text-muted">
                          Total Real-World Value: <span className="line-through">$686/mo</span>
                        </p>
                        <p className="display text-4xl sm:text-5xl mt-1">
                          {money(displayPrice(bundle.price))}
                          <span className="text-sm font-sans font-bold">/mo</span>
                        </p>
                      </div>
                      <span className="bg-mint border-2 border-ink px-2.5 py-1 text-xs font-black uppercase">
                        Save {money(separateTotal - bundle.price)}/mo
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveStage(4)}
                      className="btn btn-yellow w-full mt-4 font-black text-sm cursor-pointer shadow-[4px_4px_0px_#000]"
                    >
                      <span>Proceed to Stage 4: Instant 1-Click Activation ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4 CONTENT: 100% AUTOMATED CHECKOUT & UNATTENDED PROVISIONING */}
          {activeStage === 4 && (
            <div className="b3 hard bg-paper p-6 md:p-10 animate-in fade-in duration-150">
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 space-y-5">
                  <span className="bg-mint border-2 border-ink px-3 py-1 text-xs font-black uppercase">
                    Funnel Stage 4 of 4 · Instant Automated Provisioning (No Waiting!)
                  </span>
                  <h3 className="display text-4xl sm:text-5xl">
                    Activate Your 13 AI Income Engines Right Now
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-ink/80">
                    Everything is automatic. As soon as you complete checkout below, our server immediately provisions your{" "}
                    <strong>{selectedNiche.headline}</strong> workspace, unlocks all 13 AI engines, and opens your Dashboard!
                  </p>

                  {/* Optional Quick Personalization Fields */}
                  <div className="grid gap-4 sm:grid-cols-2 border-2 border-ink bg-cream p-4">
                    <div>
                      <label
                        htmlFor="visitor-name"
                        className="block text-xs font-black uppercase tracking-wider"
                      >
                        Your First Name (Optional):
                      </label>
                      <input
                        id="visitor-name"
                        type="text"
                        placeholder="e.g. Alex"
                        value={quiz.visitorName}
                        onChange={(e) =>
                          setQuiz((q) => ({ ...q, visitorName: e.target.value }))
                        }
                        className="input mt-1 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="visitor-email"
                        className="block text-xs font-black uppercase tracking-wider"
                      >
                        Best Email for Receipt &amp; Blueprint:
                      </label>
                      <input
                        id="visitor-email"
                        type="email"
                        placeholder="you@example.com"
                        value={quiz.visitorEmail}
                        onChange={(e) =>
                          setQuiz((q) => ({ ...q, visitorEmail: e.target.value }))
                        }
                        className="input mt-1 text-sm font-bold"
                      />
                    </div>
                  </div>

                  {/* Billing Cycle Selector */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink bg-cream p-4">
                    <div>
                      <p className="text-xs font-black uppercase">Choose Billing Preference:</p>
                      <p className="text-xs font-bold text-muted">
                        Switch to Annual to save 20% ($240/yr instant savings)
                      </p>
                    </div>
                    <div className="flex items-center border-2 border-ink bg-paper p-1">
                      <button
                        type="button"
                        onClick={() => setQuiz((q) => ({ ...q, billingCycle: "monthly" }))}
                        className={`px-3 py-1.5 text-xs font-black uppercase cursor-pointer ${
                          quiz.billingCycle === "monthly" ? "bg-ink text-sun" : "text-ink"
                        }`}
                      >
                        Monthly ({money(bundle.price)}/mo)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuiz((q) => ({ ...q, billingCycle: "annual" }))}
                        className={`px-3 py-1.5 text-xs font-black uppercase cursor-pointer ${
                          quiz.billingCycle === "annual" ? "bg-ink text-sun" : "text-ink"
                        }`}
                      >
                        Annual ($79/mo · Save 20%)
                      </button>
                    </div>
                  </div>

                  {subError && (
                    <div className="border-2 border-rose-600 bg-rose-50 p-3 text-xs font-black text-rose-800">
                      {subError}
                    </div>
                  )}
                </div>

                {/* Right Order Summary & 1-Click Automated Activation */}
                <div className="lg:col-span-5">
                  <div className="b3 hard bg-ink text-sun p-6 shadow-[8px_8px_0px_#79e784]">
                    <div className="flex items-center justify-between border-b border-sun/30 pb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-mint">
                        Automated Order Summary
                      </span>
                      <span className="bg-sun text-ink px-2 py-0.5 text-[10px] font-black uppercase">
                        Instant Access
                      </span>
                    </div>

                    <h4 className="display text-3xl text-sun mt-3">
                      Phase 1 — All-Access Launch Pass
                    </h4>
                    <p className="text-xs font-bold text-cream/85 mt-1">
                      Configured for: <strong className="text-mint">{selectedNiche.label}</strong> (${quiz.incomeGoal.toLocaleString()}/mo target)
                    </p>

                    <ul className="mt-4 space-y-2 text-xs font-bold text-cream border-y border-sun/30 py-4">
                      <li className="flex items-center justify-between">
                        <span>✓ All 13 AI Launch Engines</span>
                        <span className="text-mint">Included</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>✓ Free Live Website &amp; Custom Domain Studio</span>
                        <span className="text-mint">Included</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>✓ Per-Facet ✓ Idea Card Approval</span>
                        <span className="text-mint">Included</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>✓ Solomon™ + Slide-Out Notebook</span>
                        <span className="text-mint">Included</span>
                      </li>
                      {quiz.includeFastTrackBonus && (
                        <li className="flex items-center justify-between text-sun">
                          <span>🎁 VIP First $1,000 Fast-Track Playbook</span>
                          <span className="bg-mint text-ink px-1.5 py-0.5 text-[10px] font-black">
                            FREE
                          </span>
                        </li>
                      )}
                    </ul>

                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-xs font-black uppercase">Total Due Today:</span>
                      <span className="display text-5xl text-sun">
                        {money(displayPrice(bundle.price))}
                        <span className="text-xs font-sans text-cream/80">/mo</span>
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      {bundleOwned ? (
                        <Link
                          to="/dashboard"
                          className="btn btn-yellow w-full border-sun text-ink font-black"
                        >
                          <Check className="h-5 w-5" /> You Own All-Access · Open Dashboard →
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled={isCheckingOut}
                          onClick={() => handleAutomatedCheckout([bundle])}
                          className="btn btn-yellow w-full border-sun text-ink text-base font-black py-4 cursor-pointer shadow-[5px_5px_0px_#79e784]"
                        >
                          {isCheckingOut ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" /> Provisioning Your 13 Engines…
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 fill-ink" /> ACTIVATE ALL 13 ENGINES NOW →
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => openQuickStart()}
                        className="btn btn-sm bg-[#1f1f24] text-cream border border-sun/40 w-full font-bold text-xs cursor-pointer hover:bg-sun hover:text-ink"
                      >
                        Or Test-Drive Step 1 Free in the 1-Click Wizard First →
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-bold text-cream/80">
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-mint" /> 256-Bit Encrypted
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-mint" /> 14-Day Refund Guarantee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. SHORT ABOUT ME — DANIEL COLLINS FOUNDER SPOTLIGHT WITH REAL PHOTO */}
      <section
        id="founder-spotlight"
        className="border-b-[3px] border-ink bg-paper py-16 px-4 md:px-8"
      >
        <div className="mx-auto max-w-[1200px]">
          <div className="b3 hard bg-cream p-6 md:p-10">
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              {/* Founder Photo Card */}
              <div className="md:col-span-4">
                <div className="relative mx-auto max-w-[280px]">
                  <div className="absolute -bottom-2.5 -right-2.5 h-full w-full bg-sun border-[3px] border-ink" />
                  <div className="relative b3 border-[3px] border-ink bg-ink overflow-hidden">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img
                        src="/assets/aistudio/GlanceAi_1918294047_e107fa5b.png"
                        alt="Daniel Collins — Creator & Founder of 1 Click Business"
                        className="h-full w-full object-cover object-[center_55%]"
                      />
                    </div>
                    <div className="bg-paper p-3.5 border-t-[3px] border-ink flex items-center justify-between">
                      <div>
                        <p className="display text-xl leading-[1.15]">Daniel Collins</p>
                        <p className="text-[10px] font-black uppercase text-muted mt-0.5">
                          Founder &amp; Lead Architect
                        </p>
                      </div>
                      <span className="bg-mint border border-ink px-2 py-0.5 text-[10px] font-black uppercase">
                        Creator
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Short About Me Copy */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 bg-ink text-sun px-3 py-1 text-xs font-black uppercase tracking-widest">
                  <Star className="h-3.5 w-3.5 text-sun fill-sun" /> About Me · A Personal Note From Daniel Collins
                </div>
                <h2 className="display text-3xl sm:text-5xl leading-tight">
                  "I Built This Automated Launch System So You Can Own Your Income—Starting Today."
                </h2>
                <p className="text-sm sm:text-base font-semibold text-ink/90 leading-relaxed">
                  Hi, I'm <strong>Daniel Collins</strong>. I saw too many smart, driven people stuck working for someone else because launching a business felt like a maze of expensive web developers, branding agencies, and disconnected AI tools.
                </p>
                <p className="text-sm sm:text-base font-semibold text-ink/90 leading-relaxed">
                  That's why I engineered <strong>1 Click Business</strong> to run 100% automatically for you. From per-facet checkmark approval on your idea cards, to our generative AI live website &amp; web app studio with free custom domain hosting, to <strong>Solomon™ Sovereign AI Advisor</strong> and your slide-out <strong>Founder Notebook</strong>—every piece works together so you can focus on landing customers and keeping <strong>100% of the income you make</strong>.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href="#automated-funnel-engine"
                    onClick={() => setActiveStage(4)}
                    className="btn btn-yellow font-black text-xs sm:text-sm"
                  >
                    <Rocket className="h-4 w-4 fill-ink" /> Claim Your All-Access Pass With My 14-Day Guarantee →
                  </a>
                  <Link to="/advisor" className="btn btn-quiet font-black text-xs sm:text-sm">
                    <MessageSquare className="h-4 w-4" /> Ask Solomon™ Advisor Anything
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALL 6 SIGNATURE BENEFITS + INTERACTIVE INCOME CALCULATOR */}
      <PlatformBenefitsHighlight compact />
      <IncomeFreedomCalculator />

      {/* 6. 24/7 AUTOMATED OBJECTION-KILLER FAQ & FINAL CTA */}
      <section className="border-b-[3px] border-ink bg-paper py-16 px-4 md:px-8">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center mb-10">
            <span className="bg-sun border-2 border-ink px-3 py-1 text-xs font-black uppercase tracking-widest">
              24/7 Self-Serve Answers · Zero Waiting
            </span>
            <h2 className="display text-4xl sm:text-6xl mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {AUTOMATED_FAQS.map((item) => (
              <div key={item.q} className="b3 hard bg-cream p-5">
                <h3 className="display text-xl sm:text-2xl text-ink">{item.q}</h3>
                <p className="mt-2 text-xs sm:text-sm font-bold text-ink/80 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Final Unattended Conversion Banner */}
          <div className="b3 hard mt-12 bg-ink text-sun p-8 text-center shadow-[8px_8px_0px_#79e784]">
            <span className="bg-mint text-ink px-3 py-1 text-xs font-black uppercase">
              Day 1 of Your Financial Independence Starts Now
            </span>
            <h3 className="display text-4xl sm:text-6xl text-sun mt-3">
              Ready to Launch Your Business in 1 Click?
            </h3>
            <p className="mt-2 text-sm sm:text-base font-bold text-cream/90 max-w-xl mx-auto">
              Click below for instant, unattended 24/7 access to all 13 AI engines, your free live website studio, Solomon™ Advisor, and your Slide-Out Founder Notebook.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                type="button"
                onClick={() => handleAutomatedCheckout([bundle])}
                disabled={isCheckingOut}
                className="btn btn-yellow border-sun text-ink text-base font-black px-8 py-4 cursor-pointer shadow-[5px_5px_0px_#79e784]"
              >
                <Zap className="h-5 w-5 fill-ink" />
                <span>
                  {isCheckingOut
                    ? "Starting Automated Checkout…"
                    : `Start All-Access Pass (${money(displayPrice(bundle.price))}/mo) →`}
                </span>
              </button>
              <a
                href="#automated-funnel-engine"
                onClick={() => setActiveStage(1)}
                className="btn bg-paper text-ink border-sun font-black text-sm px-6 py-4"
              >
                Take 30s Income Quiz Above ↑
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
