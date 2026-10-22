import { generateText, jsonSchema, Output } from "ai";
import dedent from "dedent";
import { z } from "zod";
import type { Intake } from "../database/schema";
import { putFile } from "../lib/s3";
import { IMAGE_MODEL, SEARCH_MODEL, TEXT_MODEL, gateway } from "./gateway";
import { ai as geminiAi, generateWithSearchGrounding } from "../services/gemini";

/* ------------------------------------------------------------------ */
/* Shared context                                                     */
/* ------------------------------------------------------------------ */

export type Content = Record<string, unknown>;

export interface GenContext {
  businessId: number;
  slug: string;
  intake: Intake;
  name: string;
  assets: Record<string, Content | null>;
}

export const FONT_CHOICES = [
  "Archivo Black",
  "Inter",
  "Space Grotesk",
  "DM Sans",
  "DM Serif Display",
  "Playfair Display",
  "Fraunces",
  "Syne",
  "Poppins",
  "Manrope",
  "Outfit",
  "Bricolage Grotesque",
  "Libre Baskerville",
  "Lora",
  "Work Sans",
  "Rubik",
  "Bebas Neue",
  "Instrument Serif",
  "IBM Plex Sans",
  "Nunito",
] as const;

type Img = { key: string };

const pick = <T,>(arr: T[] | undefined, i: unknown): T | undefined =>
  arr?.[typeof i === "number" && i >= 0 && i < arr.length ? i : 0];

export function chosenIdea(ctx: GenContext) {
  const c = ctx.assets["idea-wizard"] as { ideas?: Idea[]; chosen?: number } | null;
  return pick(c?.ideas, c?.chosen);
}

function brief(ctx: GenContext, include: string[] = []) {
  const i = ctx.intake;
  const idea = chosenIdea(ctx);
  const lines = [
    `Founder skills: ${i.skills || "not given"}`,
    `Interests: ${i.interests || "not given"}`,
    `Total starting budget (one-off, not monthly): ${i.budget || "not given"}`,
    `Hours per week: ${i.hours || "not given"}`,
    `Location: ${i.location || "not given"}`,
    `Ideal customer: ${i.customer || "not given"}`,
    `Brand tone: ${i.tone || "not given"}`,
  ];
  if (i.idea) lines.push(`Founder's own idea: ${i.idea}`);
  if (idea) lines.push(`Chosen business: ${idea.title} — ${idea.summary}. Target customer: ${idea.targetCustomer}. Revenue model: ${idea.revenueModel}.`);
  if (ctx.name && ctx.name !== "Untitled business") lines.push(`Business name: ${ctx.name}`);
  for (const tool of include) {
    const a = ctx.assets[tool];
    if (a) lines.push(`${tool} output (JSON): ${JSON.stringify(stripImages(a)).slice(0, 4000)}`);
  }
  return lines.join("\n");
}

function stripImages(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stripImages);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) if (k !== "image" && k !== "images" && k !== "url") o[k] = stripImages(val);
    return o;
  }
  return v;
}

function revision(prev: Content | null | undefined, instruction?: string) {
  if (!instruction) return "";
  return dedent`

    REVISION REQUEST — the founder wants changes to the previous version.
    Previous version (JSON): ${JSON.stringify(stripImages(prev ?? {})).slice(0, 6000)}
    Their instruction: "${instruction}"
    Apply the instruction; keep everything else that still fits.
  `;
}

type JS = { type?: string | string[]; items?: JS; properties?: Record<string, JS>; maxItems?: number };

/** Trim arrays to the schema's maxItems so a model that writes one item too many doesn't fail the whole tool. */
function clampArrays(value: unknown, js: JS | undefined): unknown {
  if (!js) return value;
  if (Array.isArray(value)) {
    const arr = typeof js.maxItems === "number" ? value.slice(0, js.maxItems) : value;
    return arr.map((v) => clampArrays(v, js.items));
  }
  if (value && typeof value === "object" && js.properties) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = clampArrays(v, js.properties[k]);
    return out;
  }
  return value;
}

async function structured<S extends z.ZodType>(schema: S, system: string, prompt: string): Promise<z.infer<S>> {
  const js = z.toJSONSchema(schema, { target: "draft-7" }) as JS;
  const validateValue = (raw: unknown) => {
    const value = clampArrays(raw, js);
    const parsed = schema.safeParse(value);
    if (parsed.success) return { success: true as const, value: parsed.data as z.infer<S> };
    // Count-only mismatches (e.g. 13 posts instead of 14) are fine to show; anything else is a real failure.
    const countOnly = parsed.error.issues.every((i) => i.code === "too_small" && "origin" in i && i.origin === "array");
    return countOnly
      ? { success: true as const, value: value as z.infer<S> }
      : { success: false as const, error: parsed.error };
  };

  const lenient = jsonSchema<z.infer<S>>(js as Parameters<typeof jsonSchema>[0], {
    validate: validateValue,
  });

  // 1. Try primary AI Gateway (with 1 automatic retry after brief jitter if rate-limited)
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { output } = await generateText({
        model: gateway(TEXT_MODEL),
        output: Output.object({ schema: lenient }),
        system,
        prompt,
      });
      return output as z.infer<S>;
    } catch (gwErr) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));
      } else {
        console.warn("[generators] Primary gateway failed, falling back to Gemini SDK:", gwErr instanceof Error ? gwErr.message : gwErr);
      }
    }
  }

  // 2. Fallback to direct Gemini SDK (@google/genai) with JSON schema enforcement
  const geminiModels = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastErr: unknown;
  for (const modelName of geminiModels) {
    try {
      const res = await geminiAi.models.generateContent({
        model: modelName,
        contents: `${prompt}\n\nRespond ONLY with valid JSON matching this JSON schema:\n${JSON.stringify(js)}`,
        config: {
          systemInstruction: system,
          responseMimeType: "application/json",
        },
      });
      const rawText = (res.text || "").trim().replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      const parsedJson = JSON.parse(rawText);
      const checked = validateValue(parsedJson);
      if (checked.success) return checked.value;
      lastErr = checked.error;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Structured generation failed across all models");
}

const SYSTEM = dedent`
  You are the engine behind "1 Click Business", which launches small businesses almost automatically.
  Be concrete, practical and specific to the founder's situation. No filler, no hype, no placeholder text like "[Your Name]".
  Never invent testimonials, awards, reviews or statistics about the business. Estimates must be labelled as estimates.
  Use plain, confident language. Currency: infer from the founder's location (default USD).
`;

export async function genImage(prompt: string, ctx: GenContext, tag: string, aspectRatio = "1:1"): Promise<Img> {
  const { files } = await generateText({
    model: gateway(IMAGE_MODEL),
    providerOptions: { google: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio } } },
    prompt: `Generate an image (aspect ratio ${aspectRatio}). ${prompt}`,
  });
  const file = files?.find((f) => f.mediaType.startsWith("image/"));
  if (!file) throw new Error("The image model returned no image.");
  const ext = file.mediaType.split("/")[1] ?? "png";
  const key = `generated/${ctx.slug}/${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  await putFile(key, file.uint8Array, file.mediaType);
  return { key };
}

/* ------------------------------------------------------------------ */
/* 01 Idea Wizard                                                     */
/* ------------------------------------------------------------------ */

const IdeaSchema = z.object({
  title: z.string(),
  summary: z.string().describe("2 sentences"),
  whyYou: z.string().describe("Why this suits this founder's skills, budget and hours"),
  targetCustomer: z.string(),
  revenueModel: z.string(),
  demand: z.enum(["Low", "Medium", "High"]),
  competition: z.enum(["Low", "Medium", "High"]),
  startupCost: z.string().describe("Estimated range, e.g. '$500–$1,500'"),
  timeToFirstSale: z.string(),
  score: z.number().describe("Overall fit 1-100"),
});
export type Idea = z.infer<typeof IdeaSchema>;

async function ideaWizard(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({ ideas: z.array(IdeaSchema).length(3) }),
    SYSTEM,
    dedent`
      Suggest exactly 3 business ideas for this founder, ranked best first (highest score first).
      If the founder gave their own idea, idea #1 must be a sharpened version of it.
      Demand/competition are your best estimate — be honest.
      ${brief({ ...ctx, assets: {} })}
      ${revision(prev, instruction)}
    `,
  );
  return { ideas: out.ideas, chosen: 0 };
}

/* ------------------------------------------------------------------ */
/* 03 Name Generator                                                  */
/* ------------------------------------------------------------------ */

async function nameGenerator(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({
      names: z
        .array(
          z.object({
            name: z.string(),
            tagline: z.string(),
            why: z.string(),
            domain: z.string().describe("Suggested domain to check, e.g. crumbandco.com"),
          }),
        )
        .length(10),
    }),
    SYSTEM,
    dedent`
      Generate 10 brandable names for this business, best first. Short, easy to say and spell, not generic.
      Avoid well-known existing brands.
      ${brief(ctx)}
      ${revision(prev, instruction)}
    `,
  );
  return { names: out.names, chosen: 0 };
}

/* ------------------------------------------------------------------ */
/* 02 Business Plan                                                   */
/* ------------------------------------------------------------------ */

async function businessPlan(ctx: GenContext, instruction?: string, prev?: Content | null) {
  return structured(
    z.object({
      executiveSummary: z.string(),
      problem: z.string(),
      solution: z.string(),
      targetMarket: z.string(),
      competitors: z.array(z.object({ name: z.string(), note: z.string() })).max(5),
      advantage: z.string(),
      pricing: z.array(z.object({ item: z.string(), price: z.string(), note: z.string() })).max(6),
      marketing: z.array(z.string()).max(6),
      operations: z.array(z.string()).max(6),
      startupCosts: z.array(z.object({ item: z.string(), cost: z.number() })).max(10),
      projection: z
        .array(z.object({ month: z.number(), revenue: z.number(), costs: z.number() }))
        .length(12)
        .describe("Conservative month-by-month estimate for the first 12 months"),
      milestones: z.array(z.object({ when: z.string(), goal: z.string() })).max(6),
      risks: z.array(z.object({ risk: z.string(), mitigation: z.string() })).max(5),
      currency: z.string().describe("ISO code"),
    }),
    SYSTEM,
    dedent`
      Write a lean, investor-readable business plan. Competitors can be types of competitor if you are unsure of real names.
      The 12-month projection is a conservative estimate and must be realistic for the founder's budget and hours.
      ${brief(ctx, ["name-generator"])}
      ${revision(prev, instruction)}
    `,
  );
}

/* ------------------------------------------------------------------ */
/* 04 Brand Generator                                                 */
/* ------------------------------------------------------------------ */

async function brandGenerator(ctx: GenContext, instruction?: string, prev?: Content | null) {
  return structured(
    z.object({
      mission: z.string(),
      story: z.string().describe("Short brand story, 3-4 sentences"),
      values: z.array(z.string()).max(4),
      voice: z.object({
        traits: z.array(z.string()).max(4),
        do: z.array(z.string()).max(4),
        dont: z.array(z.string()).max(4),
      }),
      personas: z
        .array(
          z.object({
            name: z.string(),
            snapshot: z.string(),
            pains: z.array(z.string()).max(3),
            goals: z.array(z.string()).max(3),
            whereTheyHangOut: z.string(),
          }),
        )
        .length(2),
      taglines: z.array(z.string()).max(5),
      keyMessages: z.array(z.string()).max(4),
      visualMood: z.string().describe("One sentence describing the visual style for designers"),
    }),
    SYSTEM,
    dedent`
      Create the brand foundation for this business.
      ${brief(ctx)}
      ${revision(prev, instruction)}
    `,
  );
}

/* ------------------------------------------------------------------ */
/* 06 Color / Font System                                             */
/* ------------------------------------------------------------------ */

async function colorFontSystem(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({
      colors: z
        .array(
          z.object({
            name: z.string(),
            hex: z.string().describe("#RRGGBB"),
            role: z.enum(["Primary", "Secondary", "Accent", "Background", "Text"]),
            usage: z.string(),
          }),
        )
        .length(5),
      headingFont: z.enum(FONT_CHOICES),
      bodyFont: z.enum(FONT_CHOICES),
      rationale: z.string(),
      rules: z.array(z.string()).max(5),
    }),
    SYSTEM,
    dedent`
      Design a colour palette (exactly one colour for each role: Primary, Secondary, Accent, Background, Text)
      and a Google Fonts heading/body pairing. Background vs Text must have strong contrast (WCAG AA).
      ${brief(ctx, ["brand-generator"])}
      ${revision(prev, instruction)}
    `,
  );
  return {
    ...out,
    colors: out.colors.map((c) => ({ ...c, hex: normalizeHex(c.hex), onColor: readableOn(normalizeHex(c.hex)) })),
  };
}

function normalizeHex(hex: string) {
  const h = hex.trim().replace(/^#?/, "#");
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : "#131313";
}

function readableOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  return lum > 0.4 ? "#131313" : "#FFFFFF";
}

export function palette(ctx: GenContext) {
  const c = ctx.assets["color-font-system"] as { colors?: { role: string; hex: string }[]; headingFont?: string; bodyFont?: string } | null;
  const get = (role: string, fallback: string) => c?.colors?.find((x) => x.role === role)?.hex ?? fallback;
  return {
    primary: get("Primary", "#FFE500"),
    secondary: get("Secondary", "#131313"),
    accent: get("Accent", "#22C55E"),
    background: get("Background", "#FFFFFF"),
    text: get("Text", "#131313"),
    headingFont: c?.headingFont ?? "Archivo Black",
    bodyFont: c?.bodyFont ?? "Inter",
  };
}

/* ------------------------------------------------------------------ */
/* 05 Logo Generation                                                 */
/* ------------------------------------------------------------------ */

const LOGO_STYLES = [
  "bold geometric symbol mark with the name set in a clean sans-serif",
  "confident wordmark only, custom lettering, no symbol",
  "simple emblem / badge mark with the name",
];

function buildFallbackLogoSvg(name: string, index: number, p: { primary: string; secondary: string; accent: string }): Img & { url: string } {
  const cleanName = (name || "1 Click Business").replace(/[<>&"']/g, "");
  const initials = cleanName
    .split(/\s+/)
    .map((w) => w[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "1C";

  let svg = "";
  if (index === 0) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <rect width="400" height="400" fill="#FFFFFF"/>
      <rect x="130" y="75" width="140" height="140" rx="24" fill="${p.primary}" stroke="${p.secondary}" stroke-width="10"/>
      <circle cx="200" cy="145" r="36" fill="${p.accent}" stroke="${p.secondary}" stroke-width="8"/>
      <text x="200" y="285" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="30" fill="${p.secondary}" letter-spacing="1">${cleanName.toUpperCase()}</text>
      <rect x="140" y="308" width="120" height="6" fill="${p.accent}"/>
    </svg>`;
  } else if (index === 1) {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <rect width="400" height="400" fill="${p.secondary}"/>
      <rect x="36" y="130" width="328" height="140" fill="${p.primary}" stroke="#FFFFFF" stroke-width="8"/>
      <text x="200" y="212" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="${p.secondary}" letter-spacing="2">${cleanName.toUpperCase()}</text>
    </svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
      <rect width="400" height="400" fill="#FFFFFF"/>
      <circle cx="200" cy="165" r="88" fill="${p.secondary}" stroke="${p.primary}" stroke-width="10"/>
      <text x="200" y="185" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="56" fill="${p.primary}">${initials}</text>
      <text x="200" y="310" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="26" fill="${p.secondary}">${cleanName}</text>
    </svg>`;
  }
  const encoded = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return { key: `svg-fallback-logo-${index}`, url: encoded };
}

async function logoGeneration(ctx: GenContext, instruction?: string) {
  const p = palette(ctx);
  const brand = ctx.assets["brand-generator"] as { visualMood?: string } | null;
  const idea = chosenIdea(ctx);
  const concepts = await Promise.all(
    LOGO_STYLES.map(async (style, i) => {
      const prompt = dedent`
        A professional flat vector-style logo for a business called "${ctx.name}" (${idea?.title ?? "small business"}).
        Style: ${style}. Brand mood: ${brand?.visualMood ?? "modern, confident"}.
        Colours: primary ${p.primary}, dark ${p.secondary}, accent ${p.accent}. Centered on a plain solid white background, generous margin.
        Spell the name exactly "${ctx.name}". No mockups, no gradients, no photo, no extra text, no taglines.
        ${instruction ? `Founder's notes: ${instruction}` : ""}
      `;
      const image = await genImage(prompt, ctx, `logo-${i}`, "1:1").catch(() => buildFallbackLogoSvg(ctx.name, i, p));
      return { style, image };
    }),
  );
  return { concepts, chosen: 0 };
}

/* ------------------------------------------------------------------ */
/* 07 Website Generator                                               */
/* ------------------------------------------------------------------ */

async function websiteGenerator(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const copy = await structured(
    z.object({
      seo: z.object({ title: z.string(), description: z.string() }),
      hero: z.object({ eyebrow: z.string(), headline: z.string(), subheadline: z.string(), cta: z.string() }),
      about: z.object({ title: z.string(), body: z.string() }),
      services: z
        .array(z.object({ title: z.string(), description: z.string(), price: z.string().describe("Price or empty string") }))
        .min(3)
        .max(6),
      steps: z.array(z.object({ title: z.string(), body: z.string() })).length(3).describe("How it works"),
      benefits: z.array(z.string()).min(3).max(6),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(6),
      contact: z.object({ title: z.string(), body: z.string(), button: z.string() }),
      heroImagePrompt: z.string().describe("Photographic hero image description, no text in image"),
    }),
    SYSTEM,
    dedent`
      Write all copy for a one-page website for this business. It includes a contact form that collects leads.
      No testimonials or invented stats. Use the brand voice.
      ${brief(ctx, ["brand-generator", "business-plan"])}
      ${revision(prev, instruction)}
    `,
  );
  const keepImage = instruction && prev && (prev as { heroImage?: Img }).heroImage && !/image|photo|picture/i.test(instruction);
  const heroImage = keepImage
    ? (prev as { heroImage: Img }).heroImage
    : await genImage(
        `${copy.heroImagePrompt}. Editorial, high quality photography, natural light, no text, no logos.`,
        ctx,
        "site-hero",
        "16:9",
      ).catch(() => null);
  return { ...copy, heroImage };
}

/* ------------------------------------------------------------------ */
/* 08 Ad Generator                                                    */
/* ------------------------------------------------------------------ */

async function adGenerator(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({
      ads: z
        .array(
          z.object({
            platform: z.enum(["Meta", "Google Search", "LinkedIn"]),
            angle: z.string(),
            persona: z.string(),
            headlines: z.array(z.string()).min(2).max(4),
            primaryText: z.string(),
            description: z.string(),
            cta: z.string(),
          }),
        )
        .min(3)
        .max(5),
      audience: z.object({ locations: z.string(), ages: z.string(), interests: z.array(z.string()).max(8) }),
      budget: z.object({ daily: z.string().describe("Daily ad spend amount only, e.g. \"$15\""), note: z.string() }),
      squarePrompt: z.string().describe("Ad visual concept, square, no text in the image"),
      storyPrompt: z.string().describe("Ad visual concept, vertical story, no text in the image"),
    }),
    SYSTEM,
    dedent`
      Write ready-to-paste ad copy for this business. Respect platform limits: Google Search headlines ≤ 30 chars,
      descriptions ≤ 90 chars. Include at least one ad per platform. Suggest a realistic starter budget for the founder's budget.
      ${brief(ctx, ["brand-generator"])}
      ${revision(prev, instruction)}
    `,
  );
  const p = palette(ctx);
  const style = `Brand colours ${p.primary}, ${p.secondary}, ${p.accent}. Bold, clean commercial look. No words, letters or logos in the image.`;
  const [square, story] = await Promise.all([
    genImage(`${out.squarePrompt}. ${style}`, ctx, "ad-square", "1:1").catch(() => null),
    genImage(`${out.storyPrompt}. ${style}`, ctx, "ad-story", "9:16").catch(() => null),
  ]);
  const { squarePrompt: _a, storyPrompt: _b, ...rest } = out;
  return {
    ...rest,
    images: [
      { format: "Feed 1:1", image: square },
      { format: "Story 9:16", image: story },
    ].filter((x) => x.image),
  };
}

/* ------------------------------------------------------------------ */
/* 09 Social Content Generator                                        */
/* ------------------------------------------------------------------ */

async function socialGenerator(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({
      posts: z
        .array(
          z.object({
            day: z.number(),
            platform: z.enum(["Instagram", "TikTok", "LinkedIn", "Facebook", "X"]),
            format: z.enum(["Image", "Carousel", "Reel / short video", "Text", "Story"]),
            hook: z.string(),
            caption: z.string(),
            hashtags: z.array(z.string()).max(6),
          }),
        )
        .length(14),
      visuals: z.array(z.string().describe("Image concept, no text in image")).length(3),
    }),
    SYSTEM,
    dedent`
      Plan 14 days of social posts (day 1 to 14, one per day) for launch. Pick the platforms this customer actually uses.
      Mix education, behind-the-scenes, offer and community posts. Captions ready to paste.
      ${brief(ctx, ["brand-generator"])}
      ${revision(prev, instruction)}
    `,
  );
  const p = palette(ctx);
  const images = await Promise.all(
    out.visuals.map((v, i) =>
      genImage(
        `${v}. Social media post visual, brand colours ${p.primary}, ${p.secondary}, ${p.accent}. No text, no logos.`,
        ctx,
        `social-${i}`,
        "4:5",
      ).catch(() => null),
    ),
  );
  return {
    posts: out.posts,
    images: images.flatMap((image, i) => (image ? [{ image, concept: out.visuals[i] }] : [])),
  };
}

/* ------------------------------------------------------------------ */
/* 10 Launch Checklist                                                */
/* ------------------------------------------------------------------ */

export { AUTO_TASKS } from "../catalog";

async function launchChecklist(ctx: GenContext, instruction?: string, prev?: Content | null) {
  const out = await structured(
    z.object({
      items: z
        .array(
          z.object({
            title: z.string(),
            detail: z.string(),
            category: z.enum(["Legal", "Tax", "Banking", "Insurance", "Operations", "Marketing"]),
            link: z.string().describe("Official government or provider URL, or empty string"),
          }),
        )
        .min(8)
        .max(14),
    }),
    SYSTEM,
    dedent`
      Create the real-world launch checklist for this business in the founder's location: registration/structure,
      licences and permits specific to this type of business, tax ID, sales tax, business bank account, insurance,
      bookkeeping, and anything else legally required. Use official links where you are confident they exist; otherwise empty string.
      Do not include branding, website, ads or social tasks — those are tracked separately.
      ${brief(ctx)}
      ${revision(prev, instruction)}
    `,
  );
  const prevDone = new Set(
    ((prev as { items?: { id: string; done: boolean }[] } | null)?.items ?? []).filter((x) => x.done).map((x) => x.id),
  );
  return {
    items: out.items.map((it, i) => {
      const id = `t${i}-${it.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`;
      return { ...it, id, done: prevDone.has(id) };
    }),
  };
}

/* ------------------------------------------------------------------ */
/* 11 Funding / Grant Finder                                          */
/* ------------------------------------------------------------------ */

/** Search titles sometimes arrive glued to a breadcrumb ("Page - Sitewww.site.com › path"). Keep the readable part. */
function cleanTitle(title: string | undefined, url: string) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}
  const t = (title ?? "").split(/(?:https?:\/\/|www\.|\s›\s)/)[0].trim();
  return (t.length > 3 ? t : host).slice(0, 120);
}

async function fundingFinder(ctx: GenContext, instruction?: string) {
  const idea = chosenIdea(ctx);
  const searchPrompt = dedent`
    Find currently available small-business funding for this founder: grants, government-backed loans,
    microloans, accelerator programmes and pitch competitions. Prioritise options open in ${ctx.intake.location || "the founder's country"}
    and relevant to: ${idea?.title ?? ctx.intake.idea ?? "a new small business"} (${idea?.summary ?? ""}).
    Startup budget: ${ctx.intake.budget || "small"}.
    ${instruction ? `Extra request: ${instruction}` : ""}
    For each option give: name, provider, type, amount, eligibility, deadline (if published) and the official URL.
    List 8-12 options.
  `;

  let searchText = "";
  let sources: { url: string; title: string }[] = [];

  try {
    const search = await generateText({
      model: gateway(SEARCH_MODEL),
      prompt: searchPrompt,
    });
    searchText = search.text;
    sources = (search.sources ?? [])
      .filter((s): s is typeof s & { url: string } => s.sourceType === "url" && "url" in s)
      .map((s) => ({ url: s.url, title: cleanTitle(s.title, s.url) }))
      .filter((s, i, all) => all.findIndex((o) => o.url === s.url) === i);
  } catch (err) {
    console.warn("[funding-finder] SEARCH_MODEL fallback to Gemini Search Grounding:", err instanceof Error ? err.message : err);
    const grounded = await generateWithSearchGrounding(searchPrompt);
    searchText = grounded.text;
    sources = grounded.sources.map((s) => ({ url: s.url, title: cleanTitle(s.title, s.url) }));
  }

  const out = await structured(
    z.object({
      results: z
        .array(
          z.object({
            name: z.string(),
            provider: z.string(),
            type: z.enum(["Grant", "Loan", "Microloan", "Programme", "Competition", "Other"]),
            amount: z.string(),
            eligibility: z.string(),
            deadline: z.string().describe("As published, or 'Rolling' / 'Not stated'"),
            url: z.string().describe("Must be a URL that appears in the research or sources; empty if none"),
            fit: z.number().describe("1-5 how well it fits this founder"),
            why: z.string(),
          }),
        )
        .max(12),
    }),
    "You turn web research into structured data. Only include options that appear in the research. Never invent URLs.",
    dedent`
      Research:
      ${searchText}

      Sources:
      ${sources.map((s, i) => `[${i + 1}] ${s.title} — ${s.url}`).join("\n")}

      Founder: ${brief(ctx)}
    `,
  );
  const known = new Set(sources.map((s) => s.url));
  return {
    results: out.results
      .map((r) => ({ ...r, url: /^https?:\/\//.test(r.url) ? r.url : "", verifiedLink: known.has(r.url) }))
      .sort((a, b) => b.fit - a.fit),
    sources,
    searchedAt: new Date().toISOString(),
    location: ctx.intake.location,
  };
}

/* ------------------------------------------------------------------ */
/* 12 CRM  /  13 Advisor brief                                        */
/* ------------------------------------------------------------------ */

async function customerCrm() {
  return { ready: true, stages: ["new", "contacted", "qualified", "won", "lost"] };
}

async function aiAdvisor(ctx: GenContext, instruction?: string) {
  return structured(
    z.object({
      headline: z.string().describe("One-line read on where the business stands"),
      nextSteps: z
        .array(
          z.object({
            title: z.string(),
            why: z.string(),
            tool: z
              .enum(["none", "business-plan", "website-generator", "ad-generator", "social-generator", "funding-finder", "launch-checklist", "customer-crm"])
              .describe("Which 1 Click tool helps with this, or none"),
          }),
        )
        .min(3)
        .max(5),
      watchOut: z.string(),
    }),
    SYSTEM + "\nYou are the founder's business advisor. Be direct and specific.",
    dedent`
      Give the founder their "what to do next" brief for the first 30 days after launch.
      ${brief(ctx, ["business-plan", "brand-generator"])}
      ${instruction ? `Founder asks: ${instruction}` : ""}
    `,
  );
}

async function coldOutreach(ctx: GenContext, instruction?: string, prev?: Content | null) {
  return structured(
    z.object({
      icp: z.object({
        targetTitle: z.string().describe("e.g. VP of Operations, Head of Marketing, Local Gym Owner"),
        industry: z.string().describe("Target industry vertical"),
        painPoint: z.string().describe("The primary acute pain point this customer experiences"),
        triggerEvent: z.string().describe("Why reach out now, e.g. expansion, new quarter, hiring"),
      }),
      sequence: z
        .array(
          z.object({
            step: z.number(),
            day: z.string().describe("e.g. Day 1, Day 4, Day 8, Day 14"),
            type: z.string().describe("e.g. Initial Value Hook, Case Study Proof, The Breakup / Quick Call"),
            subjectLines: z.array(z.string()).min(2).max(3),
            body: z.string().describe("Full body text ready to personalize and send"),
            callToAction: z.string().describe("Low-friction CTA"),
            proTip: z.string().describe("Tactical sending or personalization tip"),
          }),
        )
        .min(4)
        .max(5),
      linkedinMessages: z
        .array(
          z.object({
            type: z.string().describe("e.g. Connection Request Note (under 300 chars), InMail Message"),
            message: z.string(),
          }),
        )
        .min(2)
        .max(3),
      objections: z
        .array(
          z.object({
            objection: z.string().describe("e.g. We already use an existing vendor / Too expensive"),
            rebuttal: z.string().describe("Respectful, high-leverage response script"),
          }),
        )
        .min(3)
        .max(3),
    }),
    SYSTEM + "\nYou are an elite B2B and DTC sales outreach strategist.",
    dedent`
      Generate a complete 5-step cold email sequence, LinkedIn connection messages, and objection handling scripts for this business.
      Focus on high-reply, conversational copywriting that avoids spam triggers and drives qualified calls or orders.
      ${brief(ctx, ["business-plan", "brand-generator"])}
      ${revision(prev, instruction)}
    `,
  );
}

async function competitorRadar(ctx: GenContext, instruction?: string, prev?: Content | null) {
  return structured(
    z.object({
      marketLandscape: z.string().describe("2-3 sentences diagnosing the current competitive terrain"),
      competitors: z
        .array(
          z.object({
            name: z.string(),
            positioning: z.string(),
            pricingEstimate: z.string(),
            strengths: z.array(z.string()).min(2).max(3),
            weaknesses: z.array(z.string()).min(2).max(3),
            customerComplaints: z.string().describe("What customers frequently complain about or wish was better"),
          }),
        )
        .min(3)
        .max(3),
      unservedGaps: z.array(z.string()).min(3).max(4).describe("Underserved customer needs or neglected niches"),
      defensiveMoat: z.object({
        unfairAdvantage: z.string(),
        switchCost: z.string().describe("How to make it sticky for customers to stay"),
        actionablePlaybook: z.array(z.string()).min(3).max(4),
      }),
    }),
    SYSTEM + "\nYou are a market research analyst and competitive intelligence strategist.",
    dedent`
      Analyze the competitive landscape for this business idea. Identify top competitor archetypes,
      their pricing/service weaknesses, and outline an unfair advantage playbook.
      ${brief(ctx, ["business-plan", "brand-generator"])}
      ${revision(prev, instruction)}
    `,
  );
}

async function seoEngine(ctx: GenContext, instruction?: string, prev?: Content | null) {
  return structured(
    z.object({
      searchStrategy: z.string().describe("High-level organic search and answer engine optimization roadmap"),
      commercialKeywords: z
        .array(
          z.object({
            keyword: z.string(),
            intent: z.enum(["Transactional", "Commercial", "Informational"]),
            difficulty: z.enum(["Low", "Medium", "High"]),
            opportunityNote: z.string().describe("Why this keyword converts and how to rank"),
          }),
        )
        .min(6)
        .max(8),
      metaTags: z.object({
        homeTitle: z.string().describe("Title tag under 60 chars"),
        homeMetaDescription: z.string().describe("Meta description under 155 chars"),
        ogTitle: z.string(),
        ogDescription: z.string(),
      }),
      pillarArticles: z
        .array(
          z.object({
            title: z.string(),
            targetKeyword: z.string(),
            outline: z.array(z.string()).min(3).max(4),
            estimatedTrafficValue: z.string(),
          }),
        )
        .min(3)
        .max(3),
    }),
    SYSTEM + "\nYou are an SEO director and AI search optimization expert.",
    dedent`
      Generate an organic search authority blueprint, commercial keyword shortlist, meta tags,
      and 3 pillar content briefs tailored for Google and AI answer engines (Perplexity, ChatGPT Search).
      ${brief(ctx, ["brand-generator", "website-generator"])}
      ${revision(prev, instruction)}
    `,
  );
}

/* ------------------------------------------------------------------ */

type Generator = (ctx: GenContext, instruction?: string, prev?: Content | null) => Promise<Content>;

export const GENERATORS: Record<string, Generator> = {
  "idea-wizard": ideaWizard,
  "name-generator": nameGenerator,
  "business-plan": businessPlan,
  "brand-generator": brandGenerator,
  "color-font-system": colorFontSystem,
  "logo-generation": logoGeneration,
  "website-generator": websiteGenerator,
  "ad-generator": adGenerator,
  "social-generator": socialGenerator,
  "launch-checklist": launchChecklist,
  "funding-finder": fundingFinder,
  "customer-crm": customerCrm,
  "ai-advisor": aiAdvisor,
  "cold-outreach": coldOutreach,
  "competitor-radar": competitorRadar,
  "seo-engine": seoEngine,
};

/** The pipeline, in waves. Tools in the same wave run in parallel. */
export const PIPELINE: string[][] = [
  ["idea-wizard"],
  ["name-generator"],
  ["business-plan", "brand-generator", "launch-checklist", "funding-finder", "customer-crm", "competitor-radar"],
  ["color-font-system"],
  ["logo-generation", "ad-generator", "social-generator", "cold-outreach", "seo-engine"],
  ["website-generator"],
  ["ai-advisor"],
];
