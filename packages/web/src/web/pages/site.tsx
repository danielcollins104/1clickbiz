import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Globe,
  History,
  Layers,
  Loader2,
  Rocket,
  Sliders,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGoogleFonts } from "../components/viewers/design";
import type { Img } from "../lib/tools";
import { errorMessage, saveLocalWebsiteData, useSite, useSubmitLead } from "../queries/business";
import {
  INTERACTIVE_APP_TEMPLATES,
  QUICK_ITERATION_PROMPTS,
  WEBSITE_VIBES,
  buildInteractiveAppConfig,
  downloadStandaloneSiteHtml,
  generateCreativeWebsite,
  iterateCreativeWebsite,
  type CreativeSiteData,
  type InteractiveAppType,
  type WebsiteVibeId,
} from "../lib/ai-website-engine";
import { orpc } from "../lib/api";

const PROMPT_SUGGESTIONS = [
  "AI automation agency that saves local businesses 15 hours a week with turnkey chatbots & workflows",
  "Artisan small-batch cold brew coffee & sourdough subscription box delivered fresh every Saturday morning",
  "Mobile luxury auto detailing & ceramic coating studio that comes directly to your driveway",
  "Boutique fitness & nutrition coaching program for busy professionals with weekly accountability",
  "Eco-friendly residential cleaning & home organization service with flat-rate online booking",
];

export default function SitePage({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isEmbed = params.get("embed") === "1";

  const { data, isLoading, error } = useSite(slug);
  const submit = useSubmitLead();
  useGoogleFonts([data?.theme.headingFont, data?.theme.bodyFont, "Space Grotesk", "Plus Jakarta Sans"]);

  // Studio UI state
  const [studioOpen, setStudioOpen] = useState(!isEmbed);
  const [activeStudioTab, setActiveStudioTab] = useState<"create" | "iterate" | "publish">("create");
  const [brandNameInput, setBrandNameInput] = useState("");
  const [promptInput, setPromptInput] = useState("");
  const [selectedVibe, setSelectedVibe] = useState<WebsiteVibeId>("neo-brutalist");
  const [selectedAppType, setSelectedAppType] = useState<InteractiveAppType>("quote-calculator");
  const [iterationInput, setIterationInput] = useState("");
  const [customSlugInput, setCustomSlugInput] = useState(slug);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Interactive Web App state (used by visitors on the page)
  const [sliderValue, setSliderValue] = useState<number>(4);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number>(1);

  // Contact / Booking form state
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", company: "" });
  const [sent, setSent] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const rawSite = (data?.site ?? {}) as CreativeSiteData;

  useEffect(() => {
    if (!data) return;
    setBrandNameInput(data.name || "1 Click Launch Studio");
    setCustomSlugInput(data.slug || slug);
    setPromptInput(
      rawSite.hero?.subheadline ||
        (data as any).idea ||
        `Modern interactive website and web app for ${data.name}`
    );
    if (rawSite.vibe) setSelectedVibe(rawSite.vibe);
    if (rawSite.interactiveApp?.type) setSelectedAppType(rawSite.interactiveApp.type);
    if (rawSite.interactiveApp?.sliderDefault) setSliderValue(rawSite.interactiveApp.sliderDefault);
    if (rawSite.customDomain) setCustomDomainInput(rawSite.customDomain);
  }, [data?.name, data?.slug, rawSite.vibe, rawSite.interactiveApp?.type]);

  useEffect(() => {
    if (!data) return;
    document.title = rawSite.seo?.title || `${data.name} — Interactive Site & Web App`;
  }, [data, rawSite.seo?.title]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper">
        <Loader2 className="h-8 w-8 animate-spin text-ink" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-sun px-4 text-center">
        <div>
          <h1 className="display text-5xl">Site not found.</h1>
          <p className="mt-3 font-bold">{errorMessage(error, "This site doesn't exist yet.")}</p>
          <Link to="/dashboard" className="btn mt-6">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const appConfig =
    rawSite.interactiveApp ??
    buildInteractiveAppConfig(selectedAppType, data.name, promptInput);
  const activeOption = appConfig.options?.[selectedOptionIdx] ?? appConfig.options?.[0] ?? {
    label: "Standard Tier",
    multiplier: 1,
  };
  const calculatedQuote = Math.round(sliderValue * (appConfig.baseRate || 49) * (activeOption.multiplier || 1));

  const vibeConfig = WEBSITE_VIBES.find((v) => v.id === (rawSite.vibe || selectedVibe)) ?? WEBSITE_VIBES[0]!;
  const isDarkVibe = vibeConfig.id === "cyber-glass";
  const isBrutalist = vibeConfig.id === "neo-brutalist" || vibeConfig.id === "kinetic-pop";

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const handleGenerateSite = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      const nextSite = generateCreativeWebsite({
        businessName: brandNameInput || data.name,
        location: (data as any).location || "Austin, TX & Online",
        customer: (data as any).customer || "modern customers",
        prompt: promptInput,
        vibe: selectedVibe,
        appType: selectedAppType,
        customDomain: customDomainInput,
        existingSite: rawSite,
      });
      saveLocalWebsiteData((data as any).id ?? slug, nextSite, customSlugInput, brandNameInput);
      setSliderValue(nextSite.interactiveApp.sliderDefault);
      qc.invalidateQueries({ queryKey: orpc.sites.key() });
      qc.invalidateQueries({ queryKey: orpc.businesses.key() });
      setIsGenerating(false);
      setActiveStudioTab("iterate");
      flashBanner("✨ Generated your new creative Website + Interactive Web App! Now iterate below until you're 100% satisfied.");
    }, 350);
  };

  const handleIterateSite = (customInstruction?: string) => {
    const text = (customInstruction ?? iterationInput).trim();
    if (!text) return;
    setIsGenerating(true);
    setTimeout(() => {
      const nextSite = iterateCreativeWebsite(rawSite, brandNameInput || data.name, text);
      setSelectedVibe(nextSite.vibe);
      setSelectedAppType(nextSite.interactiveApp.type);
      saveLocalWebsiteData((data as any).id ?? slug, nextSite, undefined, brandNameInput);
      setIterationInput("");
      qc.invalidateQueries({ queryKey: orpc.sites.key() });
      qc.invalidateQueries({ queryKey: orpc.businesses.key() });
      setIsGenerating(false);
      flashBanner(`✨ Iteration #${nextSite.iterationHistory?.length ?? 1} applied! Keep iterating or publish when satisfied.`);
    }, 300);
  };

  const handleRestoreVersion = (versionIdx: number) => {
    const target = rawSite.iterationHistory?.[versionIdx];
    if (!target) return;
    const restored: CreativeSiteData = {
      ...target.siteData,
      iterationHistory: rawSite.iterationHistory,
    };
    setSelectedVibe(restored.vibe);
    saveLocalWebsiteData((data as any).id ?? slug, restored);
    qc.invalidateQueries({ queryKey: orpc.sites.key() });
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
    flashBanner(`↺ Restored Version v${target.version} (${target.timestamp})`);
  };

  const handleSaveHosting = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = customSlugInput
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const updatedSite: CreativeSiteData = {
      ...rawSite,
      customDomain: customDomainInput.trim(),
    };
    const saved = saveLocalWebsiteData((data as any).id ?? slug, updatedSite, cleanSlug, brandNameInput);
    qc.invalidateQueries({ queryKey: orpc.sites.key() });
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
    if (saved && saved.slug !== slug) {
      navigate(`/sites/${saved.slug}`);
    }
    flashBanner(
      customDomainInput.trim()
        ? `🌐 Published free at /sites/${cleanSlug} and linked custom domain ${customDomainInput.trim()}!`
        : `🌐 Published free at ${window.location.origin}/sites/${cleanSlug}!`
    );
  };

  const handleLockInQuote = () => {
    const summaryNote = `[Interactive Web App Quote: ${sliderValue} ${appConfig.unitLabel} · ${activeOption.label} = $${calculatedQuote}] `;
    setForm((prev) => ({
      ...prev,
      message: prev.message.includes("Interactive Web App Quote")
        ? prev.message
        : `${summaryNote}${prev.message}`,
    }));
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const livePublicUrl = `${typeof window !== "undefined" ? window.location.origin : "https://1clickbiz.run.place"}/sites/${data.slug}`;
  const historyList = rawSite.iterationHistory ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* =====================================================================
          FOUNDER GENERATIVE AI WEBSITE / WEB APP STUDIO DOCK
          ===================================================================== */}
      {!isEmbed && (
        <div className="border-b-[4px] border-ink bg-paper text-ink z-40 shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
          {/* Top Studio Control Bar */}
          <div className="bg-ink text-paper px-4 py-2.5">
            <div className="mx-auto max-w-[1400px] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={`/dashboard${(data as any).id ? `?b=${(data as any).id}` : ""}`}
                  className="bg-paper text-ink px-2.5 py-1 text-xs font-black uppercase border border-ink hover:bg-sun no-underline"
                >
                  ← Dashboard
                </Link>
                <span className="inline-flex items-center gap-1.5 bg-sun text-ink px-2.5 py-1 text-xs font-black uppercase">
                  <Sparkles className="h-3.5 w-3.5 fill-ink" /> Generative AI Website &amp; Web App Builder
                </span>
                <span className="text-xs font-bold text-mint hidden md:inline">
                  Create → Iterate Until 100% Satisfied → Host Free at Your URL or Custom Domain
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(livePublicUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    } catch {
                      // ignore
                    }
                  }}
                  className="bg-paper/10 hover:bg-paper/20 text-paper border border-paper/30 px-3 py-1 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-mint" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedLink ? "Copied Live URL!" : "Copy Free Live Link"}
                </button>
                <button
                  type="button"
                  onClick={() => setStudioOpen(!studioOpen)}
                  className="bg-mint text-ink px-3 py-1 text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer border border-ink"
                >
                  {studioOpen ? (
                    <>
                      <Eye className="h-3.5 w-3.5" /> Fullscreen Customer Preview
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5" /> Open AI Builder &amp; Iterate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Expandable 3-Stage Generative AI Studio Panel */}
          {studioOpen && (
            <div className="mx-auto max-w-[1400px] p-4 md:p-6 space-y-5">
              {/* Step Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-ink pb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStudioTab("create")}
                    className={`px-4 py-2 text-xs sm:text-sm font-black uppercase border-[2.5px] border-ink flex items-center gap-2 cursor-pointer transition-all ${
                      activeStudioTab === "create"
                        ? "bg-sun text-ink shadow-[3px_3px_0px_#000] -translate-y-0.5"
                        : "bg-cream text-ink hover:bg-paper"
                    }`}
                  >
                    <Wand2 className="h-4 w-4" /> 1. Generative AI Builder Form
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStudioTab("iterate")}
                    className={`px-4 py-2 text-xs sm:text-sm font-black uppercase border-[2.5px] border-ink flex items-center gap-2 cursor-pointer transition-all ${
                      activeStudioTab === "iterate"
                        ? "bg-mint text-ink shadow-[3px_3px_0px_#000] -translate-y-0.5"
                        : "bg-cream text-ink hover:bg-paper"
                    }`}
                  >
                    <Sliders className="h-4 w-4" /> 2. Iterate Until Satisfied ({historyList.length || 1} versions)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStudioTab("publish")}
                    className={`px-4 py-2 text-xs sm:text-sm font-black uppercase border-[2.5px] border-ink flex items-center gap-2 cursor-pointer transition-all ${
                      activeStudioTab === "publish"
                        ? "bg-ink text-sun shadow-[3px_3px_0px_#79e784] -translate-y-0.5"
                        : "bg-cream text-ink hover:bg-paper"
                    }`}
                  >
                    <Globe className="h-4 w-4" /> 3. Free Hosting &amp; Custom Domain
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-extrabold">
                  <span className="bg-cream border-2 border-ink px-2.5 py-1 font-mono">
                    Live at: <strong className="text-emerald-800">/sites/{data.slug}</strong>
                  </span>
                </div>
              </div>

              {statusBanner && (
                <div className="b3 bg-mint p-3 text-xs sm:text-sm font-black text-ink flex items-center justify-between gap-2">
                  <span>{statusBanner}</span>
                  <button type="button" onClick={() => setStatusBanner(null)} className="underline text-xs">
                    Dismiss
                  </button>
                </div>
              )}

              {/* TAB 1: GENERATIVE AI FORM */}
              {activeStudioTab === "create" && (
                <form onSubmit={handleGenerateSite} className="space-y-5">
                  <div className="grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-7 space-y-4 b3 bg-cream/60 p-4 md:p-5">
                      <div>
                        <label htmlFor="site-brand-name" className="block text-xs font-black uppercase tracking-wider">
                          Business / Web App Name
                        </label>
                        <input
                          id="site-brand-name"
                          type="text"
                          value={brandNameInput}
                          onChange={(e) => setBrandNameInput(e.target.value)}
                          placeholder="e.g. Apex Flow Studio"
                          className="input mt-1 font-bold text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="site-ai-prompt" className="block text-xs font-black uppercase tracking-wider">
                          Describe the Website &amp; Interactive Web App You Want AI to Build
                        </label>
                        <p className="text-xs font-semibold text-muted mt-0.5">
                          Tell the AI what your business does, who it serves, and any special interactive tools or vibe you want:
                        </p>
                        <textarea
                          id="site-ai-prompt"
                          rows={3}
                          value={promptInput}
                          onChange={(e) => setPromptInput(e.target.value)}
                          placeholder="e.g. A modern dog grooming & wellness club in Austin with an instant breed price calculator and monthly VIP membership..."
                          className="input mt-2 font-semibold text-sm resize-none"
                        />
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          <span className="text-[11px] font-black uppercase text-muted self-center mr-1">
                            Try a creative prompt:
                          </span>
                          {PROMPT_SUGGESTIONS.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPromptInput(s)}
                              className="text-[11px] font-bold bg-paper hover:bg-sun px-2 py-0.5 border border-ink cursor-pointer transition-colors"
                            >
                              Idea #{idx + 1}: {s.slice(0, 34)}…
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Interactive App Module & Design Vibe Pickers */}
                    <div className="lg:col-span-5 space-y-4 b3 bg-cream/60 p-4 md:p-5">
                      <div>
                        <span className="block text-xs font-black uppercase tracking-wider mb-1.5">
                          Choose Built-In Interactive Web App Widget
                        </span>
                        <div className="grid gap-1.5">
                          {INTERACTIVE_APP_TEMPLATES.map((tpl) => (
                            <button
                              key={tpl.id}
                              type="button"
                              onClick={() => setSelectedAppType(tpl.id)}
                              className={`text-left p-2.5 border-2 border-ink transition-all cursor-pointer flex items-start gap-2.5 ${
                                selectedAppType === tpl.id
                                  ? "bg-sun shadow-[2px_2px_0px_#000]"
                                  : "bg-paper hover:bg-white"
                              }`}
                            >
                              <span className="text-lg leading-none mt-0.5">{tpl.emoji}</span>
                              <div className="min-w-0">
                                <p className="text-xs font-black leading-tight">{tpl.label}</p>
                                <p className="text-[11px] font-semibold text-ink/75 line-clamp-1">{tpl.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aesthetic Vibe Bar */}
                  <div>
                    <span className="block text-xs font-black uppercase tracking-wider mb-2">
                      Choose Visual Aesthetic &amp; Design System
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                      {WEBSITE_VIBES.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVibe(v.id)}
                          className={`text-left p-3 border-2 border-ink cursor-pointer transition-all ${
                            selectedVibe === v.id
                              ? "bg-sun shadow-[3px_3px_0px_#000] -translate-y-0.5"
                              : "bg-paper hover:bg-cream"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <div className="flex gap-1">
                              <span className="h-3.5 w-3.5 rounded-full border border-ink" style={{ background: v.previewColors.bg }} />
                              <span className="h-3.5 w-3.5 rounded-full border border-ink" style={{ background: v.previewColors.primary }} />
                              <span className="h-3.5 w-3.5 rounded-full border border-ink" style={{ background: v.previewColors.accent }} />
                            </div>
                            <span className="text-[10px] font-black uppercase bg-ink text-sun px-1.5 py-0.2">
                              {v.badge}
                            </span>
                          </div>
                          <p className="text-xs font-black">{v.name}</p>
                          <p className="text-[11px] font-semibold text-ink/75 line-clamp-2 mt-0.5">{v.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-4">
                    <p className="text-xs font-extrabold text-muted">
                      Generates a complete multi-section site + working interactive web app below. You can iterate as many times as you want!
                    </p>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="btn btn-yellow font-black text-sm sm:text-base px-7 py-3 cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Synthesizing Website &amp; Web App…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 fill-ink" /> Generate Creative Website &amp; Web App
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: ITERATE & EVOLVE UNTIL SATISFIED */}
              {activeStudioTab === "iterate" && (
                <div className="space-y-4">
                  <div className="b3 bg-cream p-4 md:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="display text-xl md:text-2xl">
                          Iterate &amp; Refine Until You Are 100% Satisfied
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-ink/80">
                          Tell the AI what to tweak, add, or restyle—or click any 1-click evolution chip below. Every change saves a snapshot so you can undo anytime!
                        </p>
                      </div>
                      <span className="chip bg-ink text-sun text-xs font-black">
                        Active Build: v{historyList.length || 1}
                      </span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleIterateSite();
                      }}
                      className="flex flex-col sm:flex-row gap-2.5"
                    >
                      <input
                        type="text"
                        value={iterationInput}
                        onChange={(e) => setIterationInput(e.target.value)}
                        placeholder="e.g. Make it darker & futuristic, raise prices to $299+, add an ROI calculator, or focus on weekend bookings..."
                        className="input flex-1 font-bold text-sm"
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !iterationInput.trim()}
                        className="btn btn-yellow font-black shrink-0 cursor-pointer"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Iterating…
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4" /> Iterate with AI ✨
                          </>
                        )}
                      </button>
                    </form>

                    {/* 1-Click Quick Iteration Chips */}
                    <div>
                      <span className="block text-[11px] font-black uppercase text-muted mb-1.5">
                        1-Click Instant AI Iterations:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_ITERATION_PROMPTS.map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleIterateSite(item.prompt)}
                            className="text-xs font-black bg-paper hover:bg-sun px-3 py-1.5 border-2 border-ink shadow-[2px_2px_0px_#000] cursor-pointer transition-all"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Version History Timeline */}
                    {historyList.length > 0 && (
                      <div className="border-t-2 border-dashed border-ink/25 pt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-black uppercase text-ink">
                          <History className="h-3.5 w-3.5" /> Version History (Click to restore):
                        </span>
                        {historyList.map((snap, idx) => (
                          <button
                            key={snap.version}
                            type="button"
                            onClick={() => handleRestoreVersion(idx)}
                            className="text-xs font-bold bg-white hover:bg-mint px-2.5 py-1 border border-ink cursor-pointer"
                            title={snap.promptUsed}
                          >
                            v{snap.version} ({snap.vibe}) · {snap.timestamp}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FREE HOSTING & CUSTOM DOMAIN PUBLISHER */}
              {activeStudioTab === "publish" && (
                <div className="space-y-4">
                  <div className="b3 bg-mint p-3.5 text-xs sm:text-sm font-black text-ink flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 fill-ink" />
                    <span>
                      🚀 Keep going — you’ve made it to Step 3! You’re moments away from taking your creation live to the world.
                    </span>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                  {/* Option A: Free Hosting on 1ClickBiz + Custom Domain Binding */}
                  <form onSubmit={handleSaveHosting} className="b3 bg-cream p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="bg-mint text-ink px-2.5 py-0.5 border border-ink text-xs font-black uppercase">
                        100% Free Instant Hosting
                      </span>
                      <span className="text-xs font-black uppercase text-emerald-800">● Live &amp; SSL Secured</span>
                    </div>
                    <h3 className="display text-2xl">
                      Host Free on Our Platform or Connect Your Custom Domain
                    </h3>

                    <div>
                      <label htmlFor="publish-slug-input" className="block text-xs font-black uppercase tracking-wider mb-1">
                        1. Your Free Hosted Link on This Site:
                      </label>
                      <div className="flex items-center border-[2.5px] border-ink bg-white">
                        <span className="bg-paper px-3 py-2 text-xs font-bold text-muted border-r-2 border-ink select-none">
                          {typeof window !== "undefined" ? window.location.host : "1clickbiz.run.place"}/sites/
                        </span>
                        <input
                          id="publish-slug-input"
                          type="text"
                          value={customSlugInput}
                          onChange={(e) =>
                            setCustomSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                          }
                          className="w-full px-3 py-2 text-sm font-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="publish-domain-input" className="block text-xs font-black uppercase tracking-wider mb-1">
                        2. Connect Your Own Custom Domain (Optional):
                      </label>
                      <input
                        id="publish-domain-input"
                        type="text"
                        value={customDomainInput}
                        onChange={(e) => setCustomDomainInput(e.target.value)}
                        placeholder="e.g. www.mynewbusiness.com"
                        className="input text-sm font-bold"
                      />
                      <p className="text-[11px] font-semibold text-muted mt-1">
                        To point your domain here, add a <strong>CNAME</strong> record for <code>www</code> or <code>@</code> pointing to <code>{typeof window !== "undefined" ? window.location.host : "1clickbiz.run.place"}</code>.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button type="submit" className="btn btn-yellow font-black text-xs sm:text-sm cursor-pointer">
                        <Globe className="h-4 w-4" /> Save &amp; Publish Live Now
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(livePublicUrl);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2500);
                        }}
                        className="btn btn-sm btn-quiet text-xs font-black cursor-pointer"
                      >
                        <Copy className="h-4 w-4" /> {copiedLink ? "Copied!" : "Copy Shareable URL"}
                      </button>
                    </div>
                  </form>

                  {/* Option B: Export Standalone Web App to Host Anywhere Else Free */}
                  <div className="b3 bg-paper p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="bg-sun text-ink px-2.5 py-0.5 border border-ink text-xs font-black uppercase">
                        Zero Lock-In · Host Anywhere Free
                      </span>
                      <h3 className="display text-2xl mt-2">
                        Export Standalone HTML5 Web App
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-ink/80 mt-1 leading-relaxed">
                        Want to host this exact website and interactive calculator on your own Cloudflare Pages, Netlify Drop, Vercel, or GitHub Pages account? Download the complete single-file web app below:
                      </p>
                      <ul className="mt-3 space-y-1.5 text-xs font-bold text-ink/85">
                        <li>✓ Includes your custom copy, theme colors, and interactive calculator JS</li>
                        <li>✓ 100% self-contained <code>index.html</code> — drag &amp; drop onto Cloudflare Pages or Netlify</li>
                        <li>✓ Zero monthly hosting fees anywhere</li>
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadStandaloneSiteHtml(data.name, data.slug, rawSite)}
                      className="btn bg-ink text-sun font-black text-xs sm:text-sm justify-center cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download Standalone Web App (.html)
                    </button>
                  </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          THE LIVE GENERATED WEBSITE + INTERACTIVE WEB APP
          ===================================================================== */}
      <div
        style={{
          background: vibeConfig.previewColors.bg,
          color: vibeConfig.previewColors.text,
          fontFamily: `"${data.theme.bodyFont || "Plus Jakarta Sans"}", system-ui, sans-serif`,
        }}
        className="flex-1 transition-colors duration-300"
      >
        {/* Top Live Announcement Bar */}
        <div
          style={{
            background: isDarkVibe ? "#1E293B" : "#131313",
            color: vibeConfig.previewColors.primary,
          }}
          className="border-b-2 border-black px-4 py-2 text-center text-xs font-black uppercase tracking-[0.18em]"
        >
          {rawSite.announcement || `⚡ OFFICIAL INTERACTIVE WEB APP · ${data.name.toUpperCase()}`}
          {rawSite.customDomain && (
            <span className="ml-3 rounded bg-white/15 px-2 py-0.5 text-[10px] text-white">
              {rawSite.customDomain}
            </span>
          )}
        </div>

        {/* Navigation Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5 border-b border-current/10">
          <a href="#top" className="flex items-center gap-3 no-underline" style={{ color: vibeConfig.previewColors.text }}>
            {(data.logo as Img)?.url && (
              <img
                src={(data.logo as Img)!.url}
                alt={`${data.name} logo`}
                className="h-12 w-12 rounded-xl border-2 border-black object-contain bg-white p-0.5 shadow-[2px_2px_0_#000]"
              />
            )}
            <div>
              <span
                className="text-xl md:text-2xl font-black tracking-tight block leading-none"
                style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
              >
                {data.name}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest opacity-65">
                {(data as any).location || "Official Site & App"}
              </span>
            </div>
          </a>
          <nav className="hidden gap-7 text-sm font-bold md:flex">
            <a href="#interactive-app" style={{ color: vibeConfig.previewColors.text }} className="hover:opacity-75">
              Interactive App
            </a>
            <a href="#services" style={{ color: vibeConfig.previewColors.text }} className="hover:opacity-75">
              Packages
            </a>
            <a href="#about" style={{ color: vibeConfig.previewColors.text }} className="hover:opacity-75">
              Why Us
            </a>
            <a href="#faq" style={{ color: vibeConfig.previewColors.text }} className="hover:opacity-75">
              FAQ
            </a>
          </nav>
          <a
            href="#interactive-app"
            className={`px-5 py-2.5 text-xs sm:text-sm font-black uppercase no-underline transition-transform hover:-translate-y-0.5 ${
              isBrutalist ? "border-2 border-black shadow-[4px_4px_0_#000]" : "rounded-full shadow-lg"
            }`}
            style={{
              background: vibeConfig.previewColors.primary,
              color: "#131313",
            }}
          >
            {rawSite.hero?.cta ?? "Instant Quote ↓"}
          </a>
        </header>

        {/* HERO + INTERACTIVE WEB APP SPLIT */}
        <section id="top" className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 md:py-20 lg:grid-cols-12">
          {/* Left Column: Hero Pitch + Trust Stats */}
          <div className="lg:col-span-6 space-y-6">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-wider ${
                isBrutalist ? "border-2 border-black shadow-[2px_2px_0_#000]" : "rounded-full"
              }`}
              style={{
                background: vibeConfig.previewColors.accent,
                color: "#131313",
              }}
            >
              <Zap className="h-3.5 w-3.5 fill-current" />
              {rawSite.hero?.eyebrow || `${(data as any).location || "Verified"} · Instant Online App`}
            </span>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.02] tracking-tight"
              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
            >
              {rawSite.hero?.headline || `${data.name}: Built for Effortless Results.`}
            </h1>

            <p className="text-base sm:text-lg leading-relaxed opacity-85 font-medium">
              {rawSite.hero?.subheadline}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#interactive-app"
                className={`px-7 py-3.5 font-black text-sm uppercase no-underline ${
                  isBrutalist ? "border-2 border-black shadow-[5px_5px_0_#000]" : "rounded-full shadow-xl"
                }`}
                style={{
                  background: vibeConfig.previewColors.primary,
                  color: "#131313",
                }}
              >
                {rawSite.hero?.cta || "Try Interactive Calculator →"}
              </a>
              <a
                href="#services"
                className={`px-6 py-3.5 font-extrabold text-sm uppercase no-underline border-2 ${
                  isBrutalist ? "border-black" : "rounded-full border-current/30"
                }`}
                style={{ color: vibeConfig.previewColors.text }}
              >
                {rawSite.hero?.secondaryCta || "See Packages"}
              </a>
            </div>

            {/* Live Trust Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-current/15">
              {(
                rawSite.hero?.stats ?? [
                  { value: "4.9 ★", label: "Customer Rating" },
                  { value: "< 60s", label: "Instant Estimate" },
                  { value: "100%", label: "Guaranteed Quality" },
                ]
              ).map((st, idx) => (
                <div
                  key={idx}
                  className={`p-3 ${
                    isBrutalist ? "border-2 border-black shadow-[2px_2px_0_#000]" : "rounded-xl border border-current/15"
                  }`}
                  style={{ background: vibeConfig.previewColors.card }}
                >
                  <p className="text-xl md:text-2xl font-black" style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}>
                    {st.value}
                  </p>
                  <p className="text-[11px] font-bold uppercase opacity-75">{st.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: LIVE INTERACTIVE WEB APP WIDGET */}
          <div id="interactive-app" className="lg:col-span-6">
            <div
              className={`p-6 md:p-8 ${
                isBrutalist
                  ? "border-[3px] border-black shadow-[10px_10px_0_#000]"
                  : "rounded-3xl border border-current/20 shadow-2xl"
              }`}
              style={{
                background: vibeConfig.previewColors.card,
                color: vibeConfig.previewColors.text,
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-4 border-b-2 border-current/15">
                <span
                  className="px-2.5 py-1 text-[11px] font-black uppercase border border-black"
                  style={{ background: vibeConfig.previewColors.accent, color: "#131313" }}
                >
                  ⚡ Live Interactive Web App
                </span>
                <span className="text-xs font-bold opacity-70">Instant Real-Time Calculation</span>
              </div>

              <h2
                className="mt-4 text-2xl md:text-3xl font-black leading-tight"
                style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
              >
                {appConfig.title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm font-medium opacity-80">
                {appConfig.subtitle}
              </p>

              {/* Interactive Range Slider */}
              <div className="mt-6 p-4 rounded-xl border-2 border-current/20 bg-black/5">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label htmlFor="live-app-slider" className="text-xs font-black uppercase tracking-wider">
                    1. {appConfig.sliderLabel}
                  </label>
                  <span
                    className="px-3 py-1 text-sm font-black border border-black"
                    style={{ background: vibeConfig.previewColors.primary, color: "#131313" }}
                  >
                    {sliderValue} {appConfig.unitLabel}
                  </span>
                </div>
                <input
                  id="live-app-slider"
                  type="range"
                  min={appConfig.sliderMin}
                  max={appConfig.sliderMax}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2.5 rounded-lg cursor-pointer accent-black"
                />
                <div className="flex justify-between text-[10px] font-bold opacity-60 mt-1">
                  <span>Min: {appConfig.sliderMin} {appConfig.unitLabel}</span>
                  <span>Max: {appConfig.sliderMax} {appConfig.unitLabel}</span>
                </div>
              </div>

              {/* Interactive Tier / Speed Multiplier Selector */}
              <div className="mt-5">
                <span className="block text-xs font-black uppercase tracking-wider mb-2">
                  2. Select Service Level / Speed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {appConfig.options.map((opt, idx) => {
                    const active = idx === selectedOptionIdx;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSelectedOptionIdx(idx)}
                        className={`p-3 text-left border-2 transition-all cursor-pointer ${
                          active
                            ? "border-black shadow-[3px_3px_0_#000] -translate-y-0.5"
                            : "border-current/25 opacity-80 hover:opacity-100"
                        }`}
                        style={{
                          background: active ? vibeConfig.previewColors.primary : "transparent",
                          color: active ? "#131313" : vibeConfig.previewColors.text,
                        }}
                      >
                        {opt.badge && (
                          <span className="inline-block text-[9px] font-black uppercase px-1.5 py-0.2 bg-black text-white mb-1">
                            {opt.badge}
                          </span>
                        )}
                        <p className="text-xs font-black leading-snug">{opt.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Calculated Output Box */}
              <div
                className="mt-6 p-5 border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ background: vibeConfig.previewColors.accent, color: "#131313" }}
              >
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider block">
                    {appConfig.resultLabel}
                  </span>
                  <p className="text-xs font-bold opacity-85">
                    {sliderValue} {appConfig.unitLabel} · {activeOption.label}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <span
                    className="text-4xl md:text-5xl font-black leading-none block"
                    style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                  >
                    ${calculatedQuote.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-black uppercase">100% Price-Lock Guarantee</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLockInQuote}
                className="mt-5 w-full py-4 px-6 font-black text-sm uppercase tracking-wider border-2 border-black bg-black text-white hover:opacity-90 cursor-pointer shadow-[4px_4px_0_#fde047]"
              >
                {appConfig.ctaText}
              </button>
            </div>
          </div>
        </section>

        {/* BENTO FEATURES GRID */}
        {!!rawSite.bentoFeatures?.length && (
          <section className="mx-auto max-w-6xl px-5 py-16 border-t border-current/10">
            <div className="mb-10">
              <span className="text-xs font-black uppercase tracking-widest opacity-70">
                Built Above &amp; Beyond
              </span>
              <h2
                className="mt-1 text-3xl md:text-5xl font-black"
                style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
              >
                Why Customers Switch to {data.name}
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {rawSite.bentoFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className={`p-6 flex flex-col justify-between ${
                    isBrutalist
                      ? "border-[3px] border-black shadow-[6px_6px_0_#000]"
                      : "rounded-2xl border border-current/15 shadow-lg"
                  }`}
                  style={{ background: vibeConfig.previewColors.card }}
                >
                  <div>
                    <span
                      className="inline-block px-2.5 py-0.5 text-[11px] font-black uppercase border border-black"
                      style={{ background: vibeConfig.previewColors.primary, color: "#131313" }}
                    >
                      {feat.badge}
                    </span>
                    <h3
                      className="mt-4 text-2xl font-black leading-snug"
                      style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                    >
                      {feat.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed opacity-85 font-medium">
                      {feat.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-current/15 flex items-center justify-between text-xs font-black uppercase">
                    <span>✓ {feat.highlight}</span>
                    <span>0{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* PACKAGES & PRICING */}
        {!!rawSite.services?.length && (
          <section
            id="services"
            className="py-20 border-y-2 border-black"
            style={{
              background: isDarkVibe ? "#111827" : "#131313",
              color: "#FFFFFF",
            }}
          >
            <div className="mx-auto max-w-6xl px-5">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <span
                    className="inline-block px-3 py-1 text-xs font-black uppercase border border-black mb-2"
                    style={{ background: vibeConfig.previewColors.accent, color: "#131313" }}
                  >
                    Transparent Flat Pricing
                  </span>
                  <h2
                    className="text-3xl md:text-5xl font-black"
                    style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                  >
                    Simple Packages. Zero Hidden Fees.
                  </h2>
                </div>
                <p className="text-sm font-semibold text-white/75 max-w-sm">
                  Click any package below to pre-select it in our instant booking form.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {rawSite.services.map((x, idx) => {
                  const isFeatured = idx === 1;
                  return (
                    <div
                      key={x.title}
                      className={`p-6 md:p-7 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
                        isBrutalist
                          ? "border-[3px] border-black shadow-[6px_6px_0_#fde047]"
                          : "rounded-2xl border border-white/20"
                      }`}
                      style={{
                        background: isFeatured ? vibeConfig.previewColors.primary : vibeConfig.previewColors.card,
                        color: isFeatured ? "#131313" : vibeConfig.previewColors.text,
                      }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 border border-black bg-white text-black">
                            {x.badge || (isFeatured ? "Most Popular" : `Tier 0${idx + 1}`)}
                          </span>
                          {x.price && (
                            <span
                              className="text-2xl md:text-3xl font-black"
                              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                            >
                              {x.price}
                            </span>
                          )}
                        </div>
                        <h3
                          className="text-2xl font-black"
                          style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                        >
                          {x.title}
                        </h3>
                        <p className="mt-2.5 text-sm leading-relaxed opacity-85 font-medium">
                          {x.description}
                        </p>

                        {x.features && x.features.length > 0 && (
                          <ul className="mt-5 space-y-2 border-t border-current/15 pt-4 text-xs font-bold">
                            {x.features.map((f) => (
                              <li key={f} className="flex items-center gap-2">
                                <Check className="h-4 w-4 shrink-0 stroke-[3]" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            message: `I'd like to book the ${x.title} (${x.price}) package. ${prev.message}`,
                          }));
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="mt-6 w-full py-3 px-4 font-black text-xs uppercase tracking-wider border-2 border-black bg-black text-white cursor-pointer hover:opacity-90"
                      >
                        Select {x.title} →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        {!!rawSite.steps?.length && (
          <section className="mx-auto max-w-6xl px-5 py-20">
            <h2
              className="text-3xl md:text-5xl font-black"
              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
            >
              How It Works in 3 Simple Steps
            </h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {rawSite.steps.map((x, i) => (
                <li
                  key={x.title}
                  className={`p-6 ${
                    isBrutalist ? "border-2 border-black shadow-[4px_4px_0_#000]" : "rounded-2xl border border-current/15"
                  }`}
                  style={{ background: vibeConfig.previewColors.card }}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-full text-lg font-black border-2 border-black"
                    style={{ background: vibeConfig.previewColors.primary, color: "#131313" }}
                  >
                    {i + 1}
                  </span>
                  <h3
                    className="mt-4 text-xl font-black"
                    style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                  >
                    {x.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-85 font-medium">{x.body}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* CUSTOMER TESTIMONIALS & SOCIAL PROOF */}
        {!!rawSite.testimonials?.length && (
          <section className="mx-auto max-w-6xl px-5 pb-20">
            <h2
              className="text-3xl md:text-4xl font-black mb-8"
              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
            >
              Loved by Customers
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {rawSite.testimonials.map((tItem, i) => (
                <div
                  key={i}
                  className={`p-6 flex flex-col justify-between ${
                    isBrutalist ? "border-2 border-black shadow-[4px_4px_0_#000]" : "rounded-2xl border border-current/15"
                  }`}
                  style={{ background: vibeConfig.previewColors.card }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-amber-500 font-black text-sm">★★★★★</span>
                      <span
                        className="px-2 py-0.5 text-[10px] font-black uppercase border border-black"
                        style={{ background: vibeConfig.previewColors.accent, color: "#131313" }}
                      >
                        {tItem.metric}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-relaxed">"{tItem.quote}"</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-current/10 text-xs">
                    <p className="font-black">{tItem.author}</p>
                    <p className="opacity-70">{tItem.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ABOUT + BENEFITS */}
        <section id="about" className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 md:grid-cols-2">
          <div>
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
            >
              {rawSite.about?.title ?? `About ${data.name}`}
            </h2>
            <p className="mt-5 whitespace-pre-line text-base sm:text-lg leading-relaxed opacity-85">
              {rawSite.about?.body}
            </p>
          </div>
          {!!rawSite.benefits?.length && (
            <ul className="space-y-4 self-center">
              {rawSite.benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 p-3.5 border-2 border-current/20 font-bold text-sm sm:text-base"
                  style={{ background: vibeConfig.previewColors.card }}
                >
                  <span
                    className="grid h-6 w-6 shrink-0 place-items-center border border-black text-xs font-black"
                    style={{ background: vibeConfig.previewColors.accent, color: "#131313" }}
                  >
                    ✓
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* FAQ */}
        {!!rawSite.faq?.length && (
          <section id="faq" className="mx-auto max-w-3xl px-5 pb-20">
            <h2
              className="text-3xl md:text-4xl font-black"
              style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
            >
              Frequently Asked Questions
            </h2>
            <div className="mt-8 divide-y border-y-2 border-current/20">
              {rawSite.faq.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="cursor-pointer list-none text-lg font-black flex items-center justify-between">
                    <span>{f.q}</span>
                    <span className="text-xl">+</span>
                  </summary>
                  <p className="mt-3 text-sm sm:text-base leading-relaxed opacity-85">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CONTACT & INSTANT CRM LEAD CAPTURE */}
        <section
          id="contact"
          className="py-20 border-t-2 border-black"
          style={{
            background: isDarkVibe ? "#111827" : "#131313",
            color: "#FFFFFF",
          }}
        >
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-2 items-center">
            <div>
              <span
                className="inline-block px-3 py-1 text-xs font-black uppercase border border-black mb-3"
                style={{ background: vibeConfig.previewColors.primary, color: "#131313" }}
              >
                Direct Priority Booking
              </span>
              <h2
                className="text-3xl md:text-5xl font-black"
                style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
              >
                {rawSite.contact?.title ?? `Start With ${data.name}`}
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/85">
                {rawSite.contact?.body}
              </p>
              <div className="mt-6 p-4 border border-white/20 bg-white/5 text-xs space-y-1">
                <p className="font-black text-yellow-300 uppercase">Your Configured Web App Estimate:</p>
                <p className="font-bold">
                  {sliderValue} {appConfig.unitLabel} · {activeOption.label} — Est. ${calculatedQuote.toLocaleString()}
                </p>
              </div>
            </div>

            <div
              className={`p-6 md:p-8 ${
                isBrutalist ? "border-[3px] border-black shadow-[8px_8px_0_#fde047]" : "rounded-2xl shadow-2xl"
              }`}
              style={{ background: vibeConfig.previewColors.card, color: vibeConfig.previewColors.text }}
            >
              {sent ? (
                <div className="py-10 text-center space-y-3">
                  <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-emerald-400 text-black border-2 border-black font-black text-xl">
                    ✓
                  </span>
                  <p
                    className="text-2xl font-black"
                    style={{ fontFamily: `"${data.theme.headingFont || "Space Grotesk"}", sans-serif` }}
                  >
                    You're in, {form.name.split(" ")[0] || "friend"}!
                  </p>
                  <p className="text-sm opacity-85">
                    Your inquiry and custom quote have been saved to our priority CRM. We'll reach out shortly.
                  </p>
                </div>
              ) : (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormErr(null);
                    submit.mutate(
                      {
                        slug: data.slug,
                        name: form.name,
                        email: form.email,
                        phone: form.phone || undefined,
                        message:
                          form.message ||
                          `[Configured Quote: ${sliderValue} ${appConfig.unitLabel}, ${activeOption.label} = $${calculatedQuote}]`,
                        company: form.company || undefined,
                      },
                      { onSuccess: () => setSent(true), onError: (er) => setFormErr(errorMessage(er)) }
                    );
                  }}
                >
                  {(["name", "email", "phone"] as const).map((k) => (
                    <label key={k} className="block">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {k}
                        {k === "phone" ? " (optional)" : " *"}
                      </span>
                      <input
                        aria-label={k}
                        required={k !== "phone"}
                        type={k === "email" ? "email" : k === "phone" ? "tel" : "text"}
                        value={form[k]}
                        onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                        className="mt-1 w-full border-2 border-current/40 bg-transparent px-3 py-2.5 text-sm font-bold outline-none focus:border-black"
                      />
                    </label>
                  ))}
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-wider">
                      Your Project / Quote Details
                    </span>
                    <textarea
                      aria-label="Message"
                      rows={3}
                      placeholder={`Include my interactive quote ($${calculatedQuote} for ${sliderValue} ${appConfig.unitLabel})...`}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="mt-1 w-full border-2 border-current/40 bg-transparent px-3 py-2.5 text-sm font-bold outline-none focus:border-black"
                    />
                  </label>
                  <input
                    type="text"
                    name="company"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                  {formErr && <p role="alert" className="text-sm font-bold text-rose-600">{formErr}</p>}
                  <button
                    disabled={submit.isPending}
                    className="w-full py-4 px-6 font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0_#000] cursor-pointer disabled:opacity-60"
                    style={{ background: vibeConfig.previewColors.primary, color: "#131313" }}
                  >
                    {submit.isPending ? "Sending…" : rawSite.contact?.button ?? "Claim My Quote & Book Now →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8 text-xs font-bold opacity-75">
          <span>
            © {new Date().getFullYear()} {data.name}
            {rawSite.customDomain ? ` · ${rawSite.customDomain}` : ""}
          </span>
          <div className="flex items-center gap-4">
            {!isEmbed && !studioOpen && (
              <button
                type="button"
                onClick={() => {
                  setStudioOpen(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="underline font-black cursor-pointer"
              >
                ✨ Edit &amp; Iterate This Site with AI
              </button>
            )}
            <a href="/" style={{ color: vibeConfig.previewColors.text }} className="underline">
              Powered by 1 Click Business
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
