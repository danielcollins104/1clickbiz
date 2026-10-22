import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Zap,
  X,
  Sparkles,
  Rocket,
  Check,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";
import { useAccess, useCreateBusiness, useSession, errorMessage } from "../queries/business";
import { useFirebase } from "../context/FirebaseContext";
import type { Intake } from "../../api/database/schema";

export interface BusinessPreset {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  icon: string;
  intake: Intake;
  highlights: string[];
}

export const PRESETS: BusinessPreset[] = [
  {
    id: "ai-agency",
    name: "AI Automation & Growth Agency",
    badge: "Most Popular",
    tagline: "Build custom AI workflows, client lead pipelines & smart chat systems for local businesses.",
    icon: "⚡",
    intake: {
      idea: "Done-for-you AI workflow automation and lead capture chatbots for local dentists, contractors, and service companies.",
      skills: "B2B client consulting, marketing automation, AI prompt workflows, sales follow-ups",
      interests: "Artificial intelligence, productivity, high-leverage software tools, client growth",
      budget: "$500–$2,000",
      hours: "20–40",
      location: "Austin, Texas, USA",
      customer: "Service businesses (dentists, HVAC, realtors) doing $200k-$1M looking to automate inbound leads",
      tone: "Expert",
    },
    highlights: ["High profit margins", "Rapid 48-hr launch", "High retainer demand"],
  },
  {
    id: "artisan-bakery",
    name: "Artisanal Specialty Sourdough & Cafe",
    badge: "Local Brick & Mobile",
    tagline: "Small-batch organic bakery offering artisanal sourdough, subscription bread boxes & catering.",
    icon: "🥖",
    intake: {
      idea: "Micro-bakery and specialty coffee pop-up delivering weekly sourdough subscriptions and catering morning events.",
      skills: "Baking sourdough, pastry production, hospitality, event catering, neighborhood community building",
      interests: "Slow food movement, specialty roasting, culinary arts, local farmers markets",
      budget: "$2,000–$10,000",
      hours: "Full-time",
      location: "Denver, Colorado, USA",
      customer: "Discerning local foodies, remote workers, and families seeking organic artisanal provisions",
      tone: "Friendly",
    },
    highlights: ["Repeat weekly subscriptions", "Strong local word-of-mouth", "High community loyalty"],
  },
  {
    id: "eco-dtc",
    name: "Eco-Friendly Lifestyle Store",
    badge: "E-Commerce",
    tagline: "Curated sustainable home and travel essentials delivered in 100% plastic-free packaging.",
    icon: "🌱",
    intake: {
      idea: "Direct-to-consumer brand for minimalist zero-waste personal care and sustainable travel goods.",
      skills: "Product curation, social media storytelling, sustainable supply chain, community branding",
      interests: "Environmental sustainability, ethical design, circular economy, organic lifestyle",
      budget: "$500–$2,000",
      hours: "10–20",
      location: "Portland, Oregon, USA",
      customer: "Eco-conscious millennials and Gen-Z consumers prioritizing zero-waste everyday items",
      tone: "Calm",
    },
    highlights: ["Global shipping potential", "High social virality", "Low upfront inventory"],
  },
  {
    id: "fitness-coaching",
    name: "High-Performance Hybrid Coaching",
    badge: "Solo Founder",
    tagline: "Custom fitness programming, nutritional accountability, and daily habit coaching via mobile app.",
    icon: "💪",
    intake: {
      idea: "Hybrid coaching service pairing weekly customized home/gym strength routines with proactive nutrition tracking.",
      skills: "Certified personal training, macro planning, habit coaching, client retention, video check-ins",
      interests: "Strength & conditioning, functional longevity, nutrition science, athlete psychology",
      budget: "Under $500",
      hours: "10–20",
      location: "Miami, Florida, USA",
      customer: "Busy professionals aged 30-50 wanting peak energy, fat loss, and sustainable routines",
      tone: "Bold",
    },
    highlights: ["Near-zero overhead", "Predictable monthly MRR", "Launch in 24 hours"],
  },
  {
    id: "b2b-consulting",
    name: "B2B Fractional Operations Advisory",
    badge: "High Ticket",
    tagline: "Executive advisory helping seed and Series-A SaaS startups streamline sales operations and SOPs.",
    icon: "📈",
    intake: {
      idea: "Fractional RevOps and systems consulting for early-stage B2B software founders needing scalable sales pipelines.",
      skills: "CRM architecture, sales funnel optimization, cross-functional management, executive metrics",
      interests: "Venture-backed tech, sales playbooks, business efficiency, scalable systems",
      budget: "Under $500",
      hours: "20–40",
      location: "San Francisco, California, USA",
      customer: "Tech founders and VPs of Sales at seed to Series-A startups ($500k–$5M ARR)",
      tone: "Premium",
    },
    highlights: ["$3k–$8k/mo retainer deals", "100% remote delivery", "No inventory"],
  },
  {
    id: "home-services",
    name: "Reliable Local Home Maintenance Hub",
    badge: "Everyday Demand",
    tagline: "On-demand, vetted residential repairs, smart home installations & seasonal upkeep contracts.",
    icon: "🛠️",
    intake: {
      idea: "Subscription home maintenance and quick-response electrical/handyman services for homeowners.",
      skills: "Carpentry, plumbing basics, smart home installation, client communication, scheduling",
      interests: "Craftsmanship, residential remodeling, homeowner customer service, local networking",
      budget: "$500–$2,000",
      hours: "Full-time",
      location: "Charlotte, North Carolina, USA",
      customer: "Suburban homeowners and real estate property managers needing trusted, prompt repairs",
      tone: "Friendly",
    },
    highlights: ["Essential everyday service", "Fast immediate cashflow", "Zero ad fatigue"],
  },
];

export const SUGGESTIONS = [
  "AI Marketing & Content",
  "Specialty Coffee Roaster",
  "Vintage Clothing Curation",
  "Dog Walking & Pet Care",
  "Modern Interior Styling",
  "Webflow & Shopify Studio",
  "Gourmet Meal Prep",
  "Accounting for Creatives",
];

export function QuickStartModal() {
  const { isOpen, closeQuickStart, initialPresetId } = useQuickStart();
  const [, navigate] = useLocation();
  const { data: session } = useSession();
  const { data: access } = useAccess();
  const { user: firebaseUser, signInWithGoogle, saveBusiness } = useFirebase();
  const createBusiness = useCreateBusiness();

  const [activeTab, setActiveTab] = useState<"presets" | "custom">("presets");
  const [selectedPreset, setSelectedPreset] = useState<BusinessPreset>(PRESETS[0]!);
  const [customForm, setCustomForm] = useState<Intake>({
    idea: "",
    skills: "",
    interests: "",
    budget: "$500–$2,000",
    hours: "20–40",
    location: "Austin, Texas, USA",
    customer: "",
    tone: "Bold",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchStepText, setLaunchStepText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync initial preset if passed
  useEffect(() => {
    if (initialPresetId) {
      const match = PRESETS.find((p) => p.id === initialPresetId);
      if (match) setSelectedPreset(match);
    }
  }, [initialPresetId]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        closeQuickStart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, isSubmitting, closeQuickStart]);

  if (!isOpen) return null;

  const currentIntake = activeTab === "presets" ? selectedPreset.intake : customForm;
  const hasUnlockedTools = (access?.tools?.length ?? 0) > 0;

  const handleLaunch = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      // 1. If user is signed in and owns tools, execute pipeline creation!
      if (session && hasUnlockedTools) {
        setLaunchStepText("Spinning up AI business pipeline...");
        const result = await createBusiness.mutateAsync(currentIntake);

        // Also save to Firebase for cross-device history if logged in
        if (firebaseUser) {
          try {
            await saveBusiness({
              id: `biz_${result.id}`,
              name: activeTab === "presets" ? selectedPreset.name : (customForm.idea.slice(0, 30) || "My Quick Business"),
              category: activeTab === "presets" ? selectedPreset.badge : "Custom",
              location: currentIntake.location,
              summary: currentIntake.idea,
              status: "active",
            });
          } catch {
            // non-blocking
          }
        }

        setLaunchStepText("Opening your business workspace...");
        setTimeout(() => {
          setIsSubmitting(false);
          closeQuickStart();
          navigate(`/dashboard?b=${result.id}`);
        }, 600);
        return;
      }

      // 2. If user is signed in but has no tools unlocked:
      if (session && !hasUnlockedTools) {
        // Save pending intake to localStorage for immediate auto-fill upon bundle purchase
        localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
        setLaunchStepText("Preparing Phase 1 Launch Bundle...");
        setTimeout(() => {
          setIsSubmitting(false);
          closeQuickStart();
          navigate("/product/phase-1-launch");
        }, 500);
        return;
      }

      // 3. User is not signed in:
      // Store draft intake
      localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
      setLaunchStepText("Redirecting to sign in & claim business...");
      setTimeout(() => {
        setIsSubmitting(false);
        closeQuickStart();
        navigate("/login");
      }, 500);
    } catch (err) {
      setIsSubmitting(false);
      setError(errorMessage(err));
    }
  };

  const handleQuickGoogleSignIn = async () => {
    try {
      setError(null);
      localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
      await signInWithGoogle();
      // Auth state will trigger re-render
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close wizard"
        className="fixed inset-0 bg-ink/75 backdrop-blur-xs transition-opacity cursor-default"
        onClick={() => !isSubmitting && closeQuickStart()}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-5xl md:max-w-6xl max-h-[94vh] flex flex-col bg-paper border-[3px] border-ink shadow-[10px_10px_0px_#000] z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <header className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-ink text-sun border-2 border-ink shadow-[2px_2px_0px_#000]">
              <Zap className="h-6 w-6 fill-sun text-sun" strokeWidth={2.5} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="display text-2xl md:text-3xl leading-tight">Quick Start Wizard</h2>
                <span className="hidden sm:inline-block bg-mint text-ink text-xs font-black px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#000]">
                  1-CLICK LAUNCH
                </span>
              </div>
              <p className="text-xs font-bold text-ink/80 mt-0.5">
                Choose a validated archetype or customize in seconds. 13 AI engines build your launch blueprint.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeQuickStart}
            disabled={isSubmitting}
            className="btn btn-sm btn-quiet !p-2 border-2 border-ink hover:bg-ink hover:text-sun transition-colors"
            aria-label="Close Quick Start modal"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </header>

        {/* Tab Selection */}
        <div className="flex border-b-[3px] border-ink bg-cream">
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-black uppercase tracking-wider transition-all border-r-[3px] border-ink flex items-center justify-center gap-2 ${
              activeTab === "presets"
                ? "bg-paper text-ink shadow-[inset_0_-3px_0_#000]"
                : "bg-cream text-muted hover:text-ink hover:bg-paper/60"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Curated Archetypes (Instant)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-3 px-4 text-xs md:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === "custom"
                ? "bg-paper text-ink shadow-[inset_0_-3px_0_#000]"
                : "bg-cream text-muted hover:text-ink hover:bg-paper/60"
            }`}
          >
            <Lightbulb className="h-4 w-4" />
            <span>Custom Quick Builder</span>
          </button>
        </div>

        {/* Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {error && (
            <div className="border-[3px] border-rose-600 bg-rose-50 p-4 text-rose-900 font-bold text-sm flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="font-black">Could not complete quick launch:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {activeTab === "presets" ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-muted">
                  Step 1: Pick a Business Model
                </p>
                <span className="text-xs font-extrabold text-ink bg-sun px-2 py-0.5 border border-ink">
                  Fully pre-configured
                </span>
              </div>

              {/* Grid of Archetypes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`text-left p-4 border-[2.5px] border-ink transition-all cursor-pointer relative flex flex-col justify-between w-full ${
                        isSelected
                          ? "bg-sun shadow-[4px_4px_0px_#000] -translate-y-0.5"
                          : "bg-white hover:bg-cream hover:shadow-[2px_2px_0px_#000]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-3 -right-2 bg-ink text-sun text-xs font-black px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#000] flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> SELECTED
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-2xl">{preset.icon}</span>
                          <span className="text-xs font-black uppercase tracking-wider bg-paper px-2 py-0.5 border border-ink">
                            {preset.badge}
                          </span>
                        </div>
                        <h3 className="font-black text-base text-ink leading-snug">{preset.name}</h3>
                        <p className="text-xs font-semibold text-ink/80 mt-1 line-clamp-2">
                          {preset.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-ink/20 flex flex-wrap gap-1.5">
                        {preset.highlights.map((h) => (
                          <span
                            key={h}
                            className="text-xs font-bold bg-ink/5 px-2 py-0.5 border border-ink/20"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Preset Blueprint Breakdown - Box 2 clearly positioned below Box 1 */}
              <div className="mt-6 border-[3px] border-ink bg-paper p-6 shadow-[5px_5px_0px_#000]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b-[2px] border-ink pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedPreset.icon}</span>
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-muted">Ready to Initialize</span>
                      <h4 className="font-black text-xl text-ink leading-tight">{selectedPreset.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm font-extrabold text-muted">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-ink" /> {selectedPreset.intake.budget}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-ink" /> {selectedPreset.intake.hours} hrs/wk
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-ink" /> {selectedPreset.intake.location}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-black uppercase text-xs text-muted mb-1.5">Target Customer &amp; Market:</p>
                    <p className="font-semibold bg-white p-3 border-2 border-ink leading-relaxed">
                      {selectedPreset.intake.customer}
                    </p>
                  </div>
                  <div>
                    <p className="font-black uppercase text-xs text-muted mb-1.5">Core Value Proposition:</p>
                    <p className="font-semibold bg-white p-3 border-2 border-ink leading-relaxed">
                      {selectedPreset.intake.idea}
                    </p>
                  </div>
                </div>

                {/* 13 Automated Tools Visualizer */}
                <div className="mt-5 pt-4 border-t border-ink/20">
                  <p className="text-xs font-black uppercase tracking-wider text-muted mb-2.5 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-ink" />
                    <span>Automated Launch Pipeline (All 13 AI Engines Queue Instantly):</span>
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs font-bold">
                    {[
                      "Idea Validation",
                      "Company Name Generator",
                      "5-Year Business Plan",
                      "Magnetic Brand Voice",
                      "Color & Font Palette",
                      "Vector Logo Concepts",
                      "Live Landing Page",
                      "Ad Copy & Creatives",
                      "Social Media Kickstart",
                      "Funding & Grants Finder",
                      "Local Licences & Permits",
                      "Embedded CRM Pipeline",
                      "Launch Day Checklist",
                    ].map((tool, idx) => (
                      <span
                        key={tool}
                        className="bg-sun px-2.5 py-1 border border-ink text-ink flex items-center gap-1.5"
                      >
                        <span className="text-[11px] font-black text-ink/70">#{idx + 1}</span>
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Custom Quick Builder Tab */
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">
                  1-Question Custom Start
                </p>
                <label htmlFor="custom-idea-input" className="block text-sm font-black text-ink mb-1.5">
                  What business do you want to launch, or what are you skilled at?
                </label>
                <textarea
                  id="custom-idea-input"
                  aria-label="What business do you want to launch, or what are you skilled at?"
                  rows={3}
                  value={customForm.idea}
                  onChange={(e) => setCustomForm({ ...customForm, idea: e.target.value, skills: e.target.value })}
                  placeholder="e.g. Specialty cold-brew coffee subscription for offices, or mobile bike repair..."
                  className="w-full border-[3px] border-ink bg-white p-3 font-semibold text-sm outline-none focus:bg-sun/20 shadow-[2px_2px_0px_#000]"
                />
                
                {/* Suggestion Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase text-muted mr-1">Quick ideas:</span>
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() =>
                        setCustomForm({
                          ...customForm,
                          idea: `${sug} serving local and online clients with modern digital delivery`,
                          skills: sug,
                        })
                      }
                      className="text-xs font-bold bg-white hover:bg-sun px-2.5 py-1 border border-ink transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="custom-location-input" className="block text-xs font-black uppercase text-ink mb-1">
                    Your Location
                  </label>
                  <input
                    id="custom-location-input"
                    aria-label="Your Location"
                    type="text"
                    value={customForm.location}
                    onChange={(e) => setCustomForm({ ...customForm, location: e.target.value })}
                    placeholder="City, State, Country"
                    className="w-full border-2 border-ink bg-white p-2 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="custom-budget-select" className="block text-xs font-black uppercase text-ink mb-1">
                    Starting Budget
                  </label>
                  <select
                    id="custom-budget-select"
                    aria-label="Starting Budget"
                    value={customForm.budget}
                    onChange={(e) => setCustomForm({ ...customForm, budget: e.target.value })}
                    className="w-full border-2 border-ink bg-white p-2 text-xs font-bold outline-none"
                  >
                    <option value="Under $500">Under $500</option>
                    <option value="$500–$2,000">$500–$2,000</option>
                    <option value="$2,000–$10,000">$2,000–$10,000</option>
                    <option value="$10,000+">$10,000+</option>
                  </select>
                </div>

                <div>
                  <span className="block text-xs font-black uppercase text-ink mb-1">
                    Brand Vibe
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Bold", "Friendly", "Premium", "Calm", "Expert"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCustomForm({ ...customForm, tone: t })}
                        className={`text-xs font-black px-2.5 py-1.5 border border-ink transition-colors cursor-pointer ${
                          customForm.tone === t ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "bg-white text-ink hover:bg-cream"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Launch Control */}
        <footer className="border-t-[3px] border-ink bg-cream p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!session && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickGoogleSignIn}
                  className="btn btn-sm btn-quiet !px-3 text-xs font-black border-2 border-ink flex items-center gap-1.5"
                >
                  <span>Google 1-Tap Sign-In</span>
                </button>
                <span className="text-xs font-bold text-muted hidden md:inline">
                  (Or click Launch to preview)
                </span>
              </div>
            )}
            {session && !hasUnlockedTools && (
              <div className="flex items-center gap-2">
                <span className="chip bg-sun text-ink text-xs font-extrabold">
                  <Lock className="h-3 w-3 inline mr-1" />
                  Phase 1 Bundle Unlocks Pipeline
                </span>
              </div>
            )}
            {session && hasUnlockedTools && (
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Account ready · Instant generation authorized</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={closeQuickStart}
              disabled={isSubmitting}
              className="btn btn-quiet text-xs font-bold px-3 py-2 border-2 border-ink"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLaunch}
              disabled={isSubmitting || (activeTab === "custom" && !customForm.idea.trim())}
              className="btn btn-yellow text-sm md:text-base font-black px-6 py-2.5 border-[2.5px] border-ink shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{launchStepText || "Generating..."}</span>
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5 fill-ink" />
                  <span>
                    {session && hasUnlockedTools
                      ? "Launch Business (1-Click)"
                      : session && !hasUnlockedTools
                      ? "Get Phase 1 Bundle & Launch"
                      : "Generate My Business Now"}
                  </span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
