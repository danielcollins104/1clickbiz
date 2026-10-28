export type WebsiteVibeId =
  | "neo-brutalist"
  | "cyber-glass"
  | "bento-minimal"
  | "editorial-luxury"
  | "kinetic-pop";

export type InteractiveAppType =
  | "quote-calculator"
  | "booking-scheduler"
  | "product-configurator"
  | "roi-simulator"
  | "ai-concierge-quiz";

export interface InteractiveAppConfig {
  type: InteractiveAppType;
  title: string;
  subtitle: string;
  sliderLabel: string;
  sliderMin: number;
  sliderMax: number;
  sliderDefault: number;
  unitLabel: string;
  baseRate: number;
  options: { label: string; multiplier: number; badge?: string }[];
  resultLabel: string;
  ctaText: string;
}

export interface SiteTestimonial {
  quote: string;
  author: string;
  role: string;
  metric: string;
}

export interface SiteVersionSnapshot {
  version: number;
  timestamp: string;
  promptUsed: string;
  vibe: WebsiteVibeId;
  siteData: CreativeSiteData;
}

export interface CreativeSiteData {
  vibe: WebsiteVibeId;
  customDomain?: string;
  seo: { title: string; description: string };
  announcement?: string;
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    cta: string;
    secondaryCta?: string;
    stats: { value: string; label: string }[];
  };
  interactiveApp: InteractiveAppConfig;
  bentoFeatures: {
    badge: string;
    title: string;
    description: string;
    highlight: string;
  }[];
  about: { title: string; body: string };
  services: {
    title: string;
    description: string;
    price: string;
    badge?: string;
    features?: string[];
  }[];
  steps: { title: string; body: string }[];
  benefits: string[];
  testimonials: SiteTestimonial[];
  faq: { q: string; a: string }[];
  contact: { title: string; body: string; button: string };
  heroImage?: { key: string; url: string };
  iterationHistory?: SiteVersionSnapshot[];
}

export const WEBSITE_VIBES: {
  id: WebsiteVibeId;
  name: string;
  badge: string;
  description: string;
  previewColors: { bg: string; card: string; text: string; accent: string; primary: string };
}[] = [
  {
    id: "neo-brutalist",
    name: "Neo-Brutalist Studio",
    badge: "High-Conversion",
    description: "Bold ink borders, offset hard shadows, punchy headlines, and unmistakable startup energy.",
    previewColors: { bg: "#FAF7F0", card: "#FFFFFF", text: "#131313", primary: "#FDE047", accent: "#6EE7B7" },
  },
  {
    id: "cyber-glass",
    name: "Obsidian AI Glass",
    badge: "Cutting-Edge Tech",
    description: "Deep space canvas, glowing neon gradients, frosted glass panels, and futuristic precision.",
    previewColors: { bg: "#090D16", card: "#111827", text: "#F8FAFC", primary: "#38BDF8", accent: "#A855F7" },
  },
  {
    id: "bento-minimal",
    name: "Swiss Bento Minimal",
    badge: "Apple / Linear Vibe",
    description: "Ultra-clean architectural Bento grid, subtle elevation, and effortless modern clarity.",
    previewColors: { bg: "#F8FAFC", card: "#FFFFFF", text: "#0F172A", primary: "#4F46E5", accent: "#10B981" },
  },
  {
    id: "editorial-luxury",
    name: "Editorial Luxury Atelier",
    badge: "Premium / Bespoke",
    description: "Warm alabaster canvas, refined serif typography, emerald & gold accents for high-ticket brands.",
    previewColors: { bg: "#F9F6F0", card: "#FFFFFF", text: "#14281D", primary: "#D4AF37", accent: "#064E3B" },
  },
  {
    id: "kinetic-pop",
    name: "Kinetic Creator Pop",
    badge: "Vibrant & Social",
    description: "Playful rounded geometry, high-energy coral and electric amber highlights built for viral sharing.",
    previewColors: { bg: "#FFFDF9", card: "#FFFFFF", text: "#18181B", primary: "#FF3366", accent: "#F59E0B" },
  },
];

export const INTERACTIVE_APP_TEMPLATES: {
  id: InteractiveAppType;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "quote-calculator",
    label: "Interactive Instant Quote & Price Calculator",
    emoji: "🧮",
    description: "Visitors slide quantity/scope and toggle tiers to calculate an instant custom price quote.",
  },
  {
    id: "booking-scheduler",
    label: "Live Service Configurator & Slot Booker",
    emoji: "📅",
    description: "Visitors customize their service package, pick a turnaround speed, and lock in a booking.",
  },
  {
    id: "roi-simulator",
    label: "Customer ROI & Time-Saved Simulator",
    emoji: "📈",
    description: "Visitors calculate how much money and hours per month your business saves them.",
  },
  {
    id: "product-configurator",
    label: "Custom Bundle / Order Builder App",
    emoji: "🛍️",
    description: "Visitors mix-and-match options, frequency, and add-ons with live total calculation.",
  },
  {
    id: "ai-concierge-quiz",
    label: "Interactive Plan Recommender Quiz",
    emoji: "✨",
    description: "Visitors answer 2 quick toggles and get an instant tailored package recommendation.",
  },
];

export const QUICK_ITERATION_PROMPTS: { label: string; prompt: string }[] = [
  {
    label: "🔥 Make Headlines Bolder & More Urgent",
    prompt: "Rewrite the hero headline, subheadline, and CTA to be 10x punchier, high-converting, and urgency-driven with stronger guarantees.",
  },
  {
    label: "🌌 Switch to Futuristic Dark AI Glass",
    prompt: "Switch aesthetic vibe to cyber-glass with a sleek dark-mode futuristic style and glowing accents.",
  },
  {
    label: "💎 Upgrade to High-Ticket Luxury Positioning",
    prompt: "Switch aesthetic vibe to editorial-luxury, increase pricing tiers to premium concierge rates ($299, $599/mo, $1,499), and refine copy for affluent clients.",
  },
  {
    label: "🧮 Add Interactive ROI & Savings Simulator",
    prompt: "Change the interactive web app module to an interactive ROI & Monthly Savings Simulator with higher impact numbers.",
  },
  {
    label: "📅 Add Live Booking & Turnaround Configurator",
    prompt: "Change the interactive web app module to a Live Service Configurator & Priority Turnaround Booker.",
  },
  {
    label: "⭐ Add 3 High-Proof Customer Case Studies",
    prompt: "Add stronger, metric-backed customer testimonials and expand the Bento grid features with concrete before-and-after results.",
  },
];

export function buildInteractiveAppConfig(
  appType: InteractiveAppType,
  businessName: string,
  ideaPrompt: string
): InteractiveAppConfig {
  const lower = `${businessName} ${ideaPrompt}`.toLowerCase();
  const isFoodOrProduct = /coffee|bake|bread|food|meal|box|clean|bottle|craft|shop|store/.test(lower);
  const isHomeService = /home|lawn|clean|repair|roof|wash|plumb|detail|dog|pet/.test(lower);

  switch (appType) {
    case "roi-simulator":
      return {
        type: "roi-simulator",
        title: `${businessName} — Interactive Value & ROI Simulator`,
        subtitle: "Slide to estimate how much time and budget you save every month by switching to our turnkey system.",
        sliderLabel: "Hours spent per week on manual work right now",
        sliderMin: 2,
        sliderMax: 40,
        sliderDefault: 12,
        unitLabel: "hrs / week",
        baseRate: 180,
        options: [
          { label: "Standard Automation", multiplier: 1, badge: "Popular" },
          { label: "Full Growth Suite", multiplier: 1.45, badge: "2.4x Faster" },
          { label: "VIP Done-For-You", multiplier: 2.1, badge: "Max ROI" },
        ],
        resultLabel: "Estimated Monthly Value Unlocked",
        ctaText: "Lock In My Custom ROI Plan →",
      };

    case "booking-scheduler":
      return {
        type: "booking-scheduler",
        title: `Build & Book Your ${businessName} Session`,
        subtitle: "Select your scope and preferred turnaround speed below for an instant guaranteed rate.",
        sliderLabel: isHomeService ? "Property Size / Service Scope (Units)" : "Monthly Deliverables / Sessions",
        sliderMin: 1,
        sliderMax: 12,
        sliderDefault: 3,
        unitLabel: isHomeService ? "rooms / zones" : "sessions / mo",
        baseRate: isHomeService ? 65 : 95,
        options: [
          { label: "Flexible Weekly Window", multiplier: 0.9, badge: "Save 10%" },
          { label: "48-Hour Priority Slot", multiplier: 1.0, badge: "Most Popular" },
          { label: "Same-Day VIP Express", multiplier: 1.35, badge: "Express" },
        ],
        resultLabel: "Your Instant Guaranteed Booking Rate",
        ctaText: "Reserve This Slot & Price Now →",
      };

    case "product-configurator":
      return {
        type: "product-configurator",
        title: `Customize Your ${businessName} Box & Cadence`,
        subtitle: "Mix and match your quantity and delivery frequency—subscribe to save automatically.",
        sliderLabel: isFoodOrProduct ? "Items / Packs Per Drop" : "Included Deliverables Per Pack",
        sliderMin: 1,
        sliderMax: 10,
        sliderDefault: 4,
        unitLabel: "items / pack",
        baseRate: 28,
        options: [
          { label: "One-Time Trial Order", multiplier: 1.15 },
          { label: "Monthly Member Drop", multiplier: 1.0, badge: "Free Shipping" },
          { label: "Weekly VIP Club", multiplier: 0.85, badge: "Save 15%" },
        ],
        resultLabel: "Your Custom Bundle Total",
        ctaText: "Claim My Custom Bundle →",
      };

    case "ai-concierge-quiz":
      return {
        type: "ai-concierge-quiz",
        title: `60-Second ${businessName} Matchmaker`,
        subtitle: "Tell us your monthly goal and pace—our interactive engine calculates your ideal tier immediately.",
        sliderLabel: "Your target growth / output scale (1 = Starter, 10 = Enterprise)",
        sliderMin: 1,
        sliderMax: 10,
        sliderDefault: 5,
        unitLabel: "scale index",
        baseRate: 59,
        options: [
          { label: "Self-Guided + Templates", multiplier: 0.8, badge: "Lean" },
          { label: "Guided Co-Pilot Plan", multiplier: 1.0, badge: "Best Fit" },
          { label: "Full White-Glove Execution", multiplier: 1.65, badge: "Hands-Free" },
        ],
        resultLabel: "Recommended Plan Investment",
        ctaText: "Start With This Recommended Plan →",
      };

    case "quote-calculator":
    default:
      return {
        type: "quote-calculator",
        title: `Instant Transparent Quote Calculator`,
        subtitle: "No hidden fees or waiting days for an estimate. Slide to configure your exact needs below:",
        sliderLabel: isHomeService ? "Service Size / Coverage Needed" : "Project Scope / Monthly Volume",
        sliderMin: 1,
        sliderMax: 15,
        sliderDefault: 4,
        unitLabel: "units",
        baseRate: 49,
        options: [
          { label: "Essential Tier", multiplier: 1.0, badge: "Core" },
          { label: "Pro Growth Tier", multiplier: 1.35, badge: "Best Value" },
          { label: "All-Inclusive Concierge", multiplier: 1.85, badge: "White-Glove" },
        ],
        resultLabel: "Your Instant Flat-Rate Estimate",
        ctaText: "Claim This Exact Quote Today →",
      };
  }
}

export function generateCreativeWebsite(opts: {
  businessName: string;
  location?: string;
  customer?: string;
  prompt: string;
  vibe: WebsiteVibeId;
  appType: InteractiveAppType;
  customDomain?: string;
  existingSite?: Partial<CreativeSiteData>;
}): CreativeSiteData {
  const name = (opts.businessName || "1 Click Venture").trim();
  const location = (opts.location || "Austin, TX & Online").trim();
  const customer = (opts.customer || "modern customers and ambitious founders").trim();
  const idea = (opts.prompt || `Turnkey ${name} experience designed for speed, quality, and zero friction.`).trim();

  const interactiveApp = buildInteractiveAppConfig(opts.appType, name, idea);

  const prevHistory = opts.existingSite?.iterationHistory ?? [];
  const nextVersionNum = prevHistory.length + 1;

  const built: CreativeSiteData = {
    vibe: opts.vibe,
    customDomain: opts.customDomain ?? opts.existingSite?.customDomain ?? "",
    seo: {
      title: `${name} — Official Interactive Site & Web App`,
      description: `${idea} Built for ${customer} in ${location}. Instant online quote calculator and booking.`,
    },
    announcement: `⚡ NOW OPEN IN ${location.toUpperCase()} · INSTANT ONLINE QUOTES & PRIORITY ONBOARDING`,
    hero: {
      eyebrow: `${location} · Verified Modern Specialist`,
      headline: `${name}: The Smarter, Faster Way to Get Real Results.`,
      subheadline: `${idea} Try our interactive calculator below to get an instant quote in 10 seconds—no sales pressure, ever.`,
      cta: "Try Interactive Quote App ↓",
      secondaryCta: "Explore Packages",
      stats: [
        { value: "4.9 ★", label: "Client Rating" },
        { value: "< 60s", label: "Instant Online Quote" },
        { value: "100%", label: "Satisfaction Guarantee" },
      ],
    },
    interactiveApp,
    bentoFeatures: [
      {
        badge: "01 · Speed to Value",
        title: "Instant Online Configuration",
        description: `Skip the 4-day wait for callbacks. Configure your exact ${name} package online and see transparent flat pricing immediately.`,
        highlight: "Zero hidden fees",
      },
      {
        badge: "02 · Crafted Around You",
        title: `Built Specifically for ${customer.slice(0, 38)}`,
        description: `Every detail of our workflow is engineered around ${idea.toLowerCase().slice(0, 90)}.`,
        highlight: "Tailored execution",
      },
      {
        badge: "03 · Founder-Led Quality",
        title: "100% Peace-of-Mind Guarantee",
        description: "If you aren't thrilled with your first deliverable or session, we make it right on the spot or refund your payment.",
        highlight: "Risk-free guarantee",
      },
    ],
    about: {
      title: `Why We Built ${name}`,
      body: `We noticed that ${customer} in ${location} were tired of slow quotes, confusing pricing, and inconsistent quality. So we created ${name} (${idea})—combining an interactive digital experience with obsessive, personal craftsmanship.`,
    },
    services: [
      {
        title: "Starter Launch Pack",
        badge: "Fastest Start",
        description: "Everything you need to experience our core service with zero long-term commitment.",
        price: "$99",
        features: [
          "Complete initial setup & consultation",
          "48-hour priority turnaround",
          "Direct founder support channel",
        ],
      },
      {
        title: "Growth Membership",
        badge: "Most Popular",
        description: "Our signature recurring plan for customers who want consistent, hands-free results every month.",
        price: "$199/mo",
        features: [
          "Priority recurring delivery & scheduling",
          "20% member savings on all add-ons",
          "Dedicated account roadmap & check-ins",
          "Cancel or pause in 1 click anytime",
        ],
      },
      {
        title: "VIP White-Glove Concierge",
        badge: "All-Inclusive",
        description: "Done-for-you priority execution with custom requests, express turnaround, and VIP care.",
        price: "$499",
        features: [
          "Same-day / next-day express priority",
          "Custom tailored scope & deliverables",
          "1-on-1 strategy & dedicated concierge",
        ],
      },
    ],
    steps: [
      {
        title: "1. Use the Interactive Calculator",
        body: "Slide the interactive estimator on this page to see your exact flat-rate price in seconds.",
      },
      {
        title: "2. Lock In Your Slot Online",
        body: "Send your inquiry below—your custom configuration goes straight to our priority queue.",
      },
      {
        title: "3. Enjoy Effortless Results",
        body: "We handle everything from start to finish and keep you updated at every milestone.",
      },
    ],
    benefits: [
      "Interactive live pricing calculator — know your cost in 10 seconds",
      `Locally rooted in ${location} with modern digital convenience`,
      "Flexible packages with zero long-term lock-in contracts",
      "Backed by our 100% Founder Satisfaction Guarantee",
    ],
    testimonials: [
      {
        quote: `The interactive quote tool on ${name}'s site gave me an exact price in 15 seconds, and the actual delivery blew away my expectations.`,
        author: "Jordan M.",
        role: "Verified Customer",
        metric: "Saved 8+ hrs/wk",
      },
      {
        quote: `Finally a business that shows transparent pricing up front and delivers on time. Switching to ${name} was a no-brainer.`,
        author: "Taylor R.",
        role: "Monthly Member",
        metric: "10/10 Experience",
      },
      {
        quote: "Super fast response, modern web app experience, and genuinely top-tier quality from day one.",
        author: "Alex K.",
        role: "VIP Client",
        metric: "3x Faster Turnaround",
      },
    ],
    faq: [
      {
        q: "How accurate is the interactive calculator on this page?",
        a: "100% accurate! The estimate you configure in the interactive widget is the exact flat rate we honor when you book.",
      },
      {
        q: "How quickly can we get started?",
        a: "Immediately. As soon as you submit the form below, your details land directly in our priority CRM and we reach out within 1 business hour.",
      },
      {
        q: "Can I switch plans or cancel anytime?",
        a: "Yes—all of our recurring memberships are month-to-month with zero cancellation fees.",
      },
    ],
    contact: {
      title: `Ready to Start With ${name}?`,
      body: "Submit your details below (your interactive calculator estimate is automatically attached!) and we'll reply within 1 business hour.",
      button: "Claim My Quote & Get Started →",
    },
    heroImage: opts.existingSite?.heroImage ?? { key: "hero", url: "/images/hero.webp" },
  };

  const snapshot: SiteVersionSnapshot = {
    version: nextVersionNum,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    promptUsed: idea,
    vibe: opts.vibe,
    siteData: JSON.parse(JSON.stringify(built)),
  };

  built.iterationHistory = [...prevHistory.slice(-9), snapshot];
  return built;
}

/**
 * Applies an iterative AI instruction to an existing CreativeSiteData object,
 * allowing the user to iterate and iterate until 100% satisfied!
 */
export function iterateCreativeWebsite(
  current: CreativeSiteData,
  businessName: string,
  instruction: string
): CreativeSiteData {
  const lower = instruction.toLowerCase();
  const next: CreativeSiteData = JSON.parse(JSON.stringify(current));

  // 1. Check if instruction asks for a vibe / theme change
  if (/dark|cyber|neon|glass|futur|ai|obsidian/.test(lower)) {
    next.vibe = "cyber-glass";
  } else if (/luxury|gold|emerald|serif|bespoke|high-ticket|affluent|premium/.test(lower)) {
    next.vibe = "editorial-luxury";
  } else if (/minimal|clean|apple|linear|bento|swiss/.test(lower)) {
    next.vibe = "bento-minimal";
  } else if (/pop|playful|colorful|vibrant|creator|fun/.test(lower)) {
    next.vibe = "kinetic-pop";
  } else if (/brutal|bold|yellow|poster/.test(lower)) {
    next.vibe = "neo-brutalist";
  }

  // 2. Check if instruction asks to change the interactive web app module
  if (/roi|saving|time-saved|simulator/.test(lower)) {
    next.interactiveApp = buildInteractiveAppConfig("roi-simulator", businessName, instruction);
  } else if (/book|schedule|calendar|slot|appointment/.test(lower)) {
    next.interactiveApp = buildInteractiveAppConfig("booking-scheduler", businessName, instruction);
  } else if (/bundle|shop|product|box|order|cart/.test(lower)) {
    next.interactiveApp = buildInteractiveAppConfig("product-configurator", businessName, instruction);
  } else if (/quiz|recommend|match/.test(lower)) {
    next.interactiveApp = buildInteractiveAppConfig("ai-concierge-quiz", businessName, instruction);
  } else if (/calculator|quote|estimate/.test(lower)) {
    next.interactiveApp = buildInteractiveAppConfig("quote-calculator", businessName, instruction);
  }

  // 3. Check if instruction asks for luxury / higher pricing
  if (/high-ticket|luxury|increase pric|higher pric|\$299|\$499|\$999|premium/.test(lower)) {
    next.services = [
      {
        title: "Signature Audit & Setup",
        badge: "Executive Entry",
        description: "Bespoke initial strategy and priority implementation tailored to your exact standards.",
        price: "$299",
        features: ["1-on-1 founder onboarding", "Custom blueprint & setup", "Priority 48-hour delivery"],
      },
      {
        title: "Private Retainer Membership",
        badge: "Most Popular",
        description: "Ongoing white-glove execution, dedicated priority queue, and proactive monthly optimization.",
        price: "$599/mo",
        features: ["Unlimited priority requests", "Dedicated slack/phone access", "Monthly executive review"],
      },
      {
        title: "Enterprise / VIP Partner",
        badge: "Full Concierge",
        description: "Complete end-to-end management with same-day response and custom integrations.",
        price: "$1,499",
        features: ["Dedicated specialist team", "Same-day VIP turnaround", "Custom SLA & guarantee"],
      },
    ];
    next.interactiveApp.baseRate = Math.max(next.interactiveApp.baseRate, 149);
  } else if (/lower pric|affordable|budget|under \$50|cheap|starter/.test(lower)) {
    next.services = [
      {
        title: "Quick-Start Pass",
        badge: "Best for Beginners",
        description: "Get started today with our streamlined essentials package.",
        price: "$29",
        features: ["Instant online access", "Step-by-step starter kit", "Email support"],
      },
      {
        title: "Monthly Club",
        badge: "Best Value",
        description: "Everything you need every month at one low flat rate.",
        price: "$49/mo",
        features: ["Full monthly deliverables", "Member-only perks", "Cancel anytime in 1 click"],
      },
      {
        title: "Pro Plus Bundle",
        badge: "Complete",
        description: "Extra priority and bonus customizations included.",
        price: "$99",
        features: ["Priority turnaround", "Custom setup included", "100% satisfaction guarantee"],
      },
    ];
    next.interactiveApp.baseRate = 19;
  }

  // 4. Check if instruction asks for bolder/urgent headlines or custom copy
  if (/bold|urgent|punch|hook|convert/.test(lower)) {
    next.hero.eyebrow = `⚡ LIMITED FOUNDING CLIENT SPOTS AVAILABLE THIS WEEK`;
    next.hero.headline = `Stop Waiting. Get ${businessName} Working For You in 24 Hours.`;
    next.hero.subheadline = `Join hundreds of smart customers using ${businessName} to save time, eliminate guesswork, and get guaranteed results—backed by our 100% Risk-Free Promise.`;
    next.hero.cta = "Claim My Founding Spot Now →";
  } else {
    // Incorporate the user's custom creative direction directly into the hero & bento copy!
    const cleanInstruction = instruction.trim().replace(/\.$/, "");
    next.hero.subheadline = `${cleanInstruction}. Use our interactive web app below to customize your exact plan in seconds.`;
    next.announcement = `✨ UPDATED STUDIO BUILD · ${cleanInstruction.toUpperCase().slice(0, 68)}`;
    next.bentoFeatures = [
      {
        badge: "✨ Custom AI Iteration",
        title: cleanInstruction.slice(0, 48) + (cleanInstruction.length > 48 ? "…" : ""),
        description: `Tailored specifically to your latest direction: "${cleanInstruction}". Built for maximum customer conversion and clarity.`,
        highlight: "Live & Active",
      },
      ...(next.bentoFeatures || []).slice(0, 2),
    ];
  }

  const prevHistory = current.iterationHistory ?? [];
  const nextVersionNum = prevHistory.length + 1;
  const snapshot: SiteVersionSnapshot = {
    version: nextVersionNum,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    promptUsed: instruction,
    vibe: next.vibe,
    siteData: JSON.parse(JSON.stringify({ ...next, iterationHistory: undefined })),
  };

  next.iterationHistory = [...prevHistory.slice(-9), snapshot];
  return next;
}

/**
 * Exports the entire generated website + interactive web app as a standalone,
 * self-contained index.html file that can be dropped onto any domain or host!
 */
export function downloadStandaloneSiteHtml(businessName: string, slug: string, site: CreativeSiteData) {
  const vibeObj = WEBSITE_VIBES.find((v) => v.id === site.vibe) ?? WEBSITE_VIBES[0]!;
  const c = vibeObj.previewColors;
  const app = site.interactiveApp ?? buildInteractiveAppConfig("quote-calculator", businessName, "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${site.seo?.title || businessName}</title>
  <meta name="description" content="${site.seo?.description || ""}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${c.bg}; color: ${c.text}; }
    h1, h2, h3, .display { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="min-h-screen">
  <div class="border-b-2 border-black bg-black text-yellow-300 text-xs font-extrabold uppercase tracking-widest py-2.5 px-4 text-center">
    ${site.announcement || `OFFICIAL INTERACTIVE WEB APP · ${businessName.toUpperCase()}`}
  </div>
  <header class="max-w-6xl mx-auto flex items-center justify-between px-6 py-5 border-b border-current/15">
    <div class="text-2xl font-black tracking-tight display">${businessName}</div>
    <a href="#contact" class="px-5 py-2.5 font-extrabold rounded-full border-2 border-black shadow-[3px_3px_0_#000]" style="background:${c.primary};color:#131313">${site.hero?.cta || "Get Started"}</a>
  </header>
  <main class="max-w-6xl mx-auto px-6 py-16 space-y-20">
    <section class="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <span class="inline-block px-3 py-1 text-xs font-extrabold uppercase border-2 border-black mb-4" style="background:${c.accent};color:#131313">${site.hero?.eyebrow || "Official Launch"}</span>
        <h1 class="text-5xl md:text-6xl font-black leading-none display">${site.hero?.headline || businessName}</h1>
        <p class="mt-5 text-lg opacity-85 leading-relaxed">${site.hero?.subheadline || ""}</p>
        <div class="mt-8 flex flex-wrap gap-4">
          <a href="#interactive-app" class="px-7 py-3.5 font-extrabold border-2 border-black shadow-[4px_4px_0_#000]" style="background:${c.primary};color:#131313">${site.hero?.cta || "Try Calculator"}</a>
        </div>
      </div>
      <div id="interactive-app" class="p-8 rounded-2xl border-3 border-black shadow-[8px_8px_0_#000]" style="background:${c.card};color:${c.text}">
        <span class="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 border border-black" style="background:${c.accent};color:#131313">Interactive Web App</span>
        <h2 class="text-2xl font-black mt-3 display">${app.title}</h2>
        <p class="text-sm opacity-80 mt-1">${app.subtitle}</p>
        <div class="mt-6">
          <label class="block text-xs font-extrabold uppercase">${app.sliderLabel}: <span id="slider-val" class="text-lg">${app.sliderDefault}</span> ${app.unitLabel}</label>
          <input id="calc-slider" type="range" min="${app.sliderMin}" max="${app.sliderMax}" value="${app.sliderDefault}" class="w-full mt-2 accent-black cursor-pointer" oninput="updateCalc()" />
        </div>
        <div class="mt-6 p-5 rounded-xl border-2 border-black text-center" style="background:${c.primary};color:#131313">
          <div class="text-xs font-extrabold uppercase">${app.resultLabel}</div>
          <div id="calc-total" class="text-4xl font-black display mt-1">$${Math.round(app.sliderDefault * app.baseRate)}</div>
        </div>
        <a href="#contact" class="block text-center mt-5 py-3 font-extrabold border-2 border-black bg-black text-white rounded-lg">${app.ctaText}</a>
      </div>
    </section>
  </main>
  <script>
    function updateCalc() {
      var v = Number(document.getElementById('calc-slider').value || 1);
      document.getElementById('slider-val').textContent = v;
      document.getElementById('calc-total').textContent = '$' + Math.round(v * ${app.baseRate});
    }
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${slug || "my-business"}-webapp.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
