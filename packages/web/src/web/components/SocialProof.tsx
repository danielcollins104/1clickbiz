import { useState, useEffect, useRef } from "react";
import {
  Star,
  Quote,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  MapPin,
  Pause,
  Play,
} from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  business: string;
  category: "E-Commerce & DTC" | "B2B & Consulting" | "Local & Services" | "Health & Wellness";
  location: string;
  avatarBg: string;
  avatarFg: string;
  initials: string;
  metric: string;
  metricLabel: string;
  timeToLaunch: string;
  rating: number;
  quote: string;
  toolsUsed: string[];
  presetId: string;
  highlight: string;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "elena",
    name: "Elena Rostova",
    role: "Founder & Head Baker",
    business: "Kinship Hearth Bread Co.",
    category: "Local & Services",
    location: "Denver, Colorado",
    avatarBg: "bg-[#c85a32]",
    avatarFg: "text-white",
    initials: "ER",
    metric: "$14.8k MRR",
    metricLabel: "260+ active weekly sourdough subscribers",
    timeToLaunch: "1m 42s",
    rating: 5,
    quote:
      "I was terrified of branding and websites. 1 Click Business generated our logo, color palette, and live landing page in under two minutes. We hit 40 paid subscribers before our first oven bake.",
    toolsUsed: ["Idea Wizard", "Logo Studio", "Instant Website", "Lead CRM"],
    presetId: "artisan-bakery",
    highlight: "Saved $4,500 on agency design retainers",
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "Managing Partner",
    business: "Apex RevOps & Systems",
    category: "B2B & Consulting",
    location: "San Francisco, CA",
    avatarBg: "bg-[#1A48F5]",
    avatarFg: "text-white",
    initials: "MV",
    metric: "$32.5k / mo",
    metricLabel: "5 monthly executive retainers closed",
    timeToLaunch: "2m 10s",
    rating: 5,
    quote:
      "The 5-year business plan and positioning were so articulate that I literally pasted the strategic copy into an executive proposal that afternoon. Signed our first $6.5k client within 48 hours.",
    toolsUsed: ["Business Plan", "Brand Generator", "Ad Creative", "AI Advisor"],
    presetId: "b2b-consulting",
    highlight: "First $6.5k retainer signed in 48 hours",
  },
  {
    id: "maya",
    name: "Maya & Liam Lin",
    role: "Co-Founders",
    business: "TerraCycle Living",
    category: "E-Commerce & DTC",
    location: "Portland, Oregon",
    avatarBg: "bg-[#2D5A27]",
    avatarFg: "text-white",
    initials: "ML",
    metric: "1,420+ Orders",
    metricLabel: "38% customer repeat purchase rate",
    timeToLaunch: "1m 55s",
    rating: 5,
    quote:
      "The 14-day social post schedule with ready-made captions and targeted ad copy gave us immediate traction. We saved thousands on marketing fees and launched weeks before our competitors.",
    toolsUsed: ["Name Generator", "Color System", "Social Machine", "Instant Website"],
    presetId: "eco-dtc",
    highlight: "Zero waste goods launched in under 2 mins",
  },
  {
    id: "darius",
    name: "Darius Cole",
    role: "Head Coach & Founder",
    business: "PulseFit Conditioning",
    category: "Health & Wellness",
    location: "Miami, Florida",
    avatarBg: "bg-[#d97706]",
    avatarFg: "text-white",
    initials: "DC",
    metric: "68 Active Clients",
    metricLabel: "$240 avg. monthly coaching value",
    timeToLaunch: "1m 30s",
    rating: 5,
    quote:
      "I spent three months trying to build a website and gave up. With 1 Click Business, I answered 8 questions on my phone and had a live client portal and Facebook ads running that night.",
    toolsUsed: ["Idea Wizard", "Instant Website", "Ad Creative", "Lead CRM"],
    presetId: "fitness-coaching",
    highlight: "From idea to live client portal the same evening",
  },
  {
    id: "sofia",
    name: "Sofia Morales",
    role: "Founder & Formulator",
    business: "NaturaSkin Botanicals",
    category: "E-Commerce & DTC",
    location: "Austin, Texas",
    avatarBg: "bg-[#9333ea]",
    avatarFg: "text-white",
    initials: "SM",
    metric: "$21.4k Mo 1",
    metricLabel: "68% gross profit margin protected",
    timeToLaunch: "1m 48s",
    rating: 5,
    quote:
      "The Gemini Advisor gave me math-backed unit economics that saved me from underpricing my product line. Having deterministic business tools linked to a live AI coach is pure magic.",
    toolsUsed: ["Business Plan", "Logo Studio", "AI Advisor", "Pitch Deck"],
    presetId: "eco-dtc",
    highlight: "Protected 68% gross margin with AI pricing models",
  },
];

const CATEGORIES = ["All", "E-Commerce & DTC", "B2B & Consulting", "Local & Services", "Health & Wellness"] as const;

export function SocialProof() {
  const { openQuickStart } = useQuickStart();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = selectedCategory === "All"
    ? TESTIMONIALS
    : TESTIMONIALS.filter((t) => t.category === selectedCategory);

  const currentStory = filtered[activeIndex] || filtered[0] || TESTIMONIALS[0]!;

  // Handle auto-rotation
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, filtered.length]);

  // Reset active index when category changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setActiveIndex(0);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % filtered.length);
  };

  return (
    <section className="border-b-[3px] border-ink bg-paper py-20 px-4 md:px-8 overflow-hidden">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-6 border-b-[3px] border-ink pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 border-[2px] border-ink bg-sun px-3 py-1 text-xs font-black uppercase tracking-wider text-ink shadow-[2px_2px_0px_#000]">
              <Sparkles className="h-3.5 w-3.5 fill-ink" />
              <span>Verified Customer Social Proof</span>
            </div>
            <h2 className="display mt-3 text-5xl md:text-7xl">
              Trusted by 10,000+ Founders.
            </h2>
            <p className="mt-2 text-base font-bold text-muted md:text-lg max-w-2xl">
              Real creators who skipped the $5,000 agency retainers, answered eight questions, and launched profitable businesses in minutes.
            </p>
          </div>

          {/* Social Proof Trust Statistics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border-2 border-ink bg-cream p-3 b3 shadow-[3px_3px_0px_#000]">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                4.9 / 5.0 (1,240+ Reviews)
              </span>
            </div>

            <div className="flex items-center gap-2 border-2 border-ink bg-mint p-3 b3 shadow-[3px_3px_0px_#000]">
              <ShieldCheck className="h-5 w-5 text-ink" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                Stripe Verified Founders
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter & Rotation Controls */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 border-ink transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-ink text-sun shadow-[2px_2px_0px_#000]"
                    : "bg-paper text-ink hover:bg-cream"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="btn btn-sm btn-quiet !px-2.5 py-1 text-xs font-black uppercase flex items-center gap-1.5"
              title={isPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-ink" /> : <Pause className="h-3.5 w-3.5 fill-ink" />}
              <span className="hidden sm:inline">{isPaused ? "Resume" : "Auto-Rotating"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrev}
              className="h-9 w-9 border-2 border-ink bg-paper hover:bg-sun grid place-items-center shadow-[2px_2px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={3} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="h-9 w-9 border-2 border-ink bg-paper hover:bg-sun grid place-items-center shadow-[2px_2px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Featured Testimonial Spotlight Card */}
        <div
          className="mt-6 border-[3px] border-ink bg-ink text-sun p-6 md:p-10 b3 shadow-[8px_8px_0px_#000] relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Subtle background decoration */}
          <div className="absolute top-4 right-4 text-sun/10 hidden md:block">
            <Quote className="h-28 w-28" />
          </div>

          <div className="grid gap-8 lg:grid-cols-12 items-center relative z-10">
            {/* Left Story Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Star Rating & Category Chip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex text-amber-400">
                  {[...Array(currentStory.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="border border-sun bg-mint px-2 py-0.5 text-xs font-black uppercase text-ink">
                  {currentStory.category}
                </span>
                <span className="text-xs font-bold text-cream/70 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-mint" /> Built in {currentStory.timeToLaunch}
                </span>
              </div>

              {/* The Quote */}
              <blockquote className="display text-2xl md:text-4xl text-sun leading-snug">
                "{currentStory.quote}"
              </blockquote>

              {/* Founder Profile Details */}
              <div className="flex items-center gap-4 pt-2">
                <div
                  className={`h-14 w-14 rounded-full border-[3px] border-sun ${currentStory.avatarBg} ${currentStory.avatarFg} font-black text-xl grid place-items-center shadow-[3px_3px_0px_#fde047] shrink-0`}
                >
                  {currentStory.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-black text-sun">
                      {currentStory.name}
                    </h3>
                    <span className="text-mint flex items-center gap-0.5 text-xs font-bold" title="Verified Customer">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Verified Founder</span>
                    </span>
                  </div>
                  <p className="text-xs font-bold text-cream">
                    {currentStory.role} · <strong className="text-sun">{currentStory.business}</strong>
                  </p>
                  <p className="text-[11px] font-semibold text-cream/60 flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {currentStory.location}
                  </p>
                </div>
              </div>

              {/* Tools Used Badge Strip */}
              <div className="space-y-2 pt-2 border-t border-sun/20">
                <p className="text-[10px] font-black uppercase tracking-wider text-cream/60">
                  Engines Used To Launch:
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentStory.toolsUsed.map((tool) => (
                    <span
                      key={tool}
                      className="border border-sun/40 bg-sun/10 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-sun"
                    >
                      ✓ {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Metric Callout Box */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="border-[3px] border-sun bg-[#18181b] p-6 text-sun shadow-[6px_6px_0px_#79e784]">
                <p className="text-xs font-black uppercase tracking-widest text-mint flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4" /> Verified Commercial Milestone
                </p>
                <p className="display text-4xl md:text-5xl text-sun mt-2">
                  {currentStory.metric}
                </p>
                <p className="text-sm font-bold text-cream mt-1">
                  {currentStory.metricLabel}
                </p>
                <div className="mt-4 pt-3 border-t border-sun/30 flex items-center gap-2 text-xs font-bold text-cream/80">
                  <span className="inline-block h-2 w-2 rounded-full bg-mint" />
                  <span>{currentStory.highlight}</span>
                </div>
              </div>

              {/* Action Trigger to Test Their Stack */}
              <button
                type="button"
                onClick={() => openQuickStart(currentStory.presetId)}
                className="btn btn-yellow border-sun w-full py-3.5 flex items-center justify-center gap-2 text-sm font-black uppercase cursor-pointer"
                style={{ boxShadow: "5px 5px 0 #3b74ff" }}
              >
                <Zap className="h-4 w-4" strokeWidth={3} /> Launch Stack Like {currentStory.name.split(" ")[0]}'s
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip: Switch Testimonial On-Click */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {filtered.map((item, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`p-3 border-2 text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "border-ink bg-sun shadow-[4px_4px_0px_#000] -translate-y-1"
                    : "border-ink/60 bg-paper hover:bg-cream hover:border-ink hover:shadow-[2px_2px_0px_#000]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`h-7 w-7 rounded-full text-xs font-black grid place-items-center border border-ink ${item.avatarBg} ${item.avatarFg}`}
                  >
                    {item.initials}
                  </div>
                  <span className="text-xs font-black truncate">{item.name}</span>
                </div>
                <p className="text-[11px] font-bold text-muted truncate">{item.business}</p>
                <p className="text-xs font-black text-emerald-800 mt-1">{item.metric}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
