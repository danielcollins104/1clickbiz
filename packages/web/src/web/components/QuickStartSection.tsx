import { useState } from "react";
import { useLocation } from "wouter";
import {
  Zap,
  Rocket,
  Check,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Loader2,
} from "lucide-react";
import { PRESETS, SUGGESTIONS, type BusinessPreset } from "./QuickStartModal";
import { useAccess, useCreateBusiness, useSession, errorMessage } from "../queries/business";
import { useFirebase } from "../context/FirebaseContext";
import type { Intake } from "../../api/database/schema";

export function QuickStartSection() {
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

  const currentIntake = activeTab === "presets" ? selectedPreset.intake : customForm;
  const hasUnlockedTools = (access?.tools?.length ?? 0) > 0;

  const handleLaunch = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (session && hasUnlockedTools) {
        setLaunchStepText("Spinning up AI business pipeline...");
        const result = await createBusiness.mutateAsync(currentIntake);

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
          navigate(`/dashboard?b=${result.id}`);
        }, 600);
        return;
      }

      if (session && !hasUnlockedTools) {
        localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
        setLaunchStepText("Preparing Phase 1 Launch Bundle...");
        setTimeout(() => {
          setIsSubmitting(false);
          navigate("/product/phase-1-launch");
        }, 500);
        return;
      }

      localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
      setLaunchStepText("Redirecting to sign in & claim business...");
      setTimeout(() => {
        setIsSubmitting(false);
        navigate("/login");
      }, 500);
    } catch (err) {
      setIsSubmitting(false);
      setError(errorMessage(err));
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      localStorage.setItem("1cb_pending_quick_start", JSON.stringify(currentIntake));
      await signInWithGoogle();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <section id="quick-start-section" className="border-b-[3px] border-ink bg-paper py-20 px-4 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header Block */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b-[3px] border-ink">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="grid h-7 w-7 place-items-center bg-ink text-sun border border-ink shadow-[2px_2px_0px_#000]">
                <Zap className="h-4 w-4 fill-sun text-sun" />
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-ink">
                Instant Launch Engine · 1-Click Setup
              </p>
            </div>
            <h2 className="display text-5xl sm:text-6xl md:text-8xl leading-none">
              Quick Start Wizard.
            </h2>
            <p className="mt-4 max-w-3xl text-base sm:text-lg font-bold text-muted">
              Choose a proven business archetype in the first box below. The complete blueprint and 13 AI engines automatically configure in the breakdown box directly underneath.
            </p>
          </div>

          <div className="flex border-[2.5px] border-ink bg-cream p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "presets"
                  ? "bg-ink text-sun shadow-[2px_2px_0px_#000]"
                  : "text-muted hover:text-ink"
              }`}
            >
              Curated Archetypes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`py-2 px-4 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "custom"
                  ? "bg-ink text-sun shadow-[2px_2px_0px_#000]"
                  : "text-muted hover:text-ink"
              }`}
            >
              Custom Quick Builder
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 border-[3px] border-rose-600 bg-rose-50 p-4 text-rose-900 font-bold text-sm flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-black">Could not complete quick launch:</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {activeTab === "presets" ? (
          <div className="space-y-8">
            {/* BOX 1: Archetypes Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-muted">
                    Box 1: Select Your Business Model
                  </span>
                  <span className="bg-sun px-2 py-0.5 text-xs font-black border border-ink">
                    6 Ready-Made Models
                  </span>
                </div>
                <span className="text-xs font-extrabold text-muted hidden sm:inline">
                  Click any card to load its complete launch blueprint
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`text-left p-5 border-[3px] border-ink transition-all cursor-pointer relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-sun shadow-[6px_6px_0px_#000] -translate-y-1"
                          : "bg-white hover:bg-cream hover:shadow-[3px_3px_0px_#000]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute -top-3.5 -right-2 bg-ink text-sun text-xs font-black px-2.5 py-0.5 border border-ink shadow-[2px_2px_0px_#000] flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> SELECTED
                        </span>
                      )}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="text-3xl">{preset.icon}</span>
                          <span className="text-xs font-black uppercase tracking-wider bg-paper px-2 py-0.5 border border-ink">
                            {preset.badge}
                          </span>
                        </div>
                        <h3 className="font-black text-lg text-ink leading-snug">{preset.name}</h3>
                        <p className="text-xs font-semibold text-ink/80 mt-1.5 line-clamp-2">
                          {preset.tagline}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ink/20 flex flex-wrap gap-1.5">
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
            </div>

            {/* BOX 2: Blueprint Breakdown Information (Clearly positioned below Box 1) */}
            <div className="border-[3px] border-ink bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000]">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[3px] border-ink pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedPreset.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-muted">
                        Box 2: Ready to Initialize Blueprint
                      </span>
                      <span className="bg-mint text-ink text-xs font-black px-2 py-0.5 border border-ink">
                        Pre-Configured
                      </span>
                    </div>
                    <h3 className="font-black text-2xl md:text-3xl text-ink leading-tight mt-0.5">
                      {selectedPreset.name}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-extrabold text-ink bg-cream p-3 border-2 border-ink">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-ink" /> {selectedPreset.intake.budget}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-ink" /> {selectedPreset.intake.hours} hrs/wk
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-ink" /> {selectedPreset.intake.location}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-black uppercase text-xs text-muted mb-2">Target Customer &amp; Market:</p>
                  <div className="font-semibold bg-paper p-4 border-2 border-ink leading-relaxed text-ink min-h-[90px]">
                    {selectedPreset.intake.customer}
                  </div>
                </div>
                <div>
                  <p className="font-black uppercase text-xs text-muted mb-2">Core Value Proposition &amp; Delivery:</p>
                  <div className="font-semibold bg-paper p-4 border-2 border-ink leading-relaxed text-ink min-h-[90px]">
                    {selectedPreset.intake.idea}
                  </div>
                </div>
              </div>

              {/* 13 Automated Tools Visualizer */}
              <div className="mt-8 pt-6 border-t-[2px] border-ink">
                <p className="text-xs font-black uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-ink" />
                  <span>All 13 AI Engines Queue Instantly on Launch:</span>
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
                      className="bg-sun px-3 py-1.5 border border-ink text-ink flex items-center gap-2 font-bold shadow-[1px_1px_0px_#000]"
                    >
                      <span className="text-xs font-black text-ink/70">#{idx + 1}</span>
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t-[3px] border-ink flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream p-5">
                <div className="flex items-center gap-3">
                  {!session && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="btn btn-sm btn-quiet text-xs font-black border-2 border-ink"
                    >
                      Google 1-Tap Sign-In
                    </button>
                  )}
                  {session && !hasUnlockedTools && (
                    <span className="chip bg-sun text-ink text-xs font-extrabold">
                      <Lock className="h-3 w-3 inline mr-1" />
                      Phase 1 Bundle Unlocks All 13 Tools
                    </span>
                  )}
                  {session && hasUnlockedTools && (
                    <span className="flex items-center gap-1.5 text-xs font-black text-ink">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Ready to launch instantly
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={isSubmitting}
                  className="btn btn-yellow text-sm sm:text-base font-black px-8 py-3 border-[2.5px] border-ink shadow-[4px_4px_0px_#000] hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{launchStepText || "Generating..."}</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5 fill-ink" />
                      <span>Launch This Business in 1-Click</span>
                      <ArrowRight className="h-4 w-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Custom Quick Builder Tab */
          <div className="border-[3px] border-ink bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000] space-y-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">
                Custom Idea Input
              </p>
              <label htmlFor="home-custom-idea-input" className="block text-base font-black text-ink mb-2">
                What business do you want to launch, or what are your skills?
              </label>
              <textarea
                id="home-custom-idea-input"
                aria-label="What business do you want to launch, or what are your skills?"
                rows={3}
                value={customForm.idea}
                onChange={(e) => setCustomForm({ ...customForm, idea: e.target.value, skills: e.target.value })}
                placeholder="e.g. Specialty cold-brew coffee subscription for offices, or mobile bicycle maintenance..."
                className="w-full border-[3px] border-ink bg-white p-4 font-semibold text-sm outline-none focus:bg-sun/20 shadow-[2px_2px_0px_#000]"
              />

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
                    className="text-xs font-bold bg-cream hover:bg-sun px-3 py-1 border border-ink transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-2 border-ink/20">
              <div>
                <label htmlFor="home-custom-location-input" className="block text-xs font-black uppercase text-ink mb-1.5">
                  Your Location
                </label>
                <input
                  id="home-custom-location-input"
                  aria-label="Your Location"
                  type="text"
                  value={customForm.location}
                  onChange={(e) => setCustomForm({ ...customForm, location: e.target.value })}
                  placeholder="City, State, Country"
                  className="w-full border-2 border-ink bg-white p-2.5 text-xs font-bold outline-none"
                />
              </div>

              <div>
                <label htmlFor="home-custom-budget-select" className="block text-xs font-black uppercase text-ink mb-1.5">
                  Starting Budget
                </label>
                <select
                  id="home-custom-budget-select"
                  aria-label="Starting Budget"
                  value={customForm.budget}
                  onChange={(e) => setCustomForm({ ...customForm, budget: e.target.value })}
                  className="w-full border-2 border-ink bg-white p-2.5 text-xs font-bold outline-none"
                >
                  <option value="Under $500">Under $500</option>
                  <option value="$500–$2,000">$500–$2,000</option>
                  <option value="$2,000–$10,000">$2,000–$10,000</option>
                  <option value="$10,000+">$10,000+</option>
                </select>
              </div>

              <div>
                <span className="block text-xs font-black uppercase text-ink mb-1.5">
                  Brand Vibe
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Bold", "Friendly", "Premium", "Calm", "Expert"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCustomForm({ ...customForm, tone: t })}
                      className={`text-xs font-black px-3 py-1.5 border border-ink transition-colors cursor-pointer ${
                        customForm.tone === t ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "bg-white text-ink hover:bg-cream"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-[3px] border-ink flex justify-end">
              <button
                type="button"
                onClick={handleLaunch}
                disabled={isSubmitting || !customForm.idea.trim()}
                className="btn btn-yellow text-sm sm:text-base font-black px-8 py-3 border-[2.5px] border-ink shadow-[4px_4px_0px_#000] flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{launchStepText || "Generating..."}</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5 fill-ink" />
                    <span>Generate Custom Business Now</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
