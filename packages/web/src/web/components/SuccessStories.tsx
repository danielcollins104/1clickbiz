import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  Sparkles,
  ArrowUpRight,
  Zap,
  TrendingUp,
  Palette,
  Layers,
  Building2,
  Quote,
  ArrowRight,
  X,
  Clock,
  MapPin,
} from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";

export interface SuccessStory {
  id: string;
  presetId?: string;
  businessName: string;
  category: string;
  founder: string;
  location: string;
  timeToLaunch: string;
  tagline: string;
  elevatorPitch: string;
  intakeAnswers: {
    skills: string;
    budget: string;
    hours: string;
    customer: string;
    tone: string;
  };
  metrics: {
    headline: string;
    sublabel: string;
  };
  palette: { name: string; hex: string }[];
  headingFont: string;
  toolsUsed: string[];
  quote: string;
  slug: string;
}

export const STORIES: SuccessStory[] = [
  {
    id: "story-1",
    presetId: "artisan-bakery",
    businessName: "Kinship Hearth Bread Co.",
    category: "Food & Hospitality",
    founder: "Elena Rostova",
    location: "Denver, Colorado",
    timeToLaunch: "1 min 42 sec",
    tagline: "Slow-fermented organic sourdough, delivered weekly to your doorstep.",
    elevatorPitch: "Small-batch organic micro-bakery offering weekly doorstep sourdough subscriptions and seasonal morning pastry catering.",
    intakeAnswers: {
      skills: "10 years hospitality & baking, sourdough starter craft, catering logistics",
      budget: "$2,000–$10,000",
      hours: "Full-time (35 hrs/wk)",
      customer: "Local families and foodies seeking clean-ingredient artisan sourdough",
      tone: "Warm & Artisanal",
    },
    metrics: {
      headline: "$14.8k MRR",
      sublabel: "260+ active weekly bread subscribers",
    },
    palette: [
      { name: "Terracotta", hex: "#C85A32" },
      { name: "Warm Wheat", hex: "#E8B86D" },
      { name: "Dark Roast", hex: "#261D1A" },
      { name: "Flour Cream", hex: "#FAF6EE" },
      { name: "Sage Grass", hex: "#839774" },
    ],
    headingFont: "Playfair Display",
    toolsUsed: ["Idea Wizard", "Vector Logo", "Landing Page", "CRM Pipeline", "Social Kit"],
    quote: "I was terrified of branding and websites. 1 Click Business created our logo, palette, and live landing page in under two minutes. We hit 40 paid subscribers before our first oven bake.",
    slug: "kinship-hearth",
  },
  {
    id: "story-2",
    presetId: "b2b-consulting",
    businessName: "Apex RevOps & Systems",
    category: "B2B & Consulting",
    founder: "Marcus Vance",
    location: "San Francisco, California",
    timeToLaunch: "2 min 10 sec",
    tagline: "Fractional sales infrastructure & RevOps for seed-to-Series-A SaaS startups.",
    elevatorPitch: "High-leverage operations advisory helping early-stage B2B software founders streamline outbound sales pipelines, HubSpot SOPs, and metrics reporting.",
    intakeAnswers: {
      skills: "12 years B2B SaaS sales engineering, CRM architecture, executive reporting",
      budget: "Under $500",
      hours: "20–40 hrs/wk",
      customer: "Seed and Series-A SaaS founders ($500k–$4M ARR) needing sales systems",
      tone: "Authoritative & Sharp",
    },
    metrics: {
      headline: "$32.5k / mo",
      sublabel: "5 active monthly retainers closed",
    },
    palette: [
      { name: "Cobalt", hex: "#1A48F5" },
      { name: "Deep Ink", hex: "#0B0F19" },
      { name: "Neon Mint", hex: "#00E599" },
      { name: "Slate Mist", hex: "#E2E8F0" },
      { name: "Ice Pure", hex: "#FFFFFF" },
    ],
    headingFont: "Archivo Black",
    toolsUsed: ["Business Plan", "Brand Generator", "Ad Generator", "AI Advisor"],
    quote: "The 5-year lean business plan and brand tone were so articulate that I literally pasted the positioning into an executive proposal that same afternoon. Signed my first $6.5k retainer within 48 hours.",
    slug: "apex-revops",
  },
  {
    id: "story-3",
    presetId: "eco-dtc",
    businessName: "TerraCycle Living",
    category: "E-Commerce & DTC",
    founder: "Maya & Liam Lin",
    location: "Portland, Oregon",
    timeToLaunch: "1 min 55 sec",
    tagline: "Minimalist everyday lifestyle essentials crafted from 100% circular materials.",
    elevatorPitch: "Direct-to-consumer store providing thoughtfully designed zero-waste home goods, organic cotton linens, and refillable personal care essentials.",
    intakeAnswers: {
      skills: "Sustainable design, eco packaging sourcing, visual storytelling",
      budget: "$500–$2,000",
      hours: "10–20 hrs/wk",
      customer: "Eco-conscious urban households seeking plastic-free home essentials",
      tone: "Calm & Premium",
    },
    metrics: {
      headline: "1,420 Orders",
      sublabel: "38% customer repurchase rate",
    },
    palette: [
      { name: "Forest Moss", hex: "#2D5A27" },
      { name: "Earth Ochre", hex: "#D49B44" },
      { name: "Sun Harvest", hex: "#F4D06F" },
      { name: "Raw Linen", hex: "#EFE9D9" },
      { name: "Charcoal", hex: "#1F2421" },
    ],
    headingFont: "Cabinet Grotesk",
    toolsUsed: ["Name Generator", "Color System", "Social Content", "Funding Finder"],
    quote: "The 14-day social post schedule with ready-made captions and targeted ad copy gave us immediate traction. We saved thousands on agency fees and launched before our competitors.",
    slug: "terracycle-living",
  },
  {
    id: "story-4",
    presetId: "fitness-coaching",
    businessName: "PulseFit Hybrid Conditioning",
    category: "Fitness & Wellness",
    founder: "Darius Cole",
    location: "Miami, Florida",
    timeToLaunch: "1 min 30 sec",
    tagline: "Elite hybrid strength programming and daily proactive nutritional accountability.",
    elevatorPitch: "Customized functional strength routines paired with macro coaching, daily biometric check-ins, and athletic longevity mentoring via smartphone app.",
    intakeAnswers: {
      skills: "CSCS certified trainer, sports nutrition specialist, high energy coaching",
      budget: "Under $500",
      hours: "15–20 hrs/wk",
      customer: "Busy remote executives and founders wanting peak vitality and discipline",
      tone: "Bold & High-Voltage",
    },
    metrics: {
      headline: "48 1-on-1 Clients",
      sublabel: "$11.2k predictable recurring MRR",
    },
    palette: [
      { name: "Solar Crimson", hex: "#FF2A3A" },
      { name: "Midnight Carbon", hex: "#121214" },
      { name: "Volt Lime", hex: "#B8FF00" },
      { name: "Pure White", hex: "#FFFFFF" },
      { name: "Steel Gray", hex: "#4A4D55" },
    ],
    headingFont: "Syne",
    toolsUsed: ["Brand Voice", "Vector Logo", "Landing Page", "CRM Pipeline"],
    quote: "I used to spend weekends fighting WordPress themes and payment plugins. With 1 Click Business, leads from my Instagram link directly into my pipeline. I focus 100% on training clients.",
    slug: "pulsefit-coaching",
  },
  {
    id: "story-5",
    presetId: "ai-agency",
    businessName: "Lumen & Key Digital Studio",
    category: "B2B & Consulting",
    founder: "Chloe Sterling",
    location: "Austin, Texas",
    timeToLaunch: "2 min 05 sec",
    tagline: "Distinctive AI workflows & digital brand engines for challenger founders.",
    elevatorPitch: "Boutique digital studio deploying custom generative workflows, conversion landing pages, and automated client lead engines for modern independent brands.",
    intakeAnswers: {
      skills: "Digital design, prompt automation, client workflows, conversion copywriting",
      budget: "$500–$2,000",
      hours: "20–40 hrs/wk",
      customer: "Local service businesses and tech startups wanting automated inbound",
      tone: "Expert & Creative",
    },
    metrics: {
      headline: "Booked 3 Mo. Out",
      sublabel: "$18.5k active project pipeline",
    },
    palette: [
      { name: "Electric Violet", hex: "#7C3AED" },
      { name: "Cyan Spark", hex: "#06B6D4" },
      { name: "Ink Slate", hex: "#0F172A" },
      { name: "Soft Silk", hex: "#F8FAFC" },
      { name: "Sunburst", hex: "#FBBF24" },
    ],
    headingFont: "Clash Display",
    toolsUsed: ["Idea Wizard", "Color & Font System", "Ad Generator", "Business Plan"],
    quote: "The generated brand voice and color system were so coherent that colleagues assumed I hired a premier design agency. It immediately gave me the credibility to command top-tier rates.",
    slug: "lumen-studio",
  },
  {
    id: "story-6",
    presetId: "home-services",
    businessName: "Haven Home Maintenance Hub",
    category: "Home & Local Services",
    founder: "Samir Patel",
    location: "Charlotte, North Carolina",
    timeToLaunch: "1 min 48 sec",
    tagline: "On-demand residential upkeep, vetted repairs & seasonal home care contracts.",
    elevatorPitch: "Subscription-based home maintenance and rapid-response repair hub serving homeowners with reliable diagnostics, electrical fixes, and seasonal tune-ups.",
    intakeAnswers: {
      skills: "Residential maintenance, electrical fundamentals, smart home setups",
      budget: "$500–$2,000",
      hours: "Full-time (40 hrs/wk)",
      customer: "Suburban property owners and realtors requiring dependable maintenance",
      tone: "Trustworthy & Friendly",
    },
    metrics: {
      headline: "34 Contracts",
      sublabel: "$9.4k monthly repeat maintenance revenue",
    },
    palette: [
      { name: "Heritage Blue", hex: "#0F2C59" },
      { name: "Caution Gold", hex: "#F8DE22" },
      { name: "Sky Blueprint", hex: "#39A7FF" },
      { name: "Chalk White", hex: "#F8F9FA" },
      { name: "Charcoal", hex: "#1A1A1A" },
    ],
    headingFont: "Plus Jakarta Sans",
    toolsUsed: ["Launch Checklist", "Website Generator", "CRM Pipeline", "Ad Generator"],
    quote: "The business launch checklist guided me through exact local NC contractor registration, tax ID, and insurance requirements. Avoided weeks of delays and started booking clients immediately.",
    slug: "haven-home",
  },
];

const CATEGORIES = [
  "All Stories",
  "Food & Hospitality",
  "B2B & Consulting",
  "E-Commerce & DTC",
  "Fitness & Wellness",
  "Home & Local Services",
];

export function SuccessStories() {
  const { openQuickStart } = useQuickStart();
  const [activeCategory, setActiveCategory] = useState("All Stories");
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Scroll entrance observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filteredStories = activeCategory === "All Stories"
    ? STORIES
    : STORIES.filter((s) => s.category === activeCategory);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <section
      id="success-stories"
      ref={sectionRef}
      className="border-b-[3px] border-ink bg-paper py-20 px-4 md:px-8 relative overflow-hidden"
    >
      <div className="mx-auto max-w-[1400px]">
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 border-b-[3px] border-ink">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="grid h-6 w-6 place-items-center bg-ink text-sun b3">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-ink">
                Real Generated Blueprints · Zero to Revenue
              </p>
            </div>
            <h2 className="display text-5xl sm:text-6xl md:text-8xl leading-none">
              Success Stories.
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg font-bold text-muted">
              Explore real businesses launched with 1 Click Business. Each founder entered 8 raw intake answers, and our 13 AI engines generated their brand, plan, live website, and lead pipeline.
            </p>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { val: "4,200+", label: "Businesses Generated" },
              { val: "< 3 Min", label: "Avg. Generation Time" },
              { val: "$1.8M+", label: "Founder Revenue Tracked" },
              { val: "94.6%", label: "Kept Generated Brand" },
            ].map((stat) => (
              <div key={stat.label} className="b3 hard bg-cream p-3 text-left">
                <p className="display text-2xl md:text-3xl text-ink leading-tight">{stat.val}</p>
                <p className="text-[10px] md:text-xs font-black uppercase text-muted tracking-wide mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="mt-8 flex items-center justify-between gap-4 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs md:text-sm font-black uppercase tracking-wider px-3.5 py-2 border-2 border-ink transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-ink text-sun shadow-[2px_2px_0px_#000] -translate-y-0.5"
                    : "bg-paper text-ink hover:bg-cream hover:shadow-[1px_1px_0px_#000]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs font-extrabold uppercase text-muted hidden md:inline">
            Showing {filteredStories.length} founder blueprint{filteredStories.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Animated Grid Layout */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story, idx) => {
            return (
              <article
                key={story.id}
                className={`b3 hard flex flex-col justify-between bg-white transition-all duration-700 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_#000] ${
                  isVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-12 scale-[0.98]"
                }`}
                style={{
                  transitionDelay: isVisible ? `${(idx % 6) * 110}ms` : "0ms",
                }}
              >
                {/* Card Top: Category & Speed Badge */}
                <div className="border-b-[3px] border-ink bg-sun px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-ink">
                    {story.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold bg-ink text-sun px-2 py-0.5 border border-ink">
                    <Clock className="h-3 w-3" />
                    <span>Built in {story.timeToLaunch}</span>
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Business Name & Tagline */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3 inline" /> {story.location}
                      </p>
                      <span className="text-[11px] font-bold text-muted">
                        Founder: <strong className="text-ink">{story.founder}</strong>
                      </span>
                    </div>

                    <h3 className="display text-2xl text-ink leading-tight mt-1">
                      {story.businessName}
                    </h3>

                    <p className="text-sm font-semibold text-ink/80 mt-2 line-clamp-2 italic">
                      "{story.tagline}"
                    </p>
                  </div>

                  {/* Generated Color Palette Snippet */}
                  <div className="pt-2 border-t border-ink/15">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase text-muted mb-1.5">
                      <span className="flex items-center gap-1">
                        <Palette className="h-3 w-3" /> Generated Palette
                      </span>
                      <span>Font: {story.headingFont}</span>
                    </div>
                    <div className="flex border-2 border-ink h-9 overflow-hidden shadow-[2px_2px_0px_#000]">
                      {story.palette.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className="flex-1 transition-transform hover:scale-110 cursor-pointer relative group focus:outline-hidden"
                          style={{ backgroundColor: c.hex }}
                          onClick={() => handleCopyHex(c.hex)}
                          aria-label={`Copy color ${c.name} (${c.hex})`}
                          title={`${c.name}: ${c.hex} (Click to copy)`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Core Result / Proof Metric Box */}
                  <div className="b3 bg-cream p-3 flex items-center justify-between">
                    <div>
                      <p className="display text-2xl text-ink">{story.metrics.headline}</p>
                      <p className="text-xs font-extrabold text-muted">{story.metrics.sublabel}</p>
                    </div>
                    <span className="grid h-8 w-8 place-items-center bg-mint text-ink border border-ink">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <blockquote className="bg-paper p-3 border-2 border-dashed border-ink/30 text-xs font-bold text-ink/90 leading-relaxed relative">
                    <Quote className="h-3.5 w-3.5 text-muted inline mr-1 opacity-50" />
                    {story.quote}
                  </blockquote>

                  {/* Tools Used Pills */}
                  <div className="pt-2 border-t border-ink/15 flex flex-wrap gap-1">
                    {story.toolsUsed.map((tool) => (
                      <span
                        key={tool}
                        className="text-[10px] font-black uppercase tracking-wider bg-paper border border-ink px-1.5 py-0.5 text-ink"
                      >
                        ✓ {tool}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="border-t-[3px] border-ink bg-cream p-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStory(story)}
                    className="btn btn-sm btn-quiet text-xs font-extrabold border-2 border-ink py-1.5 px-3 flex items-center gap-1"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Inspect Blueprint</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openQuickStart(story.presetId)}
                    className="btn btn-sm btn-yellow text-xs font-black border-2 border-ink py-1.5 px-3 shadow-[2px_2px_0px_#000] flex items-center gap-1 cursor-pointer"
                    title="Launch a business like this using 1-Click Wizard"
                  >
                    <Zap className="h-3.5 w-3.5 fill-ink" />
                    <span>Launch Like This</span>
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Call to Action */}
        <div className="b3 hard mt-14 bg-ink p-8 md:p-12 text-sun flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="chip border-sun bg-mint text-ink">Ready to start?</span>
            <h3 className="display text-4xl md:text-5xl mt-3 text-white leading-tight">
              Your business blueprint is 8 questions away.
            </h3>
            <p className="mt-3 text-sm md:text-base font-semibold text-cream">
              Choose an archetype in 1 click, or let the AI construct your custom business plan, name, logo, live website, ads, and CRM from scratch.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <button
              type="button"
              onClick={() => openQuickStart()}
              className="btn btn-yellow border-sun font-black shadow-[4px_4px_0_#79e784] text-sm md:text-base cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-ink" />
              <span>Launch in 1-Click</span>
            </button>
            <Link
              to="/start"
              className="btn border-sun bg-paper text-ink font-extrabold text-sm md:text-base"
            >
              <span>Full 8-Step Intake</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Blueprint Detail Modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
          <button
            type="button"
            aria-label="Close modal"
            className="fixed inset-0 bg-ink/75 backdrop-blur-xs cursor-default"
            onClick={() => setSelectedStory(null)}
          />

          <div className="relative w-full max-w-4xl max-h-[92vh] bg-paper border-[3px] border-ink shadow-[10px_10px_0px_#000] z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center bg-ink text-sun border-2 border-ink shadow-[2px_2px_0px_#000]">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="display text-2xl md:text-3xl leading-none">{selectedStory.businessName}</h3>
                  <p className="text-xs font-black uppercase text-ink/80 mt-1">
                    {selectedStory.category} · {selectedStory.location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="btn btn-sm btn-quiet !p-2 border-2 border-ink hover:bg-ink hover:text-sun cursor-pointer"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Pitch & Metric Highlight */}
              <div className="b3 bg-cream p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-muted">Primary Result</p>
                  <p className="display text-3xl md:text-4xl text-ink mt-0.5">{selectedStory.metrics.headline}</p>
                  <p className="text-xs sm:text-sm font-bold text-muted">{selectedStory.metrics.sublabel}</p>
                </div>
                <div className="text-left sm:text-right sm:border-l-2 sm:border-ink/20 sm:pl-6">
                  <span className="text-xs font-black uppercase text-muted block">Generation Speed</span>
                  <span className="font-mono text-base font-black text-ink">{selectedStory.timeToLaunch}</span>
                </div>
              </div>

              {/* Tagline & Elevator Pitch */}
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-wider text-muted">Generated Tagline &amp; Pitch</p>
                <p className="font-serif italic text-base sm:text-lg font-bold text-ink bg-white p-4 border-2 border-ink">
                  "{selectedStory.tagline}"
                </p>
                <p className="text-sm font-medium text-ink bg-paper p-4 border-2 border-ink leading-relaxed">
                  {selectedStory.elevatorPitch}
                </p>
              </div>

              {/* What the Founder Provided (Intake Answers) */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted mb-2.5">
                  Founder's Initial 8-Question Intake Answers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3.5 border-2 border-ink">
                    <span className="font-black uppercase text-muted block text-xs mb-1">Skills Given:</span>
                    <span className="font-semibold text-ink leading-relaxed">{selectedStory.intakeAnswers.skills}</span>
                  </div>
                  <div className="bg-white p-3.5 border-2 border-ink">
                    <span className="font-black uppercase text-muted block text-xs mb-1">Target Customer:</span>
                    <span className="font-semibold text-ink leading-relaxed">{selectedStory.intakeAnswers.customer}</span>
                  </div>
                  <div className="bg-white p-3.5 border-2 border-ink">
                    <span className="font-black uppercase text-muted block text-xs mb-1">Budget &amp; Hours:</span>
                    <span className="font-semibold text-ink">{selectedStory.intakeAnswers.budget} · {selectedStory.intakeAnswers.hours}</span>
                  </div>
                  <div className="bg-white p-3.5 border-2 border-ink">
                    <span className="font-black uppercase text-muted block text-xs mb-1">Brand Vibe:</span>
                    <span className="font-semibold text-ink">{selectedStory.intakeAnswers.tone}</span>
                  </div>
                </div>
              </div>

              {/* Generated Brand Assets Breakdown */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-muted mb-2">
                  Generated Design System
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-muted">
                    <span>5-Color Palette (Click swatch to copy hex):</span>
                    <span>Heading Font: <strong>{selectedStory.headingFont}</strong></span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {selectedStory.palette.map((c) => (
                      <button
                        type="button"
                        key={c.name}
                        onClick={() => handleCopyHex(c.hex)}
                        className="p-2 border-2 border-ink text-left transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
                        style={{ backgroundColor: c.hex }}
                      >
                        <span className="text-[10px] font-black px-1 bg-white/90 border border-ink text-ink inline-block">
                          {c.hex}
                        </span>
                        <span className="block text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mt-3 truncate">
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {copiedHex && (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-1.5 border border-emerald-600 text-center animate-in fade-in">
                      Copied {copiedHex} to clipboard!
                    </p>
                  )}
                </div>
              </div>

              {/* Founder Testimonial */}
              <div className="bg-ink text-sun p-4 b3">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-4 w-4 text-mint" />
                  <span className="text-xs font-black uppercase tracking-widest text-mint">
                    Founder Review · {selectedStory.founder}
                  </span>
                </div>
                <p className="text-sm font-semibold italic text-cream">
                  "{selectedStory.quote}"
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-[3px] border-ink bg-cream p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedStory(null)}
                className="btn btn-sm btn-quiet border-2 border-ink text-xs font-bold w-full sm:w-auto"
              >
                Close Blueprint
              </button>

              <button
                type="button"
                onClick={() => {
                  const pid = selectedStory.presetId;
                  setSelectedStory(null);
                  openQuickStart(pid);
                }}
                className="btn btn-yellow border-2 border-ink text-sm font-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
              >
                <Zap className="h-4 w-4 fill-ink" />
                <span>Launch This Exact Archetype</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
