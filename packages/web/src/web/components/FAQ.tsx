import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, Rocket, ShieldCheck } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Tools & AI" | "Billing & Launch";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "General",
    question: "How does 1 Click Business take an idea to an open business?",
    answer:
      "You complete a 2-minute business intake answering a few simple questions about your skills, budget, location, and idea. Our AI engine then generates your complete startup foundation: vetted business model, 12-month financial and operational business plan, brand identity (name, tagline, logo concepts, color/font system), a hosted landing page with lead capture, customer CRM pipeline, step-by-step launch checklist, and marketing assets (ad copy for Meta/Google/LinkedIn and a 14-day social calendar).",
  },
  {
    category: "General",
    question: "Do I need any technical, coding, or graphic design experience?",
    answer:
      "None at all. Everything from the website code to color theory, typography pairings, and ad copy is generated for you. If you want to make adjustments, you can simply type instructions in plain English to regenerate any asset until it matches your exact vision.",
  },
  {
    category: "Tools & AI",
    question: "How does the AI Business Advisor help me grow?",
    answer:
      "The Gemini Business Advisor is an interactive, multi-turn AI coach. It provides specialized support based on task complexity: strategic moat and unit economics modeling with gemini-4-argon, growth and marketing operations with gemini-3.8-flash, and rapid naming sprints with gemini-3.1-flash-lite. It also includes real-time Google Search Grounding to find active 2026 grants and Google Maps Grounding to scout local competitors and suppliers.",
  },
  {
    category: "Tools & AI",
    question: "What happens to the leads collected from my generated landing page?",
    answer:
      "Every generated landing page comes with an integrated contact and inquiry form. When a visitor submits their details, the inquiry automatically feeds straight into your Customer CRM. You can track status stages (New, Contacted, Qualified, Closed), keep notes, and export contacts to CSV.",
  },
  {
    category: "Billing & Launch",
    question: "What is included in the Phase 1 Bundle versus single tools?",
    answer:
      "The Phase 1 Launch Bundle ($99/month) includes all 13 business creation tools, 500 generation credits per month, and full access to the AI Business Advisor. You can also purchase single-tool plans starting from $5 to $29 per month if you only need a specific app like the Name Generator, Brand Kit, or Website Builder.",
  },
  {
    category: "Billing & Launch",
    question: "Can I cancel anytime? Are there any hidden setup fees?",
    answer:
      "No setup fees and no long-term contracts. Billing is powered securely by Stripe via Autumn. You can manage or cancel your subscription anytime with a single click in your Account portal. If you cancel, your access and assets remain available through the end of your prepaid billing period.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "General", "Tools & AI", "Billing & Launch"];

  const filteredItems =
    activeCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const toggle = (idx: number) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  };

  return (
    <section className="border-t-[3px] border-sun/30 bg-ink/95 text-sun py-12 px-4 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-mint mb-2">
              <HelpCircle className="h-4 w-4" />
              <span>Startup Knowledge Base</span>
            </div>
            <h3 className="display text-3xl md:text-4xl text-sun">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-sm text-sun/70 max-w-xl font-medium">
              Common questions about launching, scaling, and managing your business with 1 Click Business.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wide border-2 transition-colors ${
                  activeCategory === cat
                    ? "border-mint bg-mint text-ink font-black"
                    : "border-sun/40 bg-ink text-sun/80 hover:border-sun hover:text-sun"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className={`border-2 transition-all ${
                  isOpen
                    ? "border-mint bg-paper/5 text-sun shadow-md"
                    : "border-sun/20 bg-ink/40 text-sun hover:border-sun/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 font-bold cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="display text-lg leading-snug pr-2 text-sun">
                    {item.question}
                  </span>
                  <span
                    className={`shrink-0 p-1 rounded transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-mint" : "text-sun/60"
                    }`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 border-t border-sun/20 text-sm leading-relaxed text-sun/85 font-medium">
                    <p>{item.answer}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-wider text-mint bg-mint/10 border border-mint/30 px-2 py-0.5">
                        {item.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-sun/20 pt-8 text-xs">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-mint shrink-0" />
            <div>
              <strong className="block text-sun">Launch in Minutes</strong>
              <span className="text-sun/70">From blank canvas to hosted website & plan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-sun shrink-0" />
            <div>
              <strong className="block text-sun">Powered by Google Gemini</strong>
              <span className="text-sun/70">Grounded with live Search & Maps data</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-mint shrink-0" />
            <div>
              <strong className="block text-sun">Stripe & Autumn Security</strong>
              <span className="text-sun/70">Cancel anytime with zero commitments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
