export type Tone = "yellow" | "black" | "white" | "green";

export interface Product {
  slug: string;
  num: string;
  name: string;
  tagline: string;
  description: string;
  category: "Plan" | "Brand" | "Market" | "Run" | "Bundle";
  price: number; // monthly, USD
  tone: Tone;
  icon: string;
  isNew: boolean;
  bestSeller: boolean;
  youGive: string;
  youGet: string;
  features: string[];
  integrations: string[];
  image?: string;
}

/** Autumn feature id for a tool slug (boolean access flag). */
export const featureIdFor = (slug: string) => slug.replace(/-/g, "_");
/** Autumn plan id for a product slug. The bundle is the main plan; single tools are add-ons. */
export const planIdFor = (slug: string) => (slug === BUNDLE_SLUG ? "phase_1_launch" : `tool_${featureIdFor(slug)}`);
export const BUNDLE_SLUG = "phase-1-launch";
/** Metered feature consumed by every AI generation. */
export const GENERATIONS = "generations";
export const BUNDLE_GENERATIONS = 500;
export const TOOL_GENERATIONS = 60;

/** Launch-checklist tasks that tick themselves when the matching tool has output. */
export const AUTO_TASKS: { id: string; title: string; tool: string }[] = [
  { id: "auto-idea", title: "Choose your business idea", tool: "idea-wizard" },
  { id: "auto-name", title: "Pick a business name", tool: "name-generator" },
  { id: "auto-plan", title: "Write your business plan", tool: "business-plan" },
  { id: "auto-brand", title: "Define your brand", tool: "brand-generator" },
  { id: "auto-colors", title: "Set brand colours and fonts", tool: "color-font-system" },
  { id: "auto-logo", title: "Design a logo", tool: "logo-generation" },
  { id: "auto-site", title: "Publish your website", tool: "website-generator" },
  { id: "auto-ads", title: "Prepare your first ads", tool: "ad-generator" },
  { id: "auto-social", title: "Plan two weeks of social posts", tool: "social-generator" },
  { id: "auto-funding", title: "Shortlist funding options", tool: "funding-finder" },
  { id: "auto-crm", title: "Set up a place to track customers", tool: "customer-crm" },
  { id: "auto-outreach", title: "Build cold email & pitch sequences", tool: "cold-outreach" },
  { id: "auto-competitor", title: "Analyze competitors & market gaps", tool: "competitor-radar" },
  { id: "auto-seo", title: "Generate SEO keywords & pillar outlines", tool: "seo-engine" },
];

export const PRODUCTS: Product[] = [
  {
    "slug": "phase-1-launch",
    "num": "P1",
    "name": "Phase 1 — Business Launch",
    "tagline": "All 13 tools. From Idea to Open for Business.",
    "description": "The complete launch suite. Answer eight questions about you and your idea once, and every tool runs in order: ideas, a name, a plan, a brand, a palette, logos, a hosted website, ads, two weeks of social posts, a launch checklist, funding leads and a CRM. Each tool feeds the next, and you can rewrite anything by typing what to change.",
    "category": "Bundle",
    "price": 99,
    "tone": "black",
    "icon": "Rocket",
    "isNew": false,
    "bestSeller": true,
    "youGive": "A few answers about you and your idea",
    "youGet": "A named, branded business with a live page",
    "features": [
      "All 13 Phase 1 tools",
      "Each tool feeds the next automatically",
      "One brand, applied everywhere",
      "500 AI generations a month",
      "Save $115/mo vs. buying separately"
    ],
    "integrations": [],
    "image": "/images/bundle-kit-square.webp"
  },
  {
    "slug": "idea-wizard",
    "num": "01",
    "name": "Business Idea Wizard",
    "tagline": "The time to start a business is now!  If you still havnt decided on something, use our Idea Wizard.  Well make you a business based on your interests that we know will succeed.  You can always start a different one later, but how long have you been at a standstill?  Run the wizard and choose the project that excites you.  Do it right now.  See you in the next step.",
    "description": "The time to start a business is now!  If you still havnt decided on something, use our Idea Wizard.  Well make you a business based on your interests that we know will succeed.  You can always start a different one later, but how long have you been at a standstill?  Run the wizard and choose the project that excites you.  Do it right now.  See you in the next step. Just enter your interests and a few possibilities below and we will build 3 complete business idea cards you can choose from—complete with market demand, competition, startup cost, revenue model, and time to first sale.",
    "category": "Plan",
    "price": 12,
    "tone": "yellow",
    "icon": "Lightbulb",
    "isNew": false,
    "bestSeller": true,
    "youGive": "Your interests and a few possibilities",
    "youGet": "3 complete business idea cards you can choose from",
    "features": [
      "Enter your interests & a few possibilities",
      "Builds 3 complete, proven business idea cards",
      "Approve ✓ individual parts & iterate the rest",
      "Startup cost & time-to-first-sale breakdown",
      "Choose your favorite card — it feeds every other tool"
    ],
    "integrations": [],
    "image": "/images/tools/idea-wizard.webp"
  },
  {
    "slug": "ai-advisor",
    "num": "02",
    "name": "Vanguard-X™ Sovereign AI Advisor",
    "tagline": "Autonomous multi-agent executive intelligence that knows your entire business.",
    "description": "Powered by our Tri-Core Vanguard-X™ Neural Architecture (Omni-9, Quantum-5, and Hyper-Lite)—engineered beyond standard conversational LLMs. Vanguard-X™ indexes your business plan, pricing matrix, brand voice, and CRM leads, connects to our Live Global Grant & Market Grid and Geospatial Telemetry Radar, and can rewrite any of your assets on command.",
    "category": "Run",
    "price": 25,
    "tone": "green",
    "icon": "Bot",
    "isNew": true,
    "bestSeller": true,
    "youGive": "Any strategic, pricing, funding, or growth command",
    "youGet": "Executive playbooks, live grant/market telemetry & asset rewrites",
    "features": [
      "Tri-Core Vanguard-X™ Neural Engine (Omni-9, Quantum-5, Hyper-Lite)",
      "Live Global Web & Non-Dilutive Grant Intelligence Grid",
      "Geospatial Commercial & Competitor Telemetry Radar",
      "Indexed across all 13 of your business deliverables",
      "Rewrites any business asset on command"
    ],
    "integrations": [],
    "image": "/images/tools/ai-advisor.webp"
  },
  {
    "slug": "logo-generation",
    "num": "03",
    "name": "Logo Generation",
    "tagline": "Six AI logo concepts. Vector SVG + Diffusion.",
    "description": "Generates six AI logo concepts in distinct visual styles using our Multi-Engine GenAI Logo Studio (Neural Vector SVG + Diffusion). Pick the one you like, customize colors and motifs, and download in infinite-scale SVG or 2048×2048 HD PNG.",
    "category": "Brand",
    "price": 15,
    "tone": "yellow",
    "icon": "PenTool",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Nothing — it reads your name and colours",
    "youGet": "6 logo concepts as scalable SVGs & HD PNGs",
    "features": [
      "Multi-Engine Neural Vector SVG + Diffusion AI",
      "Instant color palette & motif customization",
      "2048×2048 HD PNG & scalable SVG downloads",
      "Pick one — it goes on your live site",
      "Re-run anytime"
    ],
    "integrations": [],
    "image": "/images/tools/logo-generation.webp"
  },
  {
    "slug": "funding-finder",
    "num": "04",
    "name": "Funding / Grant Finder",
    "tagline": "Find money you didn't know you qualified for.",
    "description": "Runs a live web search for grants, loans, microloans, programmes and competitions that match your location and idea. Every result shows the amount, eligibility, deadline and a link to the source so you can check it yourself.",
    "category": "Plan",
    "price": 19,
    "tone": "black",
    "icon": "HandCoins",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Nothing — it reads your plan",
    "youGet": "Funding leads with source links",
    "features": [
      "Live web search for grants + loans",
      "Matched to your location and stage",
      "Eligibility notes per match",
      "Source links on every result",
      "Re-run anytime for new matches"
    ],
    "integrations": [],
    "image": "/images/tools/funding-finder.webp"
  },
  {
    "slug": "business-plan",
    "num": "05",
    "name": "AI Business Plan",
    "tagline": "A lean business plan, written while you wait.",
    "description": "Turns your chosen idea into a lean business plan: executive summary, problem and solution, market, competitors, pricing, marketing, operations, startup costs, a 12-month revenue and cost projection, milestones and risks.",
    "category": "Plan",
    "price": 19,
    "tone": "black",
    "icon": "FileText",
    "isNew": false,
    "bestSeller": true,
    "youGive": "Your idea (or one from the Wizard)",
    "youGet": "A lean plan with a 12-month projection",
    "features": [
      "Executive summary",
      "Market + competitor overview",
      "Pricing & revenue model",
      "12-month revenue + cost projection",
      "Printable — save as PDF"
    ],
    "integrations": [],
    "image": "/images/tools/business-plan.webp"
  },
  {
    "slug": "ad-generator",
    "num": "06",
    "name": "Advertisement Generator",
    "tagline": "Ad copy and creative for Meta, Google and LinkedIn.",
    "description": "Writes ready-to-paste ad copy for Meta, Google Search and LinkedIn, with headline variants and angles for each customer persona. It also generates a square feed image and a vertical story image, and suggests an audience and a starter budget.",
    "category": "Market",
    "price": 19,
    "tone": "yellow",
    "icon": "Megaphone",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Nothing — it reads your brand",
    "youGet": "Ad copy plus feed and story images",
    "features": [
      "Copy for Meta, Google and LinkedIn",
      "Headline + copy variants",
      "Persona-targeted angles",
      "AI ad images (square + story)",
      "Budget and audience suggestions"
    ],
    "integrations": [],
    "image": "/images/tools/ad-generator.webp"
  },
  {
    "slug": "name-generator",
    "num": "07",
    "name": "Business Name Generator",
    "tagline": "10 names that fit. Pick one, it's used everywhere.",
    "description": "Generates ten brandable names in your tone, each with a tagline and the reasoning behind it. Every name comes with a domain search link so you can check availability yourself. Pick one and it flows into every other tool.",
    "category": "Brand",
    "price": 9,
    "tone": "white",
    "icon": "Type",
    "isNew": false,
    "bestSeller": false,
    "youGive": "Your idea + the vibe you want",
    "youGet": "10 names with taglines and domain links",
    "features": [
      "10 names with taglines",
      "Tone that matches your brand",
      "Why each name works",
      "One-click domain search links",
      "Pick one — it's used everywhere"
    ],
    "integrations": [],
    "image": "/images/tools/name-generator.webp"
  },
  {
    "slug": "brand-generator",
    "num": "08",
    "name": "Brand Generator",
    "tagline": "Your whole brand identity, start to finish.",
    "description": "Builds the mission, brand story, values, tone-of-voice rules, two customer personas, taglines and key messages from your idea. The website, ads and social posts all write in this voice.",
    "category": "Brand",
    "price": 19,
    "tone": "green",
    "icon": "Sparkles",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Your business name",
    "youGet": "Brand story, voice, personas and messaging",
    "features": [
      "Mission + brand story",
      "Tone-of-voice guide",
      "Customer personas",
      "Key messages + taglines",
      "Feeds every other tool automatically"
    ],
    "integrations": [],
    "image": "/images/tools/brand-generator.webp"
  },
  {
    "slug": "color-font-system",
    "num": "09",
    "name": "Color / Font System",
    "tagline": "Palette and type that actually work together.",
    "description": "Builds a five-colour palette with a role for each colour, a Google Fonts heading and body pairing, and a few usage rules. Copy the CSS variables, and your generated website uses them automatically.",
    "category": "Brand",
    "price": 9,
    "tone": "white",
    "icon": "Palette",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Nothing — it reads your brand",
    "youGet": "Palette, font pairing and style guide",
    "features": [
      "5-colour palette with roles",
      "Google Fonts heading + body pair",
      "Readable text colour per swatch",
      "Copy-paste CSS variables",
      "Applied to your site automatically"
    ],
    "integrations": [],
    "image": "/images/tools/color-font-system.webp"
  },
  {
    "slug": "website-generator",
    "num": "10",
    "name": "Generative AI Website & Web App Builder",
    "tagline": "Open your free live website today — create, iterate until satisfied, and host free.",
    "description": "Creatively synthesizes an above-and-beyond website and interactive web app (live quote calculator, booking configurator, ROI simulator, or recommender quiz), lets you iterate unlimited times with version history, and hosts it free at /sites/your-name, on your custom domain, or as a standalone HTML5 download.",
    "category": "Market",
    "price": 29,
    "tone": "black",
    "icon": "Globe",
    "isNew": true,
    "bestSeller": true,
    "youGive": "Your creative prompt or business idea",
    "youGet": "A live interactive web app + unlimited AI iterations + free hosting",
    "features": [
      "Generative AI Website & Interactive Web App form",
      "Unlimited AI iterations + Version History restore",
      "Hosted free at /sites/your-name or custom domain",
      "Lead form wired straight into your CRM",
      "1-click standalone HTML5 web app export"
    ],
    "integrations": [],
    "image": "/images/tools/website-generator.webp"
  },
  {
    "slug": "social-generator",
    "num": "11",
    "name": "Social Content Generator",
    "tagline": "Two weeks of posts. Planned and written.",
    "description": "Plans your first 14 days of social posts on the platforms your customers actually use, with hooks, captions and hashtags ready to paste, plus three on-brand post images.",
    "category": "Market",
    "price": 15,
    "tone": "green",
    "icon": "Share2",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Nothing — it reads your brand",
    "youGet": "A 14-day calendar with post images",
    "features": [
      "14-day posting calendar",
      "Captions + hashtags",
      "Branded post images",
      "Platform-specific formats",
      "Regenerate in one click"
    ],
    "integrations": [],
    "image": "/images/tools/social-generator.webp"
  },
  {
    "slug": "launch-checklist",
    "num": "12",
    "name": "Business Launch Checklist",
    "tagline": "Every step to launch, in the right order.",
    "description": "A checklist for your business type and location covering registration, licences, tax ID, banking, insurance and bookkeeping, with official links where available. Tasks that the other tools complete are ticked off automatically.",
    "category": "Plan",
    "price": 5,
    "tone": "white",
    "icon": "ListChecks",
    "isNew": false,
    "bestSeller": false,
    "youGive": "Nothing — it reads your intake",
    "youGet": "A personalised step-by-step launch plan",
    "features": [
      "Registration + licence steps for your area",
      "Tax ID and banking steps",
      "Insurance pointers",
      "Ticks off tasks other tools finish",
      "Progress tracking"
    ],
    "integrations": [],
    "image": "/images/tools/launch-checklist.webp"
  },
  {
    "slug": "customer-crm",
    "num": "13",
    "name": "Customer CRM",
    "tagline": "Every lead from day one, in one place.",
    "description": "Every enquiry from your generated website's contact form lands here. Add contacts by hand, move them through a simple pipeline, keep notes and export a CSV.",
    "category": "Run",
    "price": 19,
    "tone": "yellow",
    "icon": "Users",
    "isNew": false,
    "bestSeller": false,
    "youGive": "Nothing — your site feeds it",
    "youGet": "A pipeline that fills from your site",
    "features": [
      "Leads captured from your generated site",
      "Simple status pipeline",
      "Notes per contact",
      "Add contacts by hand",
      "CSV export"
    ],
    "integrations": [],
    "image": "/images/tools/customer-crm.webp"
  },
  {
    "slug": "cold-outreach",
    "num": "14",
    "name": "Cold Outreach & Email Pitch Engine",
    "tagline": "Turn cold prospects into booked calls and sales.",
    "description": "Generates a complete 5-step cold email sequence tailored to your exact ICP, plus LinkedIn connection notes, objection-handling scripts, and soft calls-to-action. Uses proven high-reply hooks tested across thousands of founder campaigns.",
    "category": "Market",
    "price": 19,
    "tone": "yellow",
    "icon": "Send",
    "isNew": true,
    "bestSeller": true,
    "youGive": "Target client role, industry, and core offer",
    "youGet": "5-step email sequence + LinkedIn outreach scripts",
    "features": [
      "Personalized 5-step sequence (Day 1 to 14)",
      "Subject lines engineered for 40%+ open rates",
      "LinkedIn connection notes + follow-ups",
      "Objection rebuttals for top 3 customer pushbacks",
      "Export ready for Apollo, Instantly, or Gmail"
    ],
    "integrations": []
  },
  {
    "slug": "competitor-radar",
    "num": "15",
    "name": "Competitor & Market Gap Radar",
    "tagline": "Audit top competitors and exploit their weaknesses.",
    "description": "Analyzes the top competitors in your niche, maps their pricing models and customer complaints, and pinpoints unexploited market opportunities. Formulates your unfair advantage and defensive moat strategy so you don't compete on price alone.",
    "category": "Plan",
    "price": 18,
    "tone": "black",
    "icon": "Target",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Your business idea, niche, or competitor names",
    "youGet": "Competitor teardown, pricing matrix & defensive moat",
    "features": [
      "Teardown of top 3 direct and indirect competitors",
      "Customer pain & negative review analysis",
      "Unserved niche segments and market gaps",
      "Defensive moat & unfair advantage playbook",
      "Actionable positioning blueprint"
    ],
    "integrations": []
  },
  {
    "slug": "seo-engine",
    "num": "16",
    "name": "SEO Authority & Keyword Strategy",
    "tagline": "Win organic Google and AI search traffic without ad spend.",
    "description": "Discovers high-intent commercial keywords your prospective buyers are searching for. Generates page-by-page SEO meta titles, descriptions, schema tags, and 3 comprehensive pillar article outlines optimized for Google search and AI answer engines.",
    "category": "Market",
    "price": 16,
    "tone": "green",
    "icon": "Search",
    "isNew": true,
    "bestSeller": false,
    "youGive": "Target audience and core value proposition",
    "youGet": "Commercial keywords, meta tags & 3 pillar content briefs",
    "features": [
      "High-intent transactional keyword shortlist",
      "Page-by-page meta titles & descriptions",
      "3 detailed organic pillar article blueprints",
      "Optimized for Google & AI search (Perplexity, ChatGPT)",
      "Direct integration with your Generated Website"
    ],
    "integrations": []
  }
];
