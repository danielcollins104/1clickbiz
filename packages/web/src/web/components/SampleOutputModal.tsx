import { X, Sparkles, Eye, Layers } from "lucide-react";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { PRODUCTS } from "../../api/catalog";

export interface SampleData {
  title: string;
  badge: string;
  subtitle: string;
  deliverables: {
    label: string;
    value: string | React.ReactNode;
  }[];
  visualPreview?: React.ReactNode;
  founderTestimonial?: string;
}

export const SAMPLE_OUTPUTS: Record<string, SampleData> = {
  "idea-wizard": {
    title: "Idea Wizard Deliverable",
    badge: "Tool 01 Output",
    subtitle: "3 algorithmic business ideas ranked by your skills, budget, and local market demand.",
    deliverables: [
      { label: "Idea #1 (Top Fit)", value: "Kinship Hearth Bread Co. — Organic Doorstep Sourdough Subscription" },
      { label: "AI Fit Score", value: "96 / 100 · High Local Demand, Low Capital Overhead" },
      { label: "Time to First Sale", value: "Under 14 Days (Presale Waitlist strategy)" },
      { label: "Est. Startup Cost", value: "$450 (Cottage food license + bulk organic grain)" },
    ],
    founderTestimonial: "It didn't just give a vague concept; it gave exact pricing, local market demand data, and recommended my first 40 subscription targets.",
  },
  "business-plan": {
    title: "5-Year Lean Business Plan",
    badge: "Tool 03 Output",
    subtitle: "Investor-ready executive summary, 5-year monthly cash flow projection, and break-even roadmap.",
    deliverables: [
      { label: "Executive Summary", value: "Subscription bakery model scaling to $180k ARR with 68% gross margin." },
      { label: "Break-Even Month", value: "Month 3 based on 85 recurring weekly subscribers." },
      { label: "Customer Acquisition Cost", value: "$12.40 per subscriber via targeted local Meta ads." },
      { label: "Startup Capital Allocated", value: "$1,850 in equipment, insurance, and initial packaging." },
    ],
    founderTestimonial: "I took this exact plan to my local bank and was approved for our commercial expansion micro-grant in two weeks.",
  },
  "logo-generation": {
    title: "Vector Logo Concepts",
    badge: "Tool 06 Output",
    subtitle: "Three production-grade logo directions tailored to your brand voice and color palette.",
    deliverables: [
      { label: "Direction 1: Minimalist Emblem", value: "Organic wheat sheaf monoline badge with modern serif wordmark." },
      { label: "Direction 2: Bold Contemporary", value: "Heavy geometric sans-serif with bespoke flame icon cutout." },
      { label: "Direction 3: Heritage Stamp", value: "Circular artisanal stamp format with established date and location." },
      { label: "Export Formats", value: "High-Resolution PNG, SVG vector source, and favicon pack." },
    ],
    founderTestimonial: "Having transparent PNGs and vectors ready on day one saved me $600 on freelance design fees.",
  },
  "website-generator": {
    title: "Live Hosted Website & Contact Form",
    badge: "Tool 07 Output",
    subtitle: "Instant conversion-optimized web page with lead capture form directly connected to your CRM.",
    deliverables: [
      { label: "Published Address", value: "1clickbiz.com/sites/yourbusiness (Free SSL + hosting included)" },
      { label: "Conversion Architecture", value: "Hero proposition, social proof strip, pricing tiers, and direct checkout form." },
      { label: "SEO Structured Data", value: "Pre-configured Schema.org metadata and Google Search description." },
      { label: "CRM Automation", value: "Every customer submission flows immediately into your Phase 1 CRM." },
    ],
    founderTestimonial: "Our site was live on Sunday night. By Monday lunchtime, our first 6 customer inquiries were sitting in the CRM.",
  },
  "ai-advisor": {
    title: "Gemini AI Co-Founder Guidance",
    badge: "Tool 13 Output",
    subtitle: "An advisor that already ingested your plan, brand voice, and customer pipeline.",
    deliverables: [
      { label: "Context Memory", value: "Remembers your full business history, margins, and target customer profile." },
      { label: "Strategic Advice", value: "'Price starter loaves at $11 and bread bundles at $28 to maximize subscriber AOV.'" },
      { label: "Asset Rewrites", value: "Can directly regenerate website hero copy or ad angles upon your instruction." },
      { label: "Availability", value: "24/7 on demand from your dashboard." },
    ],
    founderTestimonial: "Whenever I'm unsure about what to post or how to price a custom order, the AI Advisor gives a math-backed answer in 5 seconds.",
  },
  "ad-generator": {
    title: "Multi-Platform Ad Creative Suite",
    badge: "Tool 08 Output",
    subtitle: "Turnkey ad headlines, primary copy, and 9:16 + 1:1 visual concepts for Meta and Google Search.",
    deliverables: [
      { label: "Google Search Ads", value: "3 Responsive Search Ads with character-counted headlines and descriptions." },
      { label: "Instagram & TikTok Copy", value: "High-hook video angles and problem-agitation-solution caption formulas." },
      { label: "Target Audience Definition", value: "Zip-code radii, demographic clusters, and keyword search intent list." },
      { label: "Suggested Daily Budget", value: "$10–$25/day target test spend with benchmark CTR metrics." },
    ],
    founderTestimonial: "I copy-pasted the headlines directly into Meta Ads Manager. First campaign ran at a $1.80 cost per click.",
  },
  "phase-1-launch": {
    title: "Phase 1 Complete Launch Suite",
    badge: "All 13 Tools Bundled",
    subtitle: "Your answers feed tool to tool automatically: from raw idea all the way to live open business.",
    deliverables: [
      { label: "13 AI Engines Queue In Order", value: "Idea -> Name -> Plan -> Brand -> Logo -> Website -> Ads -> Social -> CRM" },
      { label: "Unified Brand Identity", value: "Every asset shares identical typography, color system, and magnetic voice." },
      { label: "500 AI Generations / Month", value: "Regenerate, tweak, or expand any copy or graphic whenever you want." },
      { label: "Cost Comparison", value: "Buying tools separately = $214/mo. Phase 1 Bundle = $99/mo (Save $115/mo)." },
    ],
    founderTestimonial: "The handoff between tools is magic. Name picked my domain, plan fed the logo, and logo went straight onto the live website.",
  },
  "cold-outreach": {
    title: "5-Step Cold Email Pitch & LinkedIn Sequence",
    badge: "Tool 14 Output",
    subtitle: "High-reply automated cold sales outreach system engineered to land paying customers.",
    deliverables: [
      { label: "Step 1 Subject Line", value: "Quick question regarding {{company}}'s Q3 workflow bottlenecks" },
      { label: "Hook & Value Prop", value: "3-sentence personalized observation + soft audit offer with 0 friction." },
      { label: "Sequence Roadmap", value: "5-touch escalation (Day 1 initial, Day 4 case study, Day 8 breakdown, Day 14 breakup)." },
      { label: "LinkedIn Connection Note", value: "Custom 240-char connection script + InMail template." },
    ],
    founderTestimonial: "Sent the sequence to 80 local business owners. Booked 7 discovery calls and closed 2 retainer clients in week one.",
  },
  "competitor-radar": {
    title: "Competitor Vulnerability & Moat Playbook",
    badge: "Tool 15 Output",
    subtitle: "Competitive audit uncovering pricing weaknesses, customer complaints, and market white spaces.",
    deliverables: [
      { label: "Top 3 Competitors", value: "Pricing tiers, target demographic, and market share breakdown." },
      { label: "Customer Complaint Audit", value: "Identified 4 common 1-star review themes we can turn into marketing hooks." },
      { label: "Unserved White Space", value: "Transparent flat-rate pricing with same-day digital deliverables." },
      { label: "Defensive Moat", value: "Proprietary workflow and fast turnarounds that competitors can't match." },
    ],
    founderTestimonial: "Showed us exactly where the market leaders were slacking. We positioned our service directly against their biggest customer complaint.",
  },
  "seo-engine": {
    title: "Organic Commercial SEO Strategy & SERP Blueprints",
    badge: "Tool 16 Output",
    subtitle: "Transactional keyword matrix, page-by-page meta tags, and 3 pillar content briefs.",
    deliverables: [
      { label: "High-Intent Keywords", value: "8 commercial keywords with low difficulty and high buyer intent." },
      { label: "SERP Meta Tags", value: "Google title tag, meta description, and social share open-graph cards." },
      { label: "Pillar Content Outlines", value: "3 in-depth 2,500-word authority briefs structured to rank in Google and AI search." },
      { label: "AI Search Optimization", value: "Structured JSON schema tags formatted for Perplexity and ChatGPT search." },
    ],
    founderTestimonial: "Published the 3 pillar articles on our hosted site. Within 3 weeks we started ranking on page 1 for high-ticket local keywords.",
  },
};

export function SampleOutputModal({
  productSlug,
  isOpen,
  onClose,
}: {
  productSlug: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { add } = useCart();
  if (!isOpen || !productSlug) return null;

  const sample = SAMPLE_OUTPUTS[productSlug] || SAMPLE_OUTPUTS["idea-wizard"]!;
  const product = PRODUCTS.find((p) => p.slug === productSlug) || PRODUCTS[0]!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <button
        type="button"
        aria-label="Close sample preview"
        className="fixed inset-0 bg-ink/75 backdrop-blur-xs cursor-default"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] bg-paper border-[3px] border-ink shadow-[10px_10px_0px_#000] z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-ink text-sun border-2 border-ink shadow-[2px_2px_0px_#000]">
              <Eye className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-paper px-2 py-0.5 border border-ink">
                  {sample.badge}
                </span>
                <span className="text-xs font-black uppercase tracking-wide text-ink/70">Sample Deliverable</span>
              </div>
              <h3 className="display text-xl md:text-2xl text-ink leading-tight mt-0.5">{sample.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-quiet !p-2 border-2 border-ink hover:bg-ink hover:text-sun cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm font-bold text-muted bg-cream p-3 border-2 border-ink">
            {sample.subtitle}
          </p>

          {/* Key Deliverables Grid */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-ink" />
              <span>What this tool generates for your business:</span>
            </p>
            <div className="space-y-2">
              {sample.deliverables.map((item, idx) => (
                <div key={idx} className="b3 bg-white p-3.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 shadow-[2px_2px_0px_#000]">
                  <span className="text-xs font-black uppercase text-muted sm:w-1/3 shrink-0">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-ink sm:w-2/3 leading-snug">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Founder Testimonial */}
          {sample.founderTestimonial && (
            <div className="bg-ink text-sun p-4 b3">
              <p className="text-xs font-black uppercase tracking-widest text-mint mb-1 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Real Founder Output Experience
              </p>
              <blockquote className="text-xs sm:text-sm font-semibold italic text-cream leading-relaxed">
                "{sample.founderTestimonial}"
              </blockquote>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="border-t-[3px] border-ink bg-cream p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase text-muted block">Pricing</span>
            <p className="display text-2xl text-ink leading-tight">
              {money(product.price)}
              <span className="font-sans text-xs font-bold normal-case text-muted">/month</span>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-quiet border-2 border-ink text-xs font-bold w-1/3 sm:w-auto"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                add(product);
                onClose();
              }}
              className="btn btn-yellow border-2 border-ink text-xs sm:text-sm font-black shadow-[3px_3px_0px_#000] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 fill-ink" />
              <span>Get This Tool · {money(product.price)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
