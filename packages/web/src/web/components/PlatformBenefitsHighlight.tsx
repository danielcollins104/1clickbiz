import { Link } from "wouter";
import {
  Sparkles,
  Globe,
  CheckCircle2,
  Brain,
  BookOpen,
  DollarSign,
  Compass,
  Zap,
  ArrowRight,
  Check,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { useNotebook } from "../context/NotebookContext";

export function PlatformBenefitsHighlight({ compact = false }: { compact?: boolean }) {
  const { openNotebook, notes } = useNotebook();

  const benefits = [
    {
      num: "BENEFIT 01",
      badge: "Free Custom Domain + Unlimited Iterations",
      title: "Generative AI Live Website & Web App Builder",
      subtitle: "Create, iterate until satisfied & host 100% free forever",
      description:
        "Generate an above-and-beyond creative website or interactive web app (calculators, booking tools, quote estimators), iterate as many times as you want with full version history, and host it free on our edge network or your own custom domain.",
      highlights: [
        "6 creative presets + custom interactive web app widgets",
        "Unlimited AI iterations & 1-click version history restore",
        "Free live hosting (/sites/your-brand) + custom domain DNS & SSL",
      ],
      ctaLabel: "Open Live Website Studio ↗",
      ctaTo: "/sites/mouth-off",
      secondaryLabel: "Customize in Dashboard",
      secondaryTo: "/dashboard/website-generator",
      accentBg: "bg-sun",
      icon: Globe,
    },
    {
      num: "BENEFIT 02",
      badge: "Granular Checkmark Control",
      title: "Per-Facet Idea Card Approval & Simple Iteration",
      subtitle: "Lock in what you love ✓ — regenerate only what you don't",
      description:
        "Don't settle for an all-or-nothing business idea. Individually approve each facet of your idea card with a checkmark—Business Title, One-Sentence Pitch, Target Customer, Why It Works, or Startup Cost—and iterate the rest until it's 100% perfect for you.",
      highlights: [
        "Individual ✓ Approve checkboxes on all 5 card facets",
        "1-click 'Iterate Unchecked Parts' keeps your approved choices locked",
        "Approve All 5/5 button when your business model is ready to launch",
      ],
      ctaLabel: "Try Idea Card Approval →",
      ctaTo: "/dashboard/idea-wizard",
      accentBg: "bg-mint",
      icon: CheckCircle2,
    },
    {
      num: "BENEFIT 03",
      badge: "Tri-Core Neural Engine + Slide-Out Notebook",
      title: "Vanguard-X™ Sovereign AI Advisor & Founder Notebook",
      subtitle: "Click any advice to save & freely edit in your slide-out drawer",
      description:
        "Meet Vanguard-X™, our sovereign executive intelligence built specifically for founders. When Vanguard-X™ gives you a winning pricing or growth strategy, click directly on any paragraph to save it into your slide-out Founder Notebook—and edit your notes anytime.",
      highlights: [
        "Tri-Core Strategy, Revenue & Execution synthesis (no generic chat)",
        "1-click paragraph saving straight into your Slide-Out Notebook",
        "Freely edit note titles, action checklists & copy anywhere on the site",
      ],
      ctaLabel: "Ask Vanguard-X™ Now →",
      ctaTo: "/advisor",
      notebookAction: true,
      accentBg: "bg-sun",
      icon: Brain,
    },
    {
      num: "BENEFIT 04",
      badge: "Real Numbers + Actionable Playbook",
      title: "Interactive Income Simulator & First $1,000 Playbook",
      subtitle: "See how few clients you need to replace your 9-to-5 income",
      description:
        "Dial in your monthly income goal and package price to see your annual take-home pay, clients needed per week, and Freedom Score—then follow the 3-step First $1,000 Income Playbook on your dashboard to land your first paying customer fast.",
      highlights: [
        "Live interactive sliders + 4 proven high-margin business presets",
        "Shows exact clients/month & clients/week needed to hit your goal",
        "Step-by-step First $1,000 Playbook built right into your Dashboard",
      ],
      ctaLabel: "Calculate My Income ↓",
      ctaHref: "#income-freedom-calculator",
      secondaryLabel: "Open Dashboard Playbook",
      secondaryTo: "/dashboard",
      accentBg: "bg-mint",
      icon: DollarSign,
    },
    {
      num: "BENEFIT 05",
      badge: "Step 1 ➔ Step 2 ➔ Step 3 Connected Flow",
      title: "Guided Step-by-Step Path & Founder Motivation",
      subtitle: "Zero guesswork—each step leads directly into the next",
      description:
        "Building your own income should feel exciting, not overwhelming! Every screen features clear 'Step 1 ➔ Step 2 ➔ Step 3' handoffs and motivational milestones celebrating Day 1 of your financial independence.",
      highlights: [
        "Connected 3-step & 4-phase roadmaps across every page and tool",
        "Encouragement banners above Step 3 right when you're ready to go live",
        "Built for first-time founders—no coding or MBA required",
      ],
      ctaLabel: "Start Step 1 Now ↓",
      ctaHref: "#quick-start-section",
      accentBg: "bg-cream",
      icon: Compass,
    },
    {
      num: "BENEFIT 06",
      badge: "13 AI Engines · 0% Platform Fees",
      title: "13 Connected Income Engines & 100% Your Revenue",
      subtitle: "Answer 8 questions once—get your entire business in 60 seconds",
      description:
        "Your intake answers flow automatically through all 13 AI engines: Idea Wizard, Name, 5-Year Business Plan, Brand Voice, Color/Font System, Vector Logos, Live Website, Ads, 30-Day Social, Legal Checklist, Funding Grants, Customer CRM, and Vanguard-X™.",
      highlights: [
        "Keep 100% of every dollar you earn—zero platform commissions",
        "Replaces $15,000+ of agency, copywriting & web dev retainers",
        "14-day 100% money-back guarantee & 1-click cancellation anytime",
      ],
      ctaLabel: "View All-Access Pass →",
      ctaTo: "/pricing",
      accentBg: "bg-sun",
      icon: Zap,
    },
  ];

  return (
    <section
      id="platform-benefits"
      className={`border-b-[3px] border-ink bg-paper ${compact ? "py-12" : "py-20"} px-4 md:px-8`}
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-ink bg-ink px-3.5 py-1.5 text-xs font-black uppercase tracking-widest text-sun shadow-[3px_3px_0px_#79e784]">
              <Sparkles className="h-4 w-4 text-mint" /> Why Founders Choose 1-Click Launch · 6 Signature Benefits
            </div>
            <h2 className="display mt-4 text-5xl leading-[0.92] sm:text-6xl md:text-7xl">
              Everything Built to Launch Your{" "}
              <mark className="bg-mint px-2 text-ink">Financial Independence.</mark>
            </h2>
          </div>

          <div className="max-w-md border-2 border-ink bg-cream p-4 shadow-[4px_4px_0px_#000]">
            <p className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-700" strokeWidth={2.5} /> Built for Real Income Ownership
            </p>
            <p className="mt-1 text-xs sm:text-sm font-bold text-ink/85 leading-relaxed">
              Every upgrade below is included in your workspace so you can go from raw idea to a live, revenue-ready business with <strong>zero coding</strong> and <strong>100% ownership</strong>.
            </p>
          </div>
        </div>

        {/* Fast Value Pill Strip */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Free Live Site + App Studio", sub: "Unlimited iterations + SSL" },
            { label: "Per-Facet ✓ Idea Approval", sub: "Lock what works, iterate rest" },
            { label: "Vanguard-X™ Sovereign AI", sub: "Tri-Core co-founder brain" },
            { label: "Slide-Out Founder Notebook", sub: "1-click save & free editing" },
            { label: "Income Freedom Simulator", sub: "First $1,000 Playbook" },
            { label: "Keep 100% of Your Revenue", sub: "Zero platform commissions" },
          ].map((pill) => (
            <div
              key={pill.label}
              className="b3 bg-cream p-3 flex flex-col justify-between shadow-[3px_3px_0px_#000]"
            >
              <span className="flex items-center gap-1.5 text-xs font-black text-ink leading-tight">
                <span className="grid h-4 w-4 shrink-0 place-items-center bg-mint border border-ink">
                  <Check className="h-2.5 w-2.5 text-ink" strokeWidth={4} />
                </span>
                {pill.label}
              </span>
              <span className="mt-1.5 text-[11px] font-bold text-muted pl-5">
                {pill.sub}
              </span>
            </div>
          ))}
        </div>

        {/* 6 Signature Benefit Cards Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.num}
                className="b3 hard flex flex-col justify-between bg-cream p-6 transition-transform hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3">
                    <span
                      className={`border-2 border-ink px-2.5 py-1 text-xs font-black uppercase tracking-wider text-ink ${b.accentBg}`}
                    >
                      {b.num}
                    </span>
                    <span className="bg-ink px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-sun">
                      {b.badge}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="mt-4 flex items-start gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center border-2 border-ink ${b.accentBg} shadow-[2px_2px_0px_#000]`}
                    >
                      <Icon className="h-5 w-5 text-ink" strokeWidth={2.5} />
                    </span>
                    <div>
                      <h3 className="display text-2xl leading-tight text-ink">
                        {b.title}
                      </h3>
                      <p className="mt-0.5 text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                        {b.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3.5 text-xs sm:text-sm font-semibold leading-relaxed text-ink/85">
                    {b.description}
                  </p>

                  {/* Bullet Highlights */}
                  <ul className="mt-4 space-y-2 border-t-2 border-dashed border-ink/25 pt-3.5 text-xs font-bold text-ink">
                    {b.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center border border-ink bg-mint text-ink">
                          <Check className="h-2.5 w-2.5" strokeWidth={4} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Footer */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t-2 border-ink pt-4">
                  {b.ctaHref ? (
                    <a
                      href={b.ctaHref}
                      className="btn btn-sm btn-yellow flex-1 justify-between text-xs font-black"
                    >
                      <span>{b.ctaLabel}</span>
                    </a>
                  ) : (
                    <Link
                      to={b.ctaTo!}
                      className="btn btn-sm btn-yellow flex-1 justify-between text-xs font-black"
                    >
                      <span>{b.ctaLabel}</span>
                    </Link>
                  )}

                  {b.secondaryTo && (
                    <Link
                      to={b.secondaryTo}
                      className="btn btn-sm btn-quiet text-xs font-black"
                    >
                      {b.secondaryLabel}
                    </Link>
                  )}

                  {b.notebookAction && (
                    <button
                      type="button"
                      onClick={() => openNotebook()}
                      className="btn btn-sm bg-mint text-ink text-xs font-black cursor-pointer flex items-center gap-1.5"
                    >
                      <BookOpen className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Open Notebook ({notes.length})
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom High-Energy Callout Banner */}
        <div className="b3 hard mt-10 bg-ink p-6 md:p-8 text-sun flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-mint text-ink px-2.5 py-1 text-xs font-black uppercase tracking-widest border border-sun">
              <Rocket className="h-3.5 w-3.5" strokeWidth={2.5} /> Ready to Own Your Time &amp; Income?
            </span>
            <h3 className="display mt-2 text-3xl sm:text-4xl text-sun">
              All 6 Signature Benefits Are Live in Your Workspace Right Now.
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-bold text-cream/90">
              Start with Step 1 for free, approve your ideal business card facets, build your creative live website, and let Vanguard-X™ guide you to your first paying customers!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="#quick-start-section"
              className="btn btn-yellow border-sun text-ink font-black"
            >
              <Rocket className="h-4 w-4 fill-ink" /> Start Step 1 Free
            </a>
            <Link
              to="/dashboard"
              className="btn bg-mint text-ink border-sun font-black"
            >
              Open My Dashboard <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
