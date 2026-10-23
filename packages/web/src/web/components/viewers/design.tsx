import { useEffect, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Loader2,
  Monitor,
  Palette,
  RefreshCw,
  Smartphone,
  Sparkles,
  Tablet,
  Wand2,
  Zap,
} from "lucide-react";
import type { Img } from "../../lib/tools";
import { ChooseButton, CopyButton, DownloadButton, GenImage, List, Section, type ViewerProps } from "./common";
import {
  CURATED_LOGO_PALETTES,
  LOGO_STYLE_DIRECTIONS,
  buildCuttingEdgeVectorSvg,
  buildDiffusionLogoUrl,
  downloadSvgFile,
  exportSvgToPngDownload,
  generateCuttingEdgeLogoSuite,
  type GeneratedLogoConcept,
  type LogoPalette,
  type LogoRenderMode,
} from "../../lib/ai-logo-engine";
import { saveLocalLogoConcepts } from "../../queries/business";

/** Injects a Google Fonts stylesheet for the given families (once per set). */
export function useGoogleFonts(families: (string | undefined)[]) {
  const key = families.filter(Boolean).join("|");
  useEffect(() => {
    if (!key) return;
    const id = `gf-${key.replace(/[^a-z0-9]/gi, "")}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${key
      .split("|")
      .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;600;700;800`)
      .join("&")}&display=swap`;
    document.head.appendChild(link);
  }, [key]);
}

/* ---------------- 05 Color / Font System ---------------- */

type Color = { name: string; hex: string; role: string; usage: string; onColor: string };

export function ColorFontViewer({ content: c, bizName }: ViewerProps) {
  const colors = (c.colors ?? []) as Color[];
  const heading = (c.headingFont as string) || "Space Grotesk";
  const body = (c.bodyFont as string) || "Plus Jakarta Sans";
  useGoogleFonts([heading, body]);
  const get = (role: string) => colors.find((x) => x.role === role)?.hex;

  const css = [
    ":root {",
    ...colors.map((x) => `  --color-${x.role.toLowerCase()}: ${x.hex}; /* ${x.name} */`),
    `  --font-heading: "${heading}", sans-serif;`,
    `  --font-body: "${body}", sans-serif;`,
    "}",
  ].join("\n");
  const importLine = `@import url("https://fonts.googleapis.com/css2?family=${heading.replace(/ /g, "+")}:wght@400;700&family=${body.replace(/ /g, "+")}:wght@400;600&display=swap");`;

  return (
    <div className="space-y-6">
      <div className="grid gap-0 sm:grid-cols-5">
        {colors.map((x, i) => (
          <div
            key={x.hex + i}
            className="b3 flex min-h-56 flex-col justify-between p-4 sm:[&:not(:first-child)]:border-l-0"
            style={{ background: x.hex, color: x.onColor || (i === 0 ? "#FFFFFF" : "#131313") }}
          >
            <span className="text-xs font-extrabold uppercase tracking-widest">{x.role}</span>
            <div>
              <p className="text-lg font-extrabold">{x.name}</p>
              <button
                type="button"
                className="font-mono text-sm font-bold underline decoration-2 underline-offset-4 cursor-pointer"
                onClick={() => navigator.clipboard?.writeText(x.hex)}
                title="Copy hex"
              >
                {x.hex}
              </button>
              <p className="mt-2 text-xs font-semibold opacity-90">{x.usage}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Type pairing">
          <p className="text-xs font-extrabold uppercase">Heading · {heading}</p>
          <p className="mt-1 text-4xl leading-tight" style={{ fontFamily: `"${heading}", sans-serif` }}>{bizName}</p>
          <p className="mt-5 text-xs font-extrabold uppercase">Body · {body}</p>
          <p className="mt-1 text-base" style={{ fontFamily: `"${body}", sans-serif` }}>
            The quick brown fox jumps over the lazy dog. 0123456789. Body copy should be easy to read at small sizes on any screen.
          </p>
        </Section>
        <Section title="Preview">
          <div className="b3 p-5" style={{ background: get("Background") || "#FAF7F0", color: get("Text") || "#131313" }}>
            <p className="text-2xl" style={{ fontFamily: `"${heading}", sans-serif`, color: get("Primary") === get("Background") ? get("Text") : undefined }}>
              Launch day is here.
            </p>
            <p className="mt-2 text-sm" style={{ fontFamily: `"${body}", sans-serif` }}>
              A sample card using your palette and fonts together.
            </p>
            <span
              className="mt-4 inline-block border-[3px] px-4 py-2 text-sm font-bold"
              style={{ background: get("Primary") || "#131313", color: colors.find((x) => x.role === "Primary")?.onColor || "#FFFFFF", borderColor: get("Text") || "#131313", fontFamily: `"${body}", sans-serif` }}
            >
              Book now
            </span>
            <span className="ml-3 text-sm font-bold underline decoration-[3px] underline-offset-4" style={{ color: get("Text") || "#131313", textDecorationColor: get("Accent") || "#6EE7B7" }}>Learn more</span>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Why this works"><p className="font-semibold">{c.rationale || c.fontPairingWhy || "Balanced geometric display typography paired with high-contrast brand colors."}</p></Section>
        <Section title="Usage rules"><List items={c.rules ?? ["Use Primary for headlines and primary CTAs", "Keep Background clean for maximum readability", "Reserve Accent for badges and conversion highlights"]} /></Section>
      </div>

      <Section title="Developer handoff" kicker="CSS">
        <pre className="b3 overflow-x-auto bg-ink p-4 text-xs text-sun"><code>{importLine + "\n\n" + css}</code></pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <CopyButton text={importLine + "\n\n" + css} label="Copy CSS variables" />
          <a
            className="btn btn-sm btn-quiet"
            href={`https://fonts.google.com/share?selection.family=${encodeURIComponent(heading)}|${encodeURIComponent(body)}`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <ExternalLink className="h-4 w-4" strokeWidth={3} /> Open in Google Fonts
          </a>
        </div>
      </Section>
    </div>
  );
}

/* ---------------- 06 Cutting-Edge GenAI Logo Studio ---------------- */

const QUICK_MOTIFS = [
  { label: "⚡ Lightning Hex", prompt: "electric lightning bolt inside geometric hexagon" },
  { label: "🧠 Neural Prism", prompt: "3D isometric AI neural network cube prism" },
  { label: "🌿 Botanical Leaf", prompt: "minimalist organic leaf and rising sun emblem" },
  { label: "☕ Artisan Craft", prompt: "steaming specialty coffee cup and heritage seal" },
  { label: "🏠 Modern Home", prompt: "architectural roofline and shield monogram" },
  { label: "🚀 Velocity Orbit", prompt: "ascending rocket fin with orbital ring" },
  { label: "💎 Luxury Crest", prompt: "bespoke diamond crest and editorial monogram" },
  { label: "📈 Growth Wave", prompt: "ascending kinetic wave and precision arrow" },
];

export function LogoViewer({ content, choose, choosing, bizId, bizSlug, bizName }: ViewerProps) {
  const chosen = typeof content.chosen === "number" ? content.chosen : 0;
  const [brandTitle, setBrandTitle] = useState(bizName || "1 Click Business");
  const [tagline, setTagline] = useState("AI LAUNCH STUDIO");
  const [aiPrompt, setAiPrompt] = useState("modern geometric icon mark with bold negative space");
  const [renderMode, setRenderMode] = useState<LogoRenderMode>("hybrid");
  const [palette, setPalette] = useState<LogoPalette>(CURATED_LOGO_PALETTES[0]!);
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem("1cb_gemini_api_key") || "");
  const [showAdvancedKey, setShowAdvancedKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedSvgIdx, setCopiedSvgIdx] = useState<number | null>(null);
  const [exportingIdx, setExportingIdx] = useState<number | null>(null);

  // Build initial 6-concept suite if existing concepts are old 1-item placeholder or lack svgCode
  const [concepts, setConcepts] = useState<GeneratedLogoConcept[]>(() => {
    const raw = (content.concepts ?? []) as any[];
    if (raw.length >= 3 && raw[0]?.svgCode) {
      return raw as GeneratedLogoConcept[];
    }
    return LOGO_STYLE_DIRECTIONS.map((st, idx) => {
      const svgCode = buildCuttingEdgeVectorSvg({
        businessName: bizName || "1 Click Business",
        tagline: "OFFICIAL BRAND",
        prompt: "modern geometric emblem",
        styleId: st.id,
        palette: CURATED_LOGO_PALETTES[0]!,
        seed: 100 + idx,
      });
      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
      const diffusionUrl = buildDiffusionLogoUrl({
        businessName: bizName || "1 Click Business",
        prompt: "modern geometric emblem",
        styleLabel: st.label,
        palette: CURATED_LOGO_PALETTES[0]!,
        seed: 500 + idx * 97,
      });
      return {
        id: `init-${st.id}`,
        name: `${bizName || "Brand"} — ${st.label}`,
        styleId: st.id,
        styleLabel: st.label,
        engineBadge: "GenAI Neural Vector SVG",
        rationale: st.description,
        promptUsed: `${st.label} for ${bizName}`,
        svgCode,
        svgDataUrl,
        diffusionUrl,
        activeMode: "vector" as const,
        image: { key: `init-${st.id}`, url: svgDataUrl },
      };
    });
  });

  const activeConcept = concepts[chosen] ?? concepts[0];
  const filePrefix = (brandTitle || bizName || "brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const handleGenerateAll = async (overridePalette?: LogoPalette, overridePrompt?: string, overrideMode?: LogoRenderMode) => {
    setIsGenerating(true);
    const pal = overridePalette ?? palette;
    const prm = overridePrompt ?? aiPrompt;
    const mode = overrideMode ?? renderMode;
    try {
      if (geminiKey.trim()) {
        localStorage.setItem("1cb_gemini_api_key", geminiKey.trim());
      }
      const next = await generateCuttingEdgeLogoSuite({
        businessName: brandTitle || bizName,
        tagline,
        prompt: prm,
        palette: pal,
        renderMode: mode,
        geminiApiKey: geminiKey.trim() || undefined,
      });
      setConcepts(next);
      saveLocalLogoConcepts(bizId, next, chosen);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCardMode = (idx: number, mode: "vector" | "diffusion") => {
    const next = concepts.map((c, i) => {
      if (i !== idx) return c;
      const url = mode === "diffusion" && c.diffusionUrl ? c.diffusionUrl : c.svgDataUrl;
      return {
        ...c,
        activeMode: mode,
        engineBadge: mode === "diffusion" ? "GenAI Diffusion Render" : "GenAI Neural Vector SVG",
        image: { ...c.image, url },
      };
    });
    setConcepts(next);
    saveLocalLogoConcepts(bizId, next, chosen);
  };

  const handleSelectConcept = (idx: number) => {
    saveLocalLogoConcepts(bizId, concepts, idx);
    if (choose) choose(idx);
  };

  return (
    <div className="space-y-8">
      {/* Cutting-Edge GenAI Logo Studio Control Panel */}
      <section className="b3 hard bg-paper p-5 md:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-[3px] border-ink pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-ink text-sun px-2.5 py-1 text-xs font-black uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-mint" /> Multi-Engine GenAI Logo Studio
              </span>
              <span className="chip bg-mint text-ink text-xs font-black">
                Neural Vector SVG + Diffusion AI
              </span>
            </div>
            <h2 className="display mt-2 text-3xl md:text-4xl">
              Generate &amp; Customize Your Brand Mark with AI
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-bold text-ink/75 max-w-3xl">
              Combine <strong>GenAI Diffusion image synthesis</strong> with <strong>precision Neural-Vector SVG architecture</strong>. Every concept exports in infinite-scale SVG, 2048×2048 HD PNG, and updates your live website in 1 click.
            </p>
          </div>

          {/* Render Engine Switcher */}
          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Active GenAI Mode:</span>
            <div className="inline-flex border-[2.5px] border-ink bg-cream p-1">
              {(
                [
                  { id: "hybrid", label: "⚡ Hybrid AI (Vector + Diffusion)" },
                  { id: "vector-ai", label: "📐 Neural Vector SVG" },
                  { id: "diffusion-ai", label: "🎨 Diffusion Raster AI" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setRenderMode(m.id);
                    handleGenerateAll(palette, aiPrompt, m.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-black uppercase transition-all cursor-pointer ${
                    renderMode === m.id ? "bg-ink text-sun shadow-[2px_2px_0px_#000]" : "text-ink hover:bg-paper"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Name, Tagline, and AI Prompt Inputs */}
        <div className="mt-6 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <div>
              <label htmlFor="logo-brand-name" className="block text-xs font-black uppercase tracking-wider mb-1">
                1. Brand Name on Logo
              </label>
              <input
                id="logo-brand-name"
                type="text"
                value={brandTitle}
                onChange={(e) => setBrandTitle(e.target.value)}
                className="input font-extrabold text-sm"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <label htmlFor="logo-tagline" className="block text-xs font-black uppercase tracking-wider mb-1">
                2. Subtitle / Est. Tagline
              </label>
              <input
                id="logo-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="input font-bold text-xs"
                placeholder="e.g. EST. 2026 · AUSTIN TX"
              />
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="logo-ai-prompt" className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Wand2 className="h-3.5 w-3.5" /> 3. Describe Your Logo Icon / Visual Prompt
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedKey((s) => !s)}
                  className="text-[11px] font-extrabold underline text-muted hover:text-ink cursor-pointer"
                >
                  {showAdvancedKey ? "Hide Gemini API Key" : "Optional: Connect Custom Gemini Key"}
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="logo-ai-prompt"
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateAll()}
                  className="input flex-1 font-semibold text-sm"
                  placeholder="Describe symbol, mood, or motif (e.g. minimalist falcon wing, lightning bolt inside hexagon)..."
                />
                <button
                  type="button"
                  onClick={() => handleGenerateAll()}
                  disabled={isGenerating}
                  className="btn btn-yellow shrink-0 font-black cursor-pointer shadow-[3px_3px_0px_#000]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Synthesizing 6 Logos…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-ink" /> Generate 6 AI Logos
                    </>
                  )}
                </button>
              </div>

              {showAdvancedKey && (
                <div className="mt-3 bg-cream p-3 border-2 border-ink">
                  <label htmlFor="gemini-logo-key" className="block text-[11px] font-black uppercase mb-1">
                    Optional Google Gemini API Key (Enables live Gemini 2.5 Flash bespoke SVG code synthesis):
                  </label>
                  <input
                    id="gemini-logo-key"
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="input !py-1.5 text-xs font-mono"
                  />
                </div>
              )}

              {/* Quick Motif Chips */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-muted mr-1">1-Click Motifs:</span>
                {QUICK_MOTIFS.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => {
                      setAiPrompt(m.prompt);
                      handleGenerateAll(palette, m.prompt, renderMode);
                    }}
                    className="text-xs font-bold bg-cream hover:bg-sun px-2.5 py-1 border border-ink transition-colors cursor-pointer"
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Palette Bar */}
        <div className="mt-6 pt-5 border-t-2 border-dashed border-ink/30">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="h-4 w-4" /> 4. Select Color System (Instantly Recolors All 6 AI Concepts):
            </span>
            <div className="flex items-center gap-3 text-xs font-bold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span>Primary</span>
                <input
                  type="color"
                  value={palette.primary}
                  onChange={(e) => {
                    const next = { ...palette, id: "custom", name: "Custom", primary: e.target.value };
                    setPalette(next);
                    handleGenerateAll(next, aiPrompt, renderMode);
                  }}
                  className="h-6 w-8 border border-ink cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span>Dark/Base</span>
                <input
                  type="color"
                  value={palette.secondary}
                  onChange={(e) => {
                    const next = { ...palette, id: "custom", name: "Custom", secondary: e.target.value };
                    setPalette(next);
                    handleGenerateAll(next, aiPrompt, renderMode);
                  }}
                  className="h-6 w-8 border border-ink cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span>Accent</span>
                <input
                  type="color"
                  value={palette.accent}
                  onChange={(e) => {
                    const next = { ...palette, id: "custom", name: "Custom", accent: e.target.value };
                    setPalette(next);
                    handleGenerateAll(next, aiPrompt, renderMode);
                  }}
                  className="h-6 w-8 border border-ink cursor-pointer"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {CURATED_LOGO_PALETTES.map((p) => {
              const active = palette.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPalette(p);
                    handleGenerateAll(p, aiPrompt, renderMode);
                  }}
                  className={`p-2.5 border-2 border-ink text-left transition-all cursor-pointer ${
                    active ? "bg-sun shadow-[3px_3px_0px_#000] -translate-y-0.5" : "bg-white hover:bg-cream"
                  }`}
                >
                  <div className="flex h-5 w-full border border-ink mb-1.5">
                    <span className="flex-1" style={{ background: p.secondary }} />
                    <span className="flex-1" style={{ background: p.primary }} />
                    <span className="flex-1" style={{ background: p.accent }} />
                  </div>
                  <p className="text-[11px] font-black truncate">{p.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 Generated AI Logo Concepts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {concepts.map((x, i) => {
          const isSelected = i === chosen;
          return (
            <article
              key={x.id || i}
              className={`b3 hard flex flex-col justify-between transition-all ${
                isSelected ? "bg-sun/25 ring-4 ring-ink" : "bg-paper"
              }`}
            >
              <div>
                {/* Card Top Bar */}
                <div className="flex items-center justify-between gap-2 border-b-[3px] border-ink bg-paper px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="bg-ink text-sun px-2 py-0.5 text-xs font-black">0{i + 1}</span>
                    <span className="font-black text-xs uppercase truncate">{x.styleLabel || x.style}</span>
                  </div>
                  <span className="bg-mint text-ink px-2 py-0.5 border border-ink text-[10px] font-black uppercase shrink-0">
                    {x.engineBadge || "GenAI Logo"}
                  </span>
                </div>

                {/* Logo Canvas Preview */}
                <div className="relative m-4 aspect-square border-[3px] border-ink bg-white grid place-items-center overflow-hidden shadow-[3px_3px_0px_#000]">
                  <img
                    src={x.image?.url}
                    alt={`Logo concept ${i + 1}: ${x.styleLabel || x.style}`}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      // If external diffusion URL is rate-limited or offline, seamlessly fall back to crisp neural SVG
                      if (x.svgDataUrl && (e.currentTarget as HTMLImageElement).src !== x.svgDataUrl) {
                        (e.currentTarget as HTMLImageElement).src = x.svgDataUrl;
                      }
                    }}
                  />

                  {/* Per-Card Vector vs Diffusion Switcher */}
                  {x.svgDataUrl && x.diffusionUrl && (
                    <div className="absolute bottom-2.5 right-2.5 flex border-2 border-ink bg-paper/95 p-0.5 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">
                      <button
                        type="button"
                        onClick={() => toggleCardMode(i, "vector")}
                        className={`px-2 py-1 cursor-pointer ${
                          x.activeMode !== "diffusion" ? "bg-ink text-sun" : "text-ink hover:bg-cream"
                        }`}
                        title="Crisp scalable vector SVG"
                      >
                        Vector SVG
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCardMode(i, "diffusion")}
                        className={`px-2 py-1 cursor-pointer ${
                          x.activeMode === "diffusion" ? "bg-ink text-sun" : "text-ink hover:bg-cream"
                        }`}
                        title="Generative AI raster render"
                      >
                        AI Diffusion
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4 pb-3">
                  <p className="text-xs font-semibold text-ink/80">{x.rationale || x.style}</p>
                </div>
              </div>

              {/* Actions & Multi-Format Exports */}
              <div className="border-t-[3px] border-ink bg-paper p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <ChooseButton
                    selected={isSelected}
                    disabled={choosing}
                    onClick={() => handleSelectConcept(i)}
                  />
                  {isSelected && (
                    <span className="text-[11px] font-black uppercase text-emerald-800">
                      ✓ Active on /sites/{bizSlug}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-dashed border-ink/30">
                  {x.svgCode ? (
                    <>
                      <button
                        type="button"
                        onClick={() => downloadSvgFile(x.svgCode, `${filePrefix}-logo-${i + 1}.svg`)}
                        className="btn btn-sm btn-quiet !px-2 !py-1.5 text-[11px] font-black justify-center cursor-pointer"
                        title="Download scalable vector SVG"
                      >
                        <Download className="h-3.5 w-3.5" /> SVG
                      </button>
                      <button
                        type="button"
                        disabled={exportingIdx === i}
                        onClick={async () => {
                          setExportingIdx(i);
                          await exportSvgToPngDownload(x.svgCode, `${filePrefix}-logo-${i + 1}-hd.png`, 2048);
                          setExportingIdx(null);
                        }}
                        className="btn btn-sm btn-quiet !px-2 !py-1.5 text-[11px] font-black justify-center cursor-pointer"
                        title="Download 2048x2048 High-Resolution PNG"
                      >
                        <Download className="h-3.5 w-3.5" /> {exportingIdx === i ? "…" : "HD PNG"}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard?.writeText(x.svgCode);
                          setCopiedSvgIdx(i);
                          setTimeout(() => setCopiedSvgIdx(null), 1800);
                        }}
                        className="btn btn-sm btn-quiet !px-2 !py-1.5 text-[11px] font-black justify-center cursor-pointer"
                        title="Copy inline SVG code"
                      >
                        {copiedSvgIdx === i ? <Check className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
                        {copiedSvgIdx === i ? "Copied" : "Code"}
                      </button>
                    </>
                  ) : (
                    <DownloadButton img={x.image} filename={`${filePrefix}-logo-${i + 1}.png`} />
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Live Brand Mockup Showcase for Selected Logo */}
      {activeConcept?.image?.url && (
        <Section title="Live Brand Identity Mockups" kicker={`Concept #0${chosen + 1} in Action`}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Mockup 1: Website Header Bar */}
            <div className="b3 bg-white p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">
                1. Live Website Header (/sites/{bizSlug})
              </span>
              <div className="border-2 border-ink bg-paper p-3 flex items-center justify-between shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeConcept.image.url}
                    alt=""
                    className="h-10 w-10 border border-ink object-contain bg-white"
                  />
                  <span className="display text-sm">{brandTitle || bizName}</span>
                </div>
                <span className="bg-ink text-sun px-2.5 py-1 text-[10px] font-black uppercase">
                  Get Started
                </span>
              </div>
              <p className="mt-3 text-xs font-semibold text-muted">
                Automatically synced to your hosted site header.
              </p>
            </div>

            {/* Mockup 2: iOS / Mobile App Icon & Favicon */}
            <div className="b3 bg-cream p-4 flex flex-col justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 block">
                2. iOS App Squircle &amp; Browser Favicon
              </span>
              <div className="flex items-center justify-center gap-6 py-2">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-[22px] border-2 border-ink bg-white shadow-[4px_4px_0px_#000] overflow-hidden p-1.5 mx-auto">
                    <img src={activeConcept.image.url} alt="" className="h-full w-full object-contain" />
                  </div>
                  <p className="mt-1.5 text-[11px] font-black truncate max-w-[90px]">{brandTitle || bizName}</p>
                </div>
                <div className="text-center">
                  <div className="h-10 w-10 rounded-lg border-2 border-ink bg-white shadow-[2px_2px_0px_#000] overflow-hidden p-1 mx-auto">
                    <img src={activeConcept.image.url} alt="" className="h-full w-full object-contain" />
                  </div>
                  <p className="mt-1.5 text-[10px] font-bold text-muted">Favicon</p>
                </div>
              </div>
              {activeConcept.svgCode && (
                <button
                  type="button"
                  onClick={() => exportSvgToPngDownload(activeConcept.svgCode, `${filePrefix}-favicon-64.png`, 64)}
                  className="btn btn-sm btn-quiet w-full mt-2 text-xs font-black justify-center cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" /> Download 64×64 Favicon PNG
                </button>
              )}
            </div>

            {/* Mockup 3: Executive Business Card */}
            <div className="b3 bg-ink text-sun p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000]">
              <div className="flex items-start justify-between gap-3">
                <img
                  src={activeConcept.image.url}
                  alt=""
                  className="h-14 w-14 rounded-lg border-2 border-sun bg-white object-contain p-1"
                />
                <span className="font-mono text-[10px] text-mint uppercase tracking-widest">
                  FOUNDER EDITION
                </span>
              </div>
              <div className="mt-6 pt-3 border-t border-sun/20">
                <p className="display text-lg text-sun">{brandTitle || bizName}</p>
                <p className="font-mono text-xs text-cream/80">
                  {window.location.host}/sites/{bizSlug}
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

/* ---------------- 07 Website Generator ---------------- */

export function WebsiteViewer({ content: c, bizSlug }: ViewerProps) {
  const url = `${window.location.origin}/sites/${bizSlug}`;
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const deviceWidth =
    device === "desktop" ? "w-full" : device === "tablet" ? "w-[768px] mx-auto" : "w-[390px] mx-auto";

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 bg-ink p-5 text-sun md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Your site is live at</p>
          <p className="mt-1 truncate font-mono text-lg font-bold">{url}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={url} label="Copy link" className="!bg-paper" />
          <a href={`/sites/${bizSlug}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-yellow">
            <ExternalLink className="h-4 w-4" strokeWidth={3} /> Open site in new tab
          </a>
        </div>
      </div>

      <div className="card overflow-hidden bg-cream border-[3px] border-ink p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-paper px-4 py-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-sun" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-mint" />
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-ink" />
            <span className="ml-2 font-mono text-xs font-bold text-ink truncate">/sites/{bizSlug}</span>
          </div>

          {/* Viewport switch controls */}
          <div className="flex items-center gap-1 bg-cream p-1 border-2 border-ink">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "desktop" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("tablet")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "tablet" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Tablet className="h-3.5 w-3.5" /> Tablet
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`px-3 py-1 text-xs font-black uppercase flex items-center gap-1 cursor-pointer transition-colors ${
                device === "mobile" ? "bg-ink text-sun shadow-[1px_1px_0px_#000]" : "text-ink hover:bg-paper"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
          </div>
        </div>

        <div className="bg-paper p-2 overflow-x-auto">
          <div className={`${deviceWidth} transition-all duration-300 border-2 border-ink shadow-[4px_4px_0px_#000]`}>
            <iframe
              title="Website preview"
              src={`/sites/${bizSlug}`}
              className="h-[680px] w-full bg-white"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="SEO" kicker="Search result">
          <p className="text-lg font-extrabold text-[#1a0dab]">{c.seo?.title}</p>
          <p className="text-sm font-semibold">{c.seo?.description}</p>
        </Section>
        <Section title="Hero image">
          <GenImage img={c.heroImage as Img} alt="Website hero" className="aspect-video w-full" />
        </Section>
      </div>
      <p className="text-sm font-bold">
        Enquiries from the contact form go to your Customer CRM. To change copy, describe the change in the box above and regenerate.
      </p>
    </div>
  );
}
