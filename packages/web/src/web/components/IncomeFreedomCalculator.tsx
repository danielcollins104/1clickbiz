import { useState } from "react";
import { useLocation } from "wouter";
import {
  TrendingUp,
  DollarSign,
  Rocket,
  Sparkles,
  Check,
  Clock,
  ArrowRight,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import { PRESETS } from "./QuickStartModal";
import { useCreateBusiness, useSession } from "../queries/business";
import { setLocalSession } from "../lib/auth";
import { money } from "../lib/format";

interface IncomePath {
  id: string;
  presetId: string;
  name: string;
  icon: string;
  badge: string;
  unitName: string;
  avgPricePerClient: number;
  minClients: number;
  maxClients: number;
  defaultClients: number;
  hoursPerClient: number;
  whyItWorks: string;
  firstSaleTip: string;
}

const INCOME_PATHS: IncomePath[] = [
  {
    id: "ai-agency",
    presetId: "ai-agency",
    name: "AI Automation & Lead-Capture Agency",
    icon: "🤖",
    badge: "High-Ticket Recurring",
    unitName: "monthly retainer clients",
    avgPricePerClient: 1250,
    minClients: 1,
    maxClients: 20,
    defaultClients: 5,
    hoursPerClient: 3,
    whyItWorks:
      "Local businesses gladly pay $1,000–$1,500/mo when your automated system saves them missed calls and books high-ticket jobs.",
    firstSaleTip:
      "Offer a 7-day free trial of missed-call text-back to 5 local contractors using your live website calculator.",
  },
  {
    id: "home-services",
    presetId: "home-services",
    name: "Premium Local Home / Mobile Service",
    icon: "🏡",
    badge: "Fastest Cash Flow",
    unitName: "booked jobs / month",
    avgPricePerClient: 280,
    minClients: 5,
    maxClients: 60,
    defaultClients: 22,
    hoursPerClient: 2,
    whyItWorks:
      "Homeowners pay immediately upon completion, and your built-in instant quote calculator turns website visitors into booked jobs.",
    firstSaleTip:
      "Post your free live website link in 3 neighborhood Facebook/Nextdoor groups with a 'Founding Neighbor $50 Off' offer.",
  },
  {
    id: "b2b-consulting",
    presetId: "b2b-consulting",
    name: "B2B Consulting & Fractional Advisory",
    icon: "📈",
    badge: "95% Profit Margin",
    unitName: "active retainer clients",
    avgPricePerClient: 2000,
    minClients: 1,
    maxClients: 12,
    defaultClients: 4,
    hoursPerClient: 4,
    whyItWorks:
      "Zero inventory or startup overhead—package the skills you already have into a structured monthly advisory offer.",
    firstSaleTip:
      "Send your AI-generated 3-step Cold Outreach sequence (Tool #14) to 15 founders on LinkedIn this week.",
  },
  {
    id: "artisan-bakery",
    presetId: "artisan-bakery",
    name: "Local Subscription Box / Artisan Goods",
    icon: "🥐",
    badge: "Predictable Weekly Cash",
    unitName: "monthly subscribers",
    avgPricePerClient: 68,
    minClients: 15,
    maxClients: 250,
    defaultClients: 85,
    hoursPerClient: 0.3,
    whyItWorks:
      "Customers pre-pay every month for recurring weekly drops, giving you guaranteed upfront cash flow and zero waste.",
    firstSaleTip:
      "Open 25 'Founding Member' subscription spots on your live website and share with friends & local foodies.",
  },
  {
    id: "fitness-coaching",
    presetId: "fitness-coaching",
    name: "Online Coaching & Transformation Club",
    icon: "⚡",
    badge: "Work From Anywhere",
    unitName: "active coaching members",
    avgPricePerClient: 295,
    minClients: 5,
    maxClients: 80,
    defaultClients: 20,
    hoursPerClient: 1.2,
    whyItWorks:
      "Deliver 1-to-many accountability and structured programs online from your laptop with recurring monthly memberships.",
    firstSaleTip:
      "Invite 10 people to a '14-Day Kickstart Challenge' hosted right on your free live website.",
  },
  {
    id: "custom",
    presetId: "custom",
    name: "Custom (My Own Business Idea)",
    icon: "✨",
    badge: "Custom Business Model",
    unitName: "customers / sales per month",
    avgPricePerClient: 350,
    minClients: 1,
    maxClients: 100,
    defaultClients: 15,
    hoursPerClient: 2,
    whyItWorks:
      "Our 13 AI engines adapt to any custom product, service, or local business—automatically building your tailored pricing, brand, and live website.",
    firstSaleTip:
      "Launch your free live website with an interactive quote/booking form and share your Founding Offer with your first 10 prospects.",
  },
];

export function IncomeFreedomCalculator() {
  const [, navigate] = useLocation();
  const { data: session } = useSession();
  const createBusiness = useCreateBusiness();

  const [selectedPathId, setSelectedPathId] = useState<string>(INCOME_PATHS[0]!.id);
  const [clientCount, setClientCount] = useState<number>(INCOME_PATHS[0]!.defaultClients);
  const [customIdeaText, setCustomIdeaText] = useState<string>("");
  const [customPricePerSale, setCustomPricePerSale] = useState<number>(350);
  const [isLaunching, setIsLaunching] = useState(false);

  const activePath =
    INCOME_PATHS.find((p) => p.id === selectedPathId) ?? INCOME_PATHS[0]!;
  const isCustom = activePath.id === "custom";
  const effectivePricePerClient = isCustom
    ? Math.max(10, customPricePerSale)
    : activePath.avgPricePerClient;

  const monthlyIncome = Math.round(clientCount * effectivePricePerClient);
  const yearlyIncome = monthlyIncome * 12;
  const estHoursPerWeek = Math.max(
    4,
    Math.min(45, Math.round((clientCount * activePath.hoursPerClient) / 4))
  );
  const hourlyEquivalent = Math.round(monthlyIncome / (estHoursPerWeek * 4));

  const freedomLevel =
    yearlyIncome >= 120000
      ? "🏆 Full Financial Independence & Wealth Builder"
      : yearlyIncome >= 65000
      ? "🚀 Replace Your 9-to-5 Paycheck & Be Your Own Boss"
      : "💰 High-Margin Side Income & Freedom Fund";

  const handleSelectPath = (path: IncomePath) => {
    setSelectedPathId(path.id);
    setClientCount(path.defaultClients);
  };

  const handleLaunchIncomeModel = async () => {
    setIsLaunching(true);
    try {
      if (!session) {
        setLocalSession({
          email: "danielcollins104@gmail.com",
          name: "Daniel Collins",
        });
      }
      const matchedPreset =
        PRESETS.find((p) => p.id === activePath.presetId) ?? PRESETS[0]!;
      const intakeToLaunch =
        isCustom && customIdeaText.trim()
          ? {
              ...matchedPreset.intake,
              idea: `${customIdeaText.trim()} (Target package price: $${effectivePricePerClient})`,
            }
          : matchedPreset.intake;

      const res = await createBusiness.mutateAsync(intakeToLaunch);
      setTimeout(() => {
        setIsLaunching(false);
        navigate(`/dashboard?b=${res.id}`);
      }, 350);
    } catch {
      setIsLaunching(false);
      navigate("/start");
    }
  };

  return (
    <section
      id="income-freedom-calculator"
      className="border-b-[3px] border-ink bg-ink text-paper py-20 px-4 md:px-8"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b-[3px] border-sun/30">
          <div>
            <span className="inline-flex items-center gap-2 bg-mint text-ink px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-ink shadow-[3px_3px_0px_#fde047]">
              <Sparkles className="h-3.5 w-3.5 fill-ink" /> Interactive Financial Independence Simulator
            </span>
            <h2 className="display mt-4 text-4xl sm:text-6xl md:text-7xl text-sun leading-[1.12]">
              See How Fast Your New Business Replaces Your Paycheck.
            </h2>
            <p className="mt-3 max-w-3xl text-base sm:text-lg font-bold text-cream/85">
              You don’t need hundreds of customers to change your life. Pick a business model below (or choose <strong>Custom</strong>) and slide the customer counter to see how few sales it takes to create <strong>your own independent income stream</strong>.
            </p>
          </div>

          <div className="bg-sun text-ink p-4 border-[3px] border-ink shadow-[4px_4px_0px_#79e784] shrink-0">
            <p className="text-[11px] font-black uppercase tracking-wider">
              The 1-Customer Rule:
            </p>
            <p className="font-black text-sm sm:text-base mt-0.5">
              Just <span className="underline decoration-2">1 customer</span> pays for your entire membership!
            </p>
          </div>
        </div>

        {/* Main Interactive Grid */}
        <div className="mt-10 grid gap-8 lg:grid-cols-12 items-stretch">
          {/* Left Column: Pick Business Path + Slider */}
          <div className="lg:col-span-7 bg-paper text-ink border-[3px] border-sun p-6 md:p-8 shadow-[8px_8px_0px_#fde047] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-black uppercase tracking-widest text-muted">
                  1. Pick Your Income Vehicle:
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectPath(INCOME_PATHS.find((p) => p.id === "custom")!)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase border-2 border-ink cursor-pointer transition-all ${
                    isCustom
                      ? "bg-ink text-sun shadow-[2px_2px_0px_#79e784]"
                      : "bg-mint text-ink hover:bg-sun"
                  }`}
                >
                  <Pencil className="h-3 w-3" /> + Custom Business
                </button>
              </div>

              <p className="display text-lg sm:text-xl text-ink mb-3">
                My business is most like (choose a business below)
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {INCOME_PATHS.map((path) => {
                  const active = path.id === activePath.id;
                  return (
                    <button
                      key={path.id}
                      type="button"
                      onClick={() => handleSelectPath(path)}
                      className={`text-left p-3.5 border-[2.5px] border-ink transition-all cursor-pointer flex items-start gap-3 ${
                        active
                          ? "bg-sun shadow-[4px_4px_0px_#000] -translate-y-0.5"
                          : path.id === "custom"
                          ? "bg-mint/25 hover:bg-mint/40 border-dashed"
                          : "bg-cream/60 hover:bg-cream"
                      }`}
                    >
                      <span className="text-2xl leading-none mt-0.5">{path.icon}</span>
                      <div className="min-w-0">
                        <span className="inline-block bg-ink text-sun px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider mb-1">
                          {path.badge}
                        </span>
                        <p className="text-xs sm:text-sm font-black leading-tight text-ink">
                          {path.name}
                        </p>
                        <p className="text-[11px] font-bold text-ink/70 mt-0.5">
                          {path.id === "custom"
                            ? `Custom price (${money(customPricePerSale)} per sale/client)`
                            : `Avg. ${money(path.avgPricePerClient)} per sale/client`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Business Idea & Custom Price Inputs when 'Custom' is chosen */}
              {isCustom && (
                <div className="mt-4 border-[2.5px] border-ink bg-mint/25 p-4 space-y-3 shadow-[3px_3px_0px_#000] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-ink">
                      ✨ Customize Your Own Business Vehicle
                    </span>
                    <span className="bg-ink text-sun px-2 py-0.5 text-[10px] font-black uppercase">
                      Custom Mode Active
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-12">
                    <div className="sm:col-span-7">
                      <label
                        htmlFor="custom-income-idea"
                        className="block text-[11px] font-black uppercase tracking-wider text-ink"
                      >
                        Describe your custom business or idea:
                      </label>
                      <input
                        id="custom-income-idea"
                        type="text"
                        value={customIdeaText}
                        onChange={(e) => setCustomIdeaText(e.target.value)}
                        placeholder="e.g., Mobile dog grooming, custom woodworking, AI bookkeeping…"
                        className="input mt-1 bg-paper text-sm font-bold"
                      />
                    </div>
                    <div className="sm:col-span-5">
                      <label
                        htmlFor="custom-income-price"
                        className="block text-[11px] font-black uppercase tracking-wider text-ink"
                      >
                        Avg. Price Per Sale / Client ($):
                      </label>
                      <input
                        id="custom-income-price"
                        type="number"
                        min={10}
                        max={25000}
                        step={10}
                        value={customPricePerSale}
                        onChange={(e) =>
                          setCustomPricePerSale(Math.max(10, Number(e.target.value) || 10))
                        }
                        className="input mt-1 bg-paper text-sm font-black"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Slider */}
            <div className="b3 bg-cream p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="freedom-client-slider"
                  className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink"
                >
                  2. Slide to Choose Your Monthly Customer Goal:
                </label>
                <span className="bg-ink text-sun px-3 py-1 text-sm sm:text-base font-black border-2 border-ink shadow-[2px_2px_0px_#79e784]">
                  {clientCount} {activePath.unitName}
                </span>
              </div>

              <input
                id="freedom-client-slider"
                type="range"
                min={activePath.minClients}
                max={activePath.maxClients}
                value={clientCount}
                onChange={(e) => setClientCount(Number(e.target.value))}
                className="w-full h-3 bg-white border-2 border-ink accent-ink cursor-pointer"
              />

              <div className="flex justify-between text-[11px] font-black uppercase text-muted">
                <span>Starter ({activePath.minClients} {activePath.unitName})</span>
                <span>Sweet Spot ({activePath.defaultClients})</span>
                <span>Scale ({activePath.maxClients} {activePath.unitName})</span>
              </div>
            </div>

            {/* Why It Works + Fast First Sale Tip */}
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              <div className="border-2 border-ink bg-white p-3.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                  ✓ Why This Creates Fast Income
                </p>
                <p className="text-xs font-bold text-ink/85 mt-1 leading-relaxed">
                  {activePath.whyItWorks}
                </p>
              </div>
              <div className="border-2 border-ink bg-mint/30 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-ink">
                  ⚡ How You Get Customer #1 This Week
                </p>
                <p className="text-xs font-bold text-ink/90 mt-1 leading-relaxed">
                  {activePath.firstSaleTip}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Financial Independence Scoreboard */}
          <div className="lg:col-span-5 bg-sun text-ink border-[3px] border-ink p-6 md:p-8 shadow-[8px_8px_0px_#79e784] flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink pb-4">
                <span className="bg-ink text-sun px-2.5 py-1 text-xs font-black uppercase tracking-wider">
                  Your Projected Freedom Numbers
                </span>
                <span className="text-xs font-black uppercase flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" /> You Keep 100%
                </span>
              </div>

              <div className="mt-6 bg-ink text-sun p-5 border-[3px] border-ink shadow-[4px_4px_0px_#000]">
                <p className="text-xs font-black uppercase tracking-widest text-mint">
                  Projected Monthly Business Income
                </p>
                <p className="display text-5xl sm:text-6xl md:text-7xl text-sun mt-1 leading-[1.08]">
                  ${monthlyIncome.toLocaleString()}
                  <span className="font-sans text-lg font-black text-cream/80">/mo</span>
                </p>
                <div className="mt-3 pt-3 border-t border-sun/20 flex flex-wrap items-center justify-between gap-2 text-xs font-black">
                  <span className="text-cream">
                    Annual Run Rate: <strong className="text-mint">${yearlyIncome.toLocaleString()}/yr</strong>
                  </span>
                  <span className="bg-mint text-ink px-2 py-0.5">
                    ~${hourlyEquivalent}/hr effective rate
                  </span>
                </div>
              </div>

              {/* Freedom Milestone Pill */}
              <div className="mt-4 bg-paper border-2 border-ink p-3.5 shadow-[3px_3px_0px_#000]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                  Financial Independence Status:
                </p>
                <p className="text-xs sm:text-sm font-black text-ink mt-0.5">
                  {freedomLevel}
                </p>
              </div>

              {/* Key Metrics Breakdown */}
              <ul className="mt-5 space-y-2.5 text-xs sm:text-sm font-black">
                <li className="flex items-center justify-between border-b border-ink/20 pb-2">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Estimated Time Commitment:
                  </span>
                  <span className="bg-paper px-2 py-0.5 border border-ink">
                    ~{estHoursPerWeek} hrs / week
                  </span>
                </li>
                <li className="flex items-center justify-between border-b border-ink/20 pb-2">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Free Live Website &amp; CRM Hosting:
                  </span>
                  <span className="bg-mint px-2 py-0.5 border border-ink">
                    $0 / Free Forever
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Check className="h-4 w-4 stroke-[3]" /> All 13 AI Business Engines:
                  </span>
                  <span>Ready in 60 Seconds</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 pt-4 border-t-[3px] border-ink">
              <button
                type="button"
                disabled={isLaunching}
                onClick={handleLaunchIncomeModel}
                className="btn bg-ink text-sun hover:bg-neutral-900 w-full text-sm sm:text-base font-black py-4 border-[2.5px] border-ink shadow-[4px_4px_0px_#79e784] cursor-pointer justify-center"
              >
                <Rocket className="h-5 w-5 text-mint" />
                <span>
                  {isLaunching
                    ? "Building Your Income Engine…"
                    : `Launch This $${monthlyIncome.toLocaleString()}/mo Model in 1-Click`}
                </span>
                <ArrowRight className="h-4 w-4 text-sun" />
              </button>

              <p className="text-[11px] font-extrabold text-center text-ink/80 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  100% Founder Ownership · 14-Day Money-Back Guarantee · Cancel Anytime
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
