import { GoogleGenAI } from "@google/genai";

export type LogoStyleId =
  | "negative-space"
  | "neo-brutalist"
  | "isometric-3d"
  | "luxury-crest"
  | "kinetic-motif"
  | "app-lockup";

export type LogoRenderMode = "hybrid" | "vector-ai" | "diffusion-ai";

export interface LogoPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface GeneratedLogoConcept {
  id: string;
  name: string;
  styleId: LogoStyleId;
  styleLabel: string;
  engineBadge: string;
  rationale: string;
  promptUsed: string;
  svgCode: string;
  svgDataUrl: string;
  diffusionUrl?: string;
  activeMode: "vector" | "diffusion";
  image: {
    key: string;
    url: string;
  };
}

export const CURATED_LOGO_PALETTES: LogoPalette[] = [
  {
    id: "neo-sun",
    name: "1-Click Cyber Sun",
    primary: "#FDE047",
    secondary: "#131313",
    accent: "#6EE7B7",
    background: "#FAF7F0",
    text: "#131313",
  },
  {
    id: "stripe-indigo",
    name: "Silicon Valley Indigo",
    primary: "#635BFF",
    secondary: "#0A2540",
    accent: "#00D4B6",
    background: "#FFFFFF",
    text: "#0A2540",
  },
  {
    id: "emerald-luxury",
    name: "Heritage Emerald & Gold",
    primary: "#D4AF37",
    secondary: "#062C21",
    accent: "#10B981",
    background: "#F9F6F0",
    text: "#062C21",
  },
  {
    id: "crimson-bold",
    name: "Hyper-Growth Crimson",
    primary: "#FF3366",
    secondary: "#111115",
    accent: "#FFB800",
    background: "#FFFFFF",
    text: "#111115",
  },
  {
    id: "nordic-eco",
    name: "Botanical Earth & Sage",
    primary: "#2D6A4F",
    secondary: "#1B4332",
    accent: "#D8F3DC",
    background: "#F8F9FA",
    text: "#1B4332",
  },
  {
    id: "obsidian-neon",
    name: "Obsidian AI Neon",
    primary: "#38BDF8",
    secondary: "#090D16",
    accent: "#A855F7",
    background: "#090D16",
    text: "#F8FAFC",
  },
];

export const LOGO_STYLE_DIRECTIONS: {
  id: LogoStyleId;
  label: string;
  badge: string;
  description: string;
}[] = [
  {
    id: "negative-space",
    label: "Negative-Space Vector Mark",
    badge: "SaaS / Tech",
    description: "Golden-ratio geometric symbol with precision negative-space cuts (Linear / Stripe aesthetic).",
  },
  {
    id: "neo-brutalist",
    label: "Swiss Neo-Brutalist Grid",
    badge: "Bold Brand",
    description: "High-contrast architectural framing, hard shadows, and unmistakable display typography.",
  },
  {
    id: "isometric-3d",
    label: "3D Isometric Neural Core",
    badge: "Cutting-Edge AI",
    description: "Multi-layered isometric prism with luminous vector gradients and futuristic depth.",
  },
  {
    id: "luxury-crest",
    label: "Editorial Monogram Seal",
    badge: "Premium / Bespoke",
    description: "Architectural crest with custom monogram ligatures and timeless luxury proportions.",
  },
  {
    id: "kinetic-motif",
    label: "Industry Symbol & Wordmark",
    badge: "Custom Motif",
    description: "Context-aware symbol synthesized directly from your industry & prompt keywords.",
  },
  {
    id: "app-lockup",
    label: "App Icon + Horizontal Lockup",
    badge: "Product Ready",
    description: "iOS/Web squircle app icon paired with a clean horizontal website header lockup.",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getInitials(name: string): string {
  const words = name
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "1C";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

/** Picks an industry-specific SVG path motif based on the prompt/business context */
function pickMotifGeometry(promptText: string, primary: string, accent: string, secondary: string): string {
  const p = promptText.toLowerCase();
  if (/coffee|cafe|tea|drink|brew|bakery|bread|food|kitchen|Chef/.test(p)) {
    return `
      <path d="M155 130 H235 V175 C235 198 217 215 195 215 C173 215 155 198 155 175 Z" fill="${primary}" stroke="${secondary}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M235 142 H250 C259 142 266 149 266 158 C266 167 259 174 250 174 H235" fill="none" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
      <path d="M178 102 C178 112 186 112 186 122" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>
      <path d="M202 96 C202 108 210 108 210 120" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round"/>
      <line x1="145" y1="227" x2="245" y2="227" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
    `;
  }
  if (/eco|green|leaf|plant|clean|nature|organic|solar|earth|garden/.test(p)) {
    return `
      <path d="M200 100 C245 100 265 140 245 185 C225 225 175 225 155 185 C135 140 155 100 200 100 Z" fill="${accent}" stroke="${secondary}" stroke-width="6"/>
      <path d="M200 105 C230 135 230 185 200 220 C170 185 170 135 200 105 Z" fill="${primary}" stroke="${secondary}" stroke-width="5"/>
      <line x1="200" y1="125" x2="200" y2="232" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>
    `;
  }
  if (/home|house|roof|realty|property|repair|build|construct|interior|clean/.test(p)) {
    return `
      <polygon points="200,98 265,152 248,152 248,218 152,218 152,152 135,152" fill="${primary}" stroke="${secondary}" stroke-width="6" stroke-linejoin="round"/>
      <rect x="184" y="172" width="32" height="46" rx="4" fill="${accent}" stroke="${secondary}" stroke-width="5"/>
      <circle cx="200" cy="138" r="11" fill="${secondary}"/>
    `;
  }
  if (/fitness|gym|health|run|sport|wellness|yoga|coach/.test(p)) {
    return `
      <circle cx="200" cy="160" r="62" fill="${primary}" stroke="${secondary}" stroke-width="6"/>
      <path d="M158 162 L182 162 L193 134 L209 188 L220 154 L242 154" fill="none" stroke="${secondary}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="200" cy="160" r="50" fill="none" stroke="${accent}" stroke-width="3" stroke-dasharray="6 6"/>
    `;
  }
  // Default high-tech AI / lightning / growth motif
  return `
    <polygon points="200,92 258,126 258,194 200,228 142,194 142,126" fill="${secondary}" stroke="${primary}" stroke-width="5"/>
    <polygon points="208,108 172,164 202,164 192,212 228,156 198,156" fill="${primary}" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round"/>
  `;
}

export function buildCuttingEdgeVectorSvg(opts: {
  businessName: string;
  tagline?: string;
  prompt?: string;
  styleId: LogoStyleId;
  palette: LogoPalette;
  seed?: number;
}): string {
  const cleanName = escapeXml((opts.businessName || "1 Click Biz").trim());
  const upperName = cleanName.toUpperCase();
  const cleanTagline = escapeXml((opts.tagline || "AI LAUNCH STUDIO").trim().toUpperCase().slice(0, 34));
  const initials = escapeXml(getInitials(opts.businessName || "1 Click Biz"));
  const { primary, secondary, accent, background } = opts.palette;
  const fontSize = upperName.length > 18 ? 22 : upperName.length > 13 ? 26 : 32;

  switch (opts.styleId) {
    case "negative-space":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <defs>
          <linearGradient id="nsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primary}" />
            <stop offset="100%" stop-color="${accent}" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" rx="32" fill="${background}"/>
        <g transform="translate(200, 152)">
          <rect x="-66" y="-66" width="132" height="132" rx="30" fill="${secondary}"/>
          <path d="M-34 -18 L0 -46 L34 -18 L34 26 L0 46 L-34 26 Z" fill="url(#nsGrad)"/>
          <path d="M-16 -6 L0 -18 L16 -6 L16 14 L0 24 L-16 14 Z" fill="${secondary}"/>
          <circle cx="0" cy="3" r="6" fill="${primary}"/>
        </g>
        <text x="200" y="282" text-anchor="middle" font-family="'Space Grotesk', system-ui, -apple-system, sans-serif" font-weight="900" font-size="${fontSize}" fill="${secondary}" letter-spacing="1.5">${upperName}</text>
        <text x="200" y="310" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="11" fill="${secondary}" opacity="0.65" letter-spacing="4">${cleanTagline}</text>
      </svg>`;

    case "neo-brutalist":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <rect width="400" height="400" fill="${background}"/>
        <rect x="24" y="24" width="352" height="352" fill="none" stroke="${secondary}" stroke-width="6"/>
        <rect x="132" y="72" width="144" height="144" fill="${secondary}"/>
        <rect x="122" y="62" width="144" height="144" fill="${primary}" stroke="${secondary}" stroke-width="6"/>
        <circle cx="194" cy="134" r="44" fill="${accent}" stroke="${secondary}" stroke-width="6"/>
        <text x="194" y="150" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="42" fill="${secondary}">${initials}</text>
        <rect x="58" y="246" width="284" height="58" fill="${secondary}"/>
        <rect x="52" y="240" width="284" height="58" fill="${primary}" stroke="${secondary}" stroke-width="5"/>
        <text x="194" y="278" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="${Math.min(fontSize, 26)}" fill="${secondary}" letter-spacing="2">${upperName}</text>
        <text x="200" y="336" text-anchor="middle" font-family="monospace" font-weight="800" font-size="11" fill="${secondary}" letter-spacing="3">EST. 2026 · ${cleanTagline.slice(0, 22)}</text>
      </svg>`;

    case "isometric-3d":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <defs>
          <linearGradient id="isoTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primary}" />
            <stop offset="100%" stop-color="${accent}" />
          </linearGradient>
          <linearGradient id="isoLeft" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${accent}" />
            <stop offset="100%" stop-color="${secondary}" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" rx="32" fill="${secondary}"/>
        <circle cx="200" cy="155" r="88" fill="none" stroke="${primary}" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="6 6"/>
        <g transform="translate(200, 155)">
          <polygon points="0,-70 64,-34 0,2 -64,-34" fill="url(#isoTop)"/>
          <polygon points="-64,-34 0,2 0,74 -64,38" fill="url(#isoLeft)"/>
          <polygon points="64,-34 0,2 0,74 64,38" fill="${primary}" fill-opacity="0.82"/>
          <polygon points="0,-36 32,-18 0,0 -32,-18" fill="${secondary}"/>
          <circle cx="0" cy="-18" r="7" fill="${accent}"/>
        </g>
        <text x="200" y="292" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="${fontSize}" fill="#FFFFFF" letter-spacing="2">${upperName}</text>
        <rect x="135" y="312" width="130" height="4" rx="2" fill="url(#isoTop)"/>
        <text x="200" y="338" text-anchor="middle" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="10.5" fill="${accent}" letter-spacing="4">${cleanTagline}</text>
      </svg>`;

    case "luxury-crest":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <rect width="400" height="400" rx="24" fill="${background}"/>
        <circle cx="200" cy="158" r="82" fill="${secondary}" stroke="${primary}" stroke-width="5"/>
        <circle cx="200" cy="158" r="70" fill="none" stroke="${accent}" stroke-width="1.8" stroke-dasharray="4 4"/>
        <polygon points="200,86 206,100 220,100 209,109 213,122 200,114 187,122 191,109 180,100 194,100" fill="${primary}"/>
        <text x="200" y="182" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="54" fill="${primary}" letter-spacing="2">${initials}</text>
        <text x="200" y="286" text-anchor="middle" font-family="Georgia, 'Playfair Display', serif" font-weight="700" font-size="${fontSize}" fill="${secondary}" letter-spacing="1.5">${cleanName}</text>
        <line x1="110" y1="304" x2="290" y2="304" stroke="${primary}" stroke-width="2.5"/>
        <text x="200" y="326" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="10.5" fill="${secondary}" letter-spacing="4.5">${cleanTagline}</text>
      </svg>`;

    case "kinetic-motif":
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <rect width="400" height="400" rx="28" fill="${background}"/>
        <circle cx="200" cy="160" r="76" fill="${accent}" fill-opacity="0.2" stroke="${secondary}" stroke-width="4"/>
        ${pickMotifGeometry(`${opts.businessName} ${opts.prompt || ""} ${opts.tagline || ""}`, primary, accent, secondary)}
        <text x="200" y="286" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="${fontSize}" fill="${secondary}" letter-spacing="1">${upperName}</text>
        <text x="200" y="314" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="${secondary}" opacity="0.7" letter-spacing="3.5">${cleanTagline}</text>
      </svg>`;

    case "app-lockup":
    default:
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="800" height="800">
        <defs>
          <linearGradient id="appBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${secondary}" />
            <stop offset="100%" stop-color="#1E293B" />
          </linearGradient>
        </defs>
        <rect width="400" height="400" rx="28" fill="${background}"/>
        <rect x="130" y="68" width="140" height="140" rx="34" fill="url(#appBg)" stroke="${primary}" stroke-width="5"/>
        <circle cx="200" cy="138" r="42" fill="${primary}"/>
        <path d="M188 122 L218 138 L188 154 Z" fill="${secondary}"/>
        <text x="200" y="268" text-anchor="middle" font-family="'Space Grotesk', system-ui, sans-serif" font-weight="900" font-size="${fontSize}" fill="${secondary}" letter-spacing="1">${cleanName}</text>
        <rect x="125" y="286" width="150" height="28" rx="14" fill="${accent}" stroke="${secondary}" stroke-width="2.5"/>
        <text x="200" y="304" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="${secondary}" letter-spacing="2.5">${cleanTagline.slice(0, 20)}</text>
      </svg>`;
  }
}

export function buildDiffusionLogoUrl(opts: {
  businessName: string;
  prompt?: string;
  styleLabel: string;
  palette: LogoPalette;
  seed: number;
}): string {
  const fullPrompt = [
    `Minimalist flat vector brand logo mark for "${opts.businessName}"`,
    opts.prompt ? `featuring ${opts.prompt}` : "iconic modern geometric symbol",
    `Style: ${opts.styleLabel}, Dribbble Pentagram Paul Rand identity design`,
    `Colors: ${opts.palette.primary}, ${opts.palette.secondary}, ${opts.palette.accent}`,
    "centered on clean solid background, crisp vector lines, no realistic photo clutter, high contrast",
  ].join(", ");
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=800&height=800&seed=${opts.seed}&nologo=true`;
}

/** Optional Gemini AI SVG synthesis when a user supplies a Gemini API key or VITE_GEMINI_API_KEY */
export async function generateGeminiSvgLogo(opts: {
  apiKey: string;
  businessName: string;
  tagline?: string;
  prompt?: string;
  styleLabel: string;
  palette: LogoPalette;
}): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: opts.apiKey });
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a cutting-edge, agency-grade, valid standalone SVG logo (viewBox="0 0 400 400" width="800" height="800") for the brand "${opts.businessName}" (tagline: "${opts.tagline || ""}").
Style direction: ${opts.styleLabel}.
Visual motif / prompt: ${opts.prompt || "modern iconic geometric emblem"}.
Color palette: Primary ${opts.palette.primary}, Secondary ${opts.palette.secondary}, Accent ${opts.palette.accent}, Background ${opts.palette.background}.
Requirements:
- Return ONLY raw <svg ...>...</svg> code, no markdown fences, no explanation.
- Include intricate geometric paths, gradients, custom emblem/symbol centered around y=155, and crisp <text> for "${opts.businessName}" at y=285.`,
    });
    const raw = (res.text || "").trim();
    const match = raw.match(/<svg[\s\S]*?<\/svg>/i);
    if (match) return match[0];
  } catch (err) {
    console.warn("Gemini SVG synthesis fallback:", err);
  }
  return null;
}

export async function generateCuttingEdgeLogoSuite(opts: {
  businessName: string;
  tagline?: string;
  prompt?: string;
  palette: LogoPalette;
  selectedStyles?: LogoStyleId[];
  renderMode?: LogoRenderMode;
  geminiApiKey?: string;
}): Promise<GeneratedLogoConcept[]> {
  const stylesToRun =
    opts.selectedStyles && opts.selectedStyles.length > 0
      ? LOGO_STYLE_DIRECTIONS.filter((s) => opts.selectedStyles!.includes(s.id))
      : LOGO_STYLE_DIRECTIONS;

  const baseSeed = Math.floor(Math.random() * 90000) + 10000;

  const results = await Promise.all(
    stylesToRun.map(async (st, idx) => {
      let svgCode = buildCuttingEdgeVectorSvg({
        businessName: opts.businessName,
        tagline: opts.tagline,
        prompt: opts.prompt,
        styleId: st.id,
        palette: opts.palette,
        seed: baseSeed + idx,
      });

      if (opts.geminiApiKey && idx === 0) {
        const aiSvg = await generateGeminiSvgLogo({
          apiKey: opts.geminiApiKey,
          businessName: opts.businessName,
          tagline: opts.tagline,
          prompt: opts.prompt,
          styleLabel: st.label,
          palette: opts.palette,
        });
        if (aiSvg) svgCode = aiSvg;
      }

      const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
      const diffusionUrl = buildDiffusionLogoUrl({
        businessName: opts.businessName,
        prompt: opts.prompt,
        styleLabel: st.label,
        palette: opts.palette,
        seed: baseSeed + idx * 137,
      });

      const useDiffusion =
        opts.renderMode === "diffusion-ai" || (opts.renderMode === "hybrid" && idx % 2 === 1);

      return {
        id: `logo-${st.id}-${baseSeed + idx}`,
        name: `${opts.businessName} — ${st.label}`,
        styleId: st.id,
        styleLabel: st.label,
        engineBadge: useDiffusion ? "GenAI Diffusion Render" : "GenAI Neural Vector SVG",
        rationale: st.description,
        promptUsed: opts.prompt || `${st.label} for ${opts.businessName}`,
        svgCode,
        svgDataUrl,
        diffusionUrl,
        activeMode: useDiffusion ? ("diffusion" as const) : ("vector" as const),
        image: {
          key: `genai-logo-${st.id}-${baseSeed + idx}`,
          url: useDiffusion ? diffusionUrl : svgDataUrl,
        },
      };
    })
  );

  return results;
}

/** Exports an SVG string to a high-resolution PNG file download using an offscreen HTML5 Canvas */
export async function exportSvgToPngDownload(svgCode: string, filename: string, size = 2048) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        canvas.toBlob((blob) => {
          if (blob) {
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = filename;
            a.click();
            setTimeout(() => URL.revokeObjectURL(a.href), 2000);
          }
          URL.revokeObjectURL(url);
          resolve();
        }, "image/png");
      } else {
        URL.revokeObjectURL(url);
        resolve();
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}

export function downloadSvgFile(svgCode: string, filename: string) {
  const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
