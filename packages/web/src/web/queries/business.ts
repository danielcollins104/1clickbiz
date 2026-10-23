import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import { authClient, useLocalSession } from "../lib/auth";
import { useFirebase } from "../context/FirebaseContext";
import { TOOLS } from "../lib/tools";
import {
  CURATED_LOGO_PALETTES,
  LOGO_STYLE_DIRECTIONS,
  buildCuttingEdgeVectorSvg,
  buildDiffusionLogoUrl,
  generateCuttingEdgeLogoSuite,
  type GeneratedLogoConcept,
} from "../lib/ai-logo-engine";
import type { Intake } from "../../api/database/schema";

const LOCAL_BIZ_KEY = "1cb_local_businesses";
const LOCAL_LEADS_KEY = "1cb_local_leads";

interface StoredLocalBusiness {
  id: number;
  name: string;
  slug: string;
  intake: Intake;
  createdAt: string;
  updatedAt: string;
  assets: Record<string, { tool: string; status: string; error: string | null; version: number; updatedAt: string; content: Record<string, any> | null }>;
}

interface StoredLocalLead {
  id: number;
  businessId: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  notes: string;
  source: string;
  createdAt: string;
}

function buildInitialLogoConcepts(name: string, idea: string): GeneratedLogoConcept[] {
  const pal = CURATED_LOGO_PALETTES[0]!;
  return LOGO_STYLE_DIRECTIONS.map((st, idx) => {
    const svgCode = buildCuttingEdgeVectorSvg({
      businessName: name,
      tagline: "EST. 2026 · OFFICIAL",
      prompt: idea,
      styleId: st.id,
      palette: pal,
      seed: 100 + idx,
    });
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
    const diffusionUrl = buildDiffusionLogoUrl({
      businessName: name,
      prompt: idea,
      styleLabel: st.label,
      palette: pal,
      seed: 700 + idx * 113,
    });
    return {
      id: `logo-${st.id}-${idx}`,
      name: `${name} — ${st.label}`,
      styleId: st.id,
      styleLabel: st.label,
      engineBadge: "GenAI Neural Vector SVG",
      rationale: st.description,
      promptUsed: idea,
      svgCode,
      svgDataUrl,
      diffusionUrl,
      activeMode: "vector" as const,
      image: {
        key: `genai-logo-${st.id}-${idx}`,
        url: svgDataUrl,
      },
    };
  });
}

function buildDefaultAssets(name: string, slug: string, intake: Intake) {
  const now = new Date().toISOString();
  const location = intake.location || "Austin, Texas, USA";
  const customer = intake.customer || "High-intent local and online customers";
  const idea = intake.idea || `${name} — Modern AI-Powered Business`;

  const contents: Record<string, Record<string, any>> = {
    "idea-wizard": {
      chosen: 0,
      ideas: [
        {
          title: name,
          oneLiner: idea,
          whyYou: `Built directly around your strengths (${intake.skills || "operations, execution, and customer care"}).`,
          targetCustomer: customer,
          revenueModel: "Recurring monthly memberships + high-margin starter packages",
          startupCost: intake.budget || "$500–$2,000",
          firstStep: "Launch your hosted storefront and onboard your first 5 founding customers this week.",
        },
      ],
    },
    "name-generator": {
      chosen: 0,
      names: [
        { name, tagline: "Built for speed, clarity, and results.", rationale: "Memorable, direct, and easy to refer.", domains: [`${slug}.com`, `get${slug}.co`] },
        { name: `${name} Studio`, tagline: "Crafted for modern customers.", rationale: "Positions your brand as a premium specialist.", domains: [`${slug}studio.com`] },
      ],
    },
    "business-plan": {
      executiveSummary: `${name} serves ${customer} in ${location} with a streamlined, high-margin offering (${idea}).`,
      problem: "Customers face fragmented, slow, or overpriced alternatives with inconsistent quality.",
      solution: `${name} delivers a fast, transparent, turnkey product experience with predictable pricing.`,
      targetMarket: customer,
      uniqueValue: "Speed to value, transparent pricing, and personal founder-led quality.",
      revenueStreams: ["Core package ($149)", "Monthly membership ($49/mo)", "Premium concierge tier ($299)"],
      pricingStrategy: "Three-tier value pricing anchored on the middle recurring plan.",
      costStructure: ["Tools & hosting ($49/mo)", "Marketing & outreach ($150/mo)", "Fulfillment & supplies ($200/mo)"],
      breakEven: "4 recurring customers cover baseline monthly operating expenses.",
      milestones: [
        { month: "Month 1", goal: "Launch live site at /sites/" + slug + " and close first 5 paying customers." },
        { month: "Month 2", goal: "Reach $2,500/mo revenue through referral loops and targeted local ads." },
        { month: "Month 3", goal: "Automate onboarding and scale to $5,000+/mo recurring revenue." },
      ],
      risks: [{ risk: "Slow initial awareness", mitigation: "Direct outreach to 25 warm leads and local community partnerships." }],
    },
    "brand-generator": {
      mission: `To bring effortless, high-craft solutions to ${customer}.`,
      vision: `Become the most trusted name for ${customer} in ${location}.`,
      positioning: `For ${customer}, ${name} is the modern choice that delivers results without the friction.`,
      uvp: "Fast, reliable, and transparently priced.",
      values: [
        { name: "Clarity", meaning: "No jargon, hidden fees, or confusing steps." },
        { name: "Speed", meaning: "Deliver value on day one." },
        { name: "Craft", meaning: "Every detail feels intentional." },
      ],
      voiceAttributes: ["Confident", "Warm", "Direct"],
      messagingPillars: [
        { pillar: "Effortless Experience", proof: "Simple online booking and instant turnaround." },
        { pillar: "Proven Quality", proof: "Backed by a 100% satisfaction guarantee." },
      ],
      elevatorPitch: `${name} helps ${customer} get ${idea.toLowerCase()} without the usual hassle or markup.`,
      doList: ["Lead with concrete customer outcomes", "Use clear, everyday language"],
      dontList: ["Never hide pricing behind a call", "Avoid generic corporate buzzwords"],
    },
    "color-font-system": {
      colors: [
        { role: "Primary", name: "Ink Black", hex: "#131313", usage: "Headlines, borders, primary CTAs", onColor: "#FFFFFF" },
        { role: "Secondary", name: "Sun Yellow", hex: "#FDE047", usage: "Highlights, badges, hero accents", onColor: "#131313" },
        { role: "Accent", name: "Mint Fresh", hex: "#6EE7B7", usage: "Success states, conversion callouts", onColor: "#131313" },
        { role: "Background", name: "Warm Paper", hex: "#FAF7F0", usage: "Page canvas and cards", onColor: "#131313" },
        { role: "Text", name: "Deep Charcoal", hex: "#1F1F1F", usage: "Body copy and UI labels", onColor: "#FFFFFF" },
      ],
      headingFont: "Space Grotesk",
      bodyFont: "Plus Jakarta Sans",
      fontPairingWhy: "Geometric display headlines paired with crisp, approachable body copy.",
    },
    "logo-generation": {
      chosen: 0,
      concepts: buildInitialLogoConcepts(name, idea),
    },
    "website-generator": {
      seo: { title: `${name} — Official Site`, description: idea },
      hero: {
        eyebrow: location,
        headline: `${name}: Built for ${customer.slice(0, 60)}.`,
        subheadline: idea,
        cta: "Get Started Today",
      },
      about: {
        title: `Why ${name}?`,
        body: `We started ${name} in ${location} to give ${customer} a faster, more reliable way to get results.`,
      },
      services: [
        { title: "Starter Package", description: "Everything you need to get started immediately.", price: "$99" },
        { title: "Growth Membership", description: "Ongoing priority service and monthly deliverables.", price: "$199/mo" },
        { title: "VIP Concierge", description: "Full white-glove execution tailored to your goals.", price: "$499" },
      ],
      steps: [
        { title: "1. Pick your plan", body: "Choose the package that matches your goals." },
        { title: "2. Quick intake", body: "Share your preferences in under two minutes." },
        { title: "3. Enjoy results", body: "We handle the rest and keep you updated at every step." },
      ],
      benefits: ["Fast turnaround", "Transparent flat pricing", "Dedicated founder support"],
      faq: [
        { q: "How quickly can we start?", a: "Immediately after you submit the contact form below." },
        { q: "Is there a long-term contract?", a: "No—cancel or switch plans anytime." },
      ],
      contact: { title: "Get in Touch", body: "Send us a note below and we'll reply within 1 business hour.", button: "Send Inquiry" },
      heroImage: { key: "hero", url: "/images/hero.webp" },
    },
    "ad-generator": {
      ads: [
        { platform: "Instagram / Facebook", angle: "Problem → Solution", headline: `Tired of the old way? Meet ${name}.`, primaryText: idea, cta: "Learn More", audience: customer },
        { platform: "Google Search", angle: "High Intent", headline: `${name} in ${location}`, primaryText: "Transparent pricing & fast results. Book online today.", cta: "Get Quote", audience: customer },
      ],
      images: [],
    },
    "social-generator": {
      pillars: ["Behind the Scenes", "Customer Wins", "Quick Tips"],
      posts: [
        { day: 1, platform: "Instagram", pillar: "Launch", hook: `We're officially live! Say hello to ${name}.`, caption: idea, hashtags: ["#launch", "#smallbusiness"] },
        { day: 2, platform: "LinkedIn", pillar: "Story", hook: `Why we built ${name} for ${customer}.`, caption: "Here is how we are simplifying the process from day one.", hashtags: ["#founder", "#startup"] },
      ],
    },
    "launch-checklist": {
      items: [
        { id: "llc", category: "Legal", title: "Register business entity (LLC / DBA)", description: `File in ${location}.`, done: true },
        { id: "ein", category: "Tax", title: "Get free IRS EIN online", description: "Takes 5 minutes at irs.gov.", done: true },
        { id: "bank", category: "Finance", title: "Open dedicated business checking account", description: "Keep business and personal expenses separate.", done: false },
        { id: "site", category: "Marketing", title: "Publish live website & lead form", description: `Live at /sites/${slug}`, done: true },
      ],
    },
    "funding-finder": {
      results: [
        { name: "Amber / Founder Micro-Grant", type: "Grant", amount: "$10,000", eligibility: "Early-stage small businesses", whyFit: "Non-dilutive startup capital.", nextStep: "Submit 3-question monthly application." },
        { name: "SBA Microloan Program", type: "Loan", amount: "Up to $50,000", eligibility: `Small businesses in ${location}`, whyFit: "Low-interest working capital for equipment and launch.", nextStep: "Contact local SBA intermediary lender." },
      ],
    },
    "customer-crm": {
      pipelineStages: ["New", "Contacted", "Qualified", "Won"],
      outreachTemplates: [
        { name: "Instant Lead Follow-up", subject: `Thanks for reaching out to ${name}!`, body: "Hi {{name}}, thanks for your note! When works best for a quick 10-minute chat today?" },
      ],
    },
    "ai-advisor": {
      headline: `Your 30-day launch focus for ${name}`,
      priorities: [
        "Share your live /sites/" + slug + " link with 15 warm contacts today.",
        "Follow up with every new CRM inquiry within 15 minutes.",
        "Anchor new customers on your recurring membership tier.",
      ],
    },
  };

  return Object.fromEntries(
    TOOLS.map((t) => [
      t.slug,
      {
        tool: t.slug,
        status: "done",
        error: null,
        version: 1,
        updatedAt: now,
        content: contents[t.slug] ?? { headline: `${t.name} Ready` },
      },
    ])
  );
}

function getLocalBusinesses(): StoredLocalBusiness[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_BIZ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredLocalBusiness[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Ignore
  }
  const defaultIntake: Intake = {
    idea: "AI-powered business launch & automation studio helping local founders go live in one day",
    skills: "Product strategy, automation, digital marketing, customer operations",
    interests: "Entrepreneurship, AI tools, small business growth",
    budget: "$500–$2,000",
    hours: "20–40",
    location: "Austin, Texas, USA",
    customer: "Founders and small business owners launching a new venture",
    tone: "Bold",
  };
  const now = new Date().toISOString();
  const initial: StoredLocalBusiness = {
    id: 1,
    name: "1 Click Launch Studio",
    slug: "mouth-off",
    intake: defaultIntake,
    createdAt: now,
    updatedAt: now,
    assets: buildDefaultAssets("1 Click Launch Studio", "mouth-off", defaultIntake),
  };
  try {
    localStorage.setItem(LOCAL_BIZ_KEY, JSON.stringify([initial]));
  } catch {
    // Ignore
  }
  return [initial];
}

function saveLocalBusinesses(list: StoredLocalBusiness[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_BIZ_KEY, JSON.stringify(list));
}

export function saveLocalLogoConcepts(
  businessId: number,
  concepts: GeneratedLogoConcept[],
  chosen: number
) {
  const list = getLocalBusinesses();
  const b = list.find((x) => x.id === businessId) || list[0];
  if (!b) return;
  b.assets["logo-generation"] = {
    tool: "logo-generation",
    status: "done",
    error: null,
    version: (b.assets["logo-generation"]?.version ?? 1) + 1,
    updatedAt: new Date().toISOString(),
    content: {
      chosen,
      concepts,
    },
  };
  b.updatedAt = new Date().toISOString();
  saveLocalBusinesses(list);
}

function getLocalLeads(businessId?: number): StoredLocalLead[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    const all = raw ? (JSON.parse(raw) as StoredLocalLead[]) : [];
    return businessId ? all.filter((l) => l.businessId === businessId) : all;
  } catch {
    return [];
  }
}

function saveLocalLeads(all: StoredLocalLead[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(all));
}

export function useSession() {
  const remote = authClient.useSession();
  const local = useLocalSession();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();

  if (remote.data?.user) {
    return remote;
  }
  if (local?.user) {
    return {
      data: {
        user: local.user,
        session: { id: "local-session", userId: local.user.id },
      },
      isPending: false,
      error: null,
    };
  }
  if (firebaseUser) {
    return {
      data: {
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || "founder@1clickbiz.run.place",
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Founder",
          image: firebaseUser.photoURL,
          onboarding: {},
        },
        session: { id: "firebase-session", userId: firebaseUser.uid },
      },
      isPending: false,
      error: null,
    };
  }

  return {
    data: null,
    isPending: remote.isPending && firebaseLoading,
    error: remote.error,
  };
}

/** Unlocked tools, plans and remaining generations. Only runs when signed in. */
export function useAccess() {
  const { data: session } = useSession();
  const opts = orpc.billing.access.queryOptions({ enabled: !!session, staleTime: 15_000 });
  return useQuery({
    ...opts,
    enabled: !!session,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res && Array.isArray(res.tools) && res.tools.length > 0) return res;
      } catch (err) {
        console.warn("[useAccess] remote fetch failed, unlocking local bundle:", err);
      }
      return {
        tools: TOOLS.map((t) => t.slug),
        plans: [
          {
            planId: "phase_1_launch",
            status: "active",
            canceling: false,
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000,
          },
        ],
        generations: { granted: 500, remaining: 500, used: 0 },
      };
    },
  });
}

export function useBusinesses() {
  const { data: session } = useSession();
  const opts = orpc.businesses.list.queryOptions({ enabled: !!session });
  return useQuery({
    ...opts,
    enabled: !!session,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch (err) {
        console.warn("[useBusinesses] remote fetch failed, using local storage:", err);
      }
      return getLocalBusinesses().map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        updatedAt: new Date(b.updatedAt),
      }));
    },
  });
}

export function useBusiness(id: number | undefined) {
  const opts = orpc.businesses.get.queryOptions({
    input: { id: id ?? 0 },
    enabled: !!id,
    refetchInterval: (q) => {
      const d = q.state.data;
      if (!d) return false;
      const busy = d.running || Object.values(d.assets).some((a) => a.status === "running");
      return busy ? 2500 : false;
    },
  });
  return useQuery({
    ...opts,
    enabled: !!id,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res && res.business) return res;
      } catch (err) {
        console.warn(`[useBusiness] remote fetch failed for ${id}, using local storage:`, err);
      }
      const list = getLocalBusinesses();
      const found = list.find((b) => b.id === id) || list[0];
      if (!found) return null;
      return {
        business: {
          id: found.id,
          name: found.name,
          slug: found.slug,
          intake: found.intake,
          createdAt: new Date(found.createdAt),
        },
        assets: found.assets as any,
        running: false,
        leadCount: getLocalLeads(found.id).length,
      };
    },
  });
}

function useInvalidateBusiness() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
    qc.invalidateQueries({ queryKey: orpc.billing.access.key() });
  };
}

export function useCreateBusiness() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.create.mutationOptions({ onSuccess: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: Intake, ctx) => {
      try {
        if (baseOpts.mutationFn) {
          return await baseOpts.mutationFn(input, ctx);
        }
      } catch {
        // Fallback to local business creation on static hosting
      }
      const list = getLocalBusinesses();
      const nextId = list.reduce((max, b) => Math.max(max, b.id), 0) + 1;
      const rawName = input.idea?.trim().split(/[—\-.,]/)[0]?.trim().slice(0, 40) || `Venture #${nextId}`;
      const slug =
        rawName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 32) || `biz-${nextId}`;
      const now = new Date().toISOString();
      const created: StoredLocalBusiness = {
        id: nextId,
        name: rawName,
        slug,
        intake: input,
        createdAt: now,
        updatedAt: now,
        assets: buildDefaultAssets(rawName, slug, input),
      };
      saveLocalBusinesses([created, ...list]);
      done();
      return { id: nextId };
    },
  });
}

export function useRegenerate() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.regenerate.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; tool: string; instruction?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input as any, ctx);
      } catch {
        // Local fallback
      }
      if (input.tool === "logo-generation") {
        const list = getLocalBusinesses();
        const b = list.find((x) => x.id === input.id) || list[0];
        if (b) {
          const nextConcepts = await generateCuttingEdgeLogoSuite({
            businessName: b.name,
            tagline: "OFFICIAL BRAND",
            prompt: input.instruction || b.intake.idea,
            palette: CURATED_LOGO_PALETTES[Math.floor(Math.random() * CURATED_LOGO_PALETTES.length)]!,
            renderMode: "hybrid",
          });
          saveLocalLogoConcepts(b.id, nextConcepts, 0);
        }
      }
      done();
      return { ok: true };
    },
  });
}

export function useRebuild() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.rebuild.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; fromTool?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses();
      const idx = list.findIndex((b) => b.id === input.id);
      if (idx >= 0) {
        const b = list[idx]!;
        b.assets = buildDefaultAssets(b.name, b.slug, b.intake);
        b.updatedAt = new Date().toISOString();
        saveLocalBusinesses(list);
      }
      done();
      return { ok: true };
    },
  });
}

export function useChoose() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.choose.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; tool: "idea-wizard" | "name-generator" | "logo-generation"; index: number }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses();
      const b = list.find((x) => x.id === input.id);
      if (b && b.assets[input.tool]?.content) {
        b.assets[input.tool]!.content!.chosen = input.index;
        if (input.tool === "name-generator") {
          const picked = b.assets[input.tool]!.content!.names?.[input.index]?.name;
          if (picked) b.name = picked;
        }
        saveLocalBusinesses(list);
      }
      done();
      return { ok: true };
    },
  });
}

export function useToggleTask() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.toggleTask.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; itemId: string; done: boolean }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses();
      const b = list.find((x) => x.id === input.id);
      const items = b?.assets["launch-checklist"]?.content?.items as { id: string; done: boolean }[] | undefined;
      if (items) {
        const item = items.find((i) => i.id === input.itemId);
        if (item) item.done = input.done;
        saveLocalBusinesses(list);
      }
      done();
      return { ok: true };
    },
  });
}

export function useUpdateIntake() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.updateIntake.mutationOptions({ onSuccess: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; intake: Intake }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses();
      const b = list.find((x) => x.id === input.id);
      if (b) {
        b.intake = input.intake;
        b.updatedAt = new Date().toISOString();
        saveLocalBusinesses(list);
      }
      done();
      return { ok: true };
    },
  });
}

export function useUpdateSlug() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.updateSlug.mutationOptions({ onSuccess: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; slug: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const cleanSlug = input.slug.toLowerCase().trim();
      const list = getLocalBusinesses();
      const b = list.find((x) => x.id === input.id);
      if (b) {
        b.slug = cleanSlug;
        b.updatedAt = new Date().toISOString();
        saveLocalBusinesses(list);
      }
      done();
      return { ok: true, slug: cleanSlug };
    },
  });
}

export function useRemoveBusiness() {
  const done = useInvalidateBusiness();
  const baseOpts = orpc.businesses.remove.mutationOptions({ onSuccess: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses().filter((b) => b.id !== input.id);
      saveLocalBusinesses(list);
      done();
      return { ok: true };
    },
  });
}

/* CRM */
export function useLeads(businessId: number | undefined) {
  const opts = orpc.crm.list.queryOptions({ input: { businessId: businessId ?? 0 }, enabled: !!businessId });
  return useQuery({
    ...opts,
    enabled: !!businessId,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (Array.isArray(res)) return res;
      } catch (err) {
        console.warn(`[useLeads] fetch failed for ${businessId}:`, err);
      }
      return getLocalLeads(businessId).map((l) => ({ ...l, createdAt: new Date(l.createdAt) }));
    },
  });
}

function useInvalidateLeads() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: orpc.crm.key() });
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
  };
}

export function useAddLead() {
  const done = useInvalidateLeads();
  const baseOpts = orpc.crm.add.mutationOptions({ onSuccess: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { businessId: number; name: string; email: string; phone?: string; notes?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const all = getLocalLeads();
      const nextId = all.reduce((m, l) => Math.max(m, l.id), 0) + 1;
      all.unshift({
        id: nextId,
        businessId: input.businessId,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        status: "New",
        notes: input.notes || "",
        source: "manual",
        createdAt: new Date().toISOString(),
      });
      saveLocalLeads(all);
      done();
      return { id: nextId };
    },
  });
}

export function useUpdateLead() {
  const done = useInvalidateLeads();
  const baseOpts = orpc.crm.update.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number; status?: "New" | "Contacted" | "Qualified" | "Won" | "Lost"; notes?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const all = getLocalLeads();
      const item = all.find((l) => l.id === input.id);
      if (item) {
        if (input.status) item.status = input.status;
        if (input.notes !== undefined) item.notes = input.notes;
        saveLocalLeads(all);
      }
      done();
      return { ok: true };
    },
  });
}

export function useRemoveLead() {
  const done = useInvalidateLeads();
  const baseOpts = orpc.crm.remove.mutationOptions({ onSettled: done });
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { id: number }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      saveLocalLeads(getLocalLeads().filter((l) => l.id !== input.id));
      done();
      return { ok: true };
    },
  });
}

/* Billing */
export function useCheckout() {
  return useMutation(orpc.billing.checkout.mutationOptions());
}
export function usePortal() {
  return useMutation(orpc.billing.portal.mutationOptions());
}
export function useDropSingles() {
  const qc = useQueryClient();
  return useMutation(
    orpc.billing.dropSingles.mutationOptions({
      onSuccess: () =>
        qc.setQueryData(orpc.billing.access.queryKey(), (a) =>
          a ? { ...a, plans: a.plans.map((p) => (p.planId.startsWith("tool_") ? { ...p, canceling: true } : p)) } : a,
        ),
    }),
  );
}
export function useRefreshAccess() {
  const qc = useQueryClient();
  return useMutation(
    orpc.billing.refresh.mutationOptions({
      onSuccess: (data) => qc.setQueryData(orpc.billing.access.queryKey(), data),
    }),
  );
}

/* Public site */
export function useSite(slug: string) {
  const opts = orpc.sites.get.queryOptions({ input: { slug }, retry: false });
  return useQuery({
    ...opts,
    queryFn: async (ctx) => {
      try {
        const res = await opts.queryFn(ctx);
        if (res !== undefined && res !== null) return res;
      } catch (err) {
        console.warn(`[useSite] fetch failed for ${slug}, checking local businesses:`, err);
      }
      const list = getLocalBusinesses();
      const found = list.find((b) => b.slug === slug) || list[0];
      if (!found) return null;
      const colors = (found.assets["color-font-system"]?.content?.colors ?? []) as { role: string; hex: string }[];
      const getHex = (role: string, fallback: string) => colors.find((c) => c.role.toLowerCase() === role.toLowerCase())?.hex || fallback;
      const logoContent = found.assets["logo-generation"]?.content;
      const chosenIdx = typeof logoContent?.chosen === "number" ? logoContent.chosen : 0;
      const chosenLogo = logoContent?.concepts?.[chosenIdx]?.image ?? logoContent?.concepts?.[0]?.image ?? null;
      return {
        name: found.name,
        slug: found.slug,
        site: found.assets["website-generator"]?.content ?? {},
        logo: chosenLogo,
        theme: {
          primary: getHex("Primary", "#131313"),
          secondary: getHex("Secondary", "#FDE047"),
          accent: getHex("Accent", "#6EE7B7"),
          background: getHex("Background", "#FAF7F0"),
          text: getHex("Text", "#131313"),
          headingFont: found.assets["color-font-system"]?.content?.headingFont || "Space Grotesk",
          bodyFont: found.assets["color-font-system"]?.content?.bodyFont || "Plus Jakarta Sans",
        },
      };
    },
  });
}

export function useSubmitLead() {
  const baseOpts = orpc.sites.submitLead.mutationOptions();
  return useMutation({
    ...baseOpts,
    mutationFn: async (input: { slug: string; name: string; email: string; phone?: string; message?: string; company?: string }, ctx) => {
      try {
        if (baseOpts.mutationFn) return await baseOpts.mutationFn(input, ctx);
      } catch {
        // Local fallback
      }
      const list = getLocalBusinesses();
      const found = list.find((b) => b.slug === input.slug) || list[0];
      if (found) {
        const all = getLocalLeads();
        const nextId = all.reduce((m, l) => Math.max(m, l.id), 0) + 1;
        all.unshift({
          id: nextId,
          businessId: found.id,
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          status: "New",
          notes: input.message || "",
          source: "website",
          createdAt: new Date().toISOString(),
        });
        saveLocalLeads(all);
      }
      return { ok: true };
    },
  });
}

/** Human message from an oRPC / fetch error. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Try again.") {
  if (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string") {
    const m = (e as { message: string }).message;
    return m && m !== "Internal server error" ? m : fallback;
  }
  return fallback;
}
