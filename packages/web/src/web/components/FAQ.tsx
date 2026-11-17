import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles, Rocket, ShieldCheck, Check } from "lucide-react";
import { ReadAloudButton } from "./ReadAloudButton";

export interface FAQItem {
  question: string;
  summary: string;
  answer: string;
  highlights: string[];
  category: "General" | "Tools & AI" | "Billing & Launch";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    category: "General",
    question: "How does 1 Click Business take an idea to an open business?",
    summary: "Answer 8 quick questions once, and 16 connected AI engines build your entire business automatically.",
    answer:
      "You complete a 2-minute intake about your interests, budget, and location. Our connected AI pipeline then builds your startup foundation step by step—each tool passing its output to the next so you never type the same thing twice.",
    highlights: [
      "3 validated business ideas + 12-month financial & operational business plan",
      "Complete brand identity: company name, voice guide, color/font system & 6 vector logos",
      "Free hosted interactive website (/sites/your-name), ad creatives, 14-day social calendar & customer CRM",
    ],
  },
  {
    category: "General",
    question: "Do I need any technical, coding, or graphic design experience?",
    summary: "Zero coding or design skills needed—everything is built for you and editable in plain English.",
    answer:
      "None at all. Every deliverable—from your interactive website code and quote calculator to your vector logo, color palette, and ad copy—is generated automatically. Whenever you want a change, just type what you want in plain English.",
    highlights: [
      "1-Click Quick Start templates let you test-drive a complete business in 60 seconds",
      "Unlimited AI iterations on your website, logo, and business plan",
      "Approve individual sections with a checkmark and regenerate only what you want to tweak",
    ],
  },
  {
    category: "Tools & AI",
    question: "How does the Solomon™ AI Business Advisor help me grow?",
    summary: "Solomon™ already knows your plan, pricing, and website—and gives you actionable daily playbooks.",
    answer:
      "Solomon™ is your 24/7 AI executive co-founder. Because it has already read your business plan, brand voice, and CRM leads, you can ask specific questions about pricing, closing customers, or local competitors and get tailored scripts immediately.",
    highlights: [
      "Live Google Search Grounding to find active 2026 small-business grants & loans",
      "Local competitor & market gap radar tailored to your city",
      "Click any paragraph Solomon™ writes to save it straight into your Slide-Out Founder Notebook",
    ],
  },
  {
    category: "Tools & AI",
    question: "What happens to the leads collected from my generated website?",
    summary: "Every customer inquiry on your live site flows straight into your built-in Customer CRM.",
    answer:
      "Your generated website includes an interactive quote/booking form and lead capture. The moment a visitor submits their info, they appear inside your Customer CRM (Engine #13) so you can follow up and close the sale.",
    highlights: [
      "Track every lead by stage: New, Contacted, Qualified, Won, or Lost",
      "Add private founder notes, deal values, and follow-up reminders",
      "1-click CSV export anytime you want to back up or move your contacts",
    ],
  },
  {
    category: "Billing & Launch",
    question: "What is included in the Phase 1 All-Access Pass versus single tools?",
    summary: "All-Access ($99/mo) unlocks all 16 AI engines + 500 generations/mo, saving $115+/mo over single plans.",
    answer:
      "The Phase 1 All-Access Subscription ($99/month, or $79/month billed annually) unlocks all 16 AI launch engines, 500 monthly AI generations, free live website hosting, and Solomon™ Advisor. You can also start with a Single Engine Plan ($5–$29/mo) or a 3-Tool Launch Stack.",
    highlights: [
      "All 16 AI Launch Engines unlocked & wired together in one dashboard",
      "500 AI generations every month + free hosting at /sites/your-name",
      "Protected by our 14-Day 100% Money-Back Guarantee",
    ],
  },
  {
    category: "Billing & Launch",
    question: "Can I cancel anytime? Are there any hidden setup fees?",
    summary: "Zero setup fees, no long-term contracts, and 1-click cancellation anytime.",
    answer:
      "There are never any setup fees, hosting markups, or lock-in contracts. Billing is handled securely through Stripe. You can switch plans or cancel with a single click from your Account page.",
    highlights: [
      "Cancel in 1 click from your Account portal—no phone calls or hoops",
      "Keep full access to your tools and exported assets through the end of your billing period",
      "14-Day No-Questions-Asked Refund if you aren't thrilled with your build",
    ],
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "General", "Tools & AI", "Billing & Launch"];

  const filteredItems =
    activeCategory === "All"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((item) => item.category === activeCategory);

  const toggle = (idx: number) => {
    setOpenIndex((current) => (current === idx ? null : idx));
  };

  const allFaqSpeechText = filteredItems
    .map(
      (item, i) =>
        `Question ${i + 1}: ${item.question}. ${item.summary} ${item.answer} Key highlights: ${item.highlights.join(". ")}.`
    )
    .join(" ");

  return (
    <section className="border-t-[3px] border-sun/40 bg-ink text-white py-14 px-4 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-black uppercase tracking-widest text-mint mb-2">
              <HelpCircle className="h-4 w-4" />
              <span>Startup Knowledge Base · Easy-Read + Voice Audio</span>
              <ReadAloudButton
                text={`Frequently Asked Questions. ${allFaqSpeechText}`}
                label="Listen to All FAQs"
                theme="dark"
              />
            </div>
            <h3 className="display text-3xl sm:text-4xl md:text-5xl text-white">
              Frequently Asked Questions
            </h3>
            <p className="mt-2 text-base sm:text-lg text-white/90 max-w-2xl font-semibold leading-relaxed">
              Clear, plain-English answers about launching and growing your business — click any question to read or click the speaker icon to listen in a natural human voice.
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
                  setOpenIndex(0);
                }}
                className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wide border-2 transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "border-mint bg-mint text-ink"
                    : "border-white/40 bg-white/10 text-white hover:border-sun hover:bg-sun hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion Grid — High-Contrast Cards for Effortless Reading */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {filteredItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            const itemSpeech = `${item.question}. ${item.summary} ${item.answer} Key takeaways: ${item.highlights.join(". ")}`;

            return (
              <div
                key={item.question}
                className={`border-[3px] transition-all ${
                  isOpen
                    ? "border-mint bg-paper text-ink shadow-[6px_6px_0px_#79e784]"
                    : "border-white/30 bg-[#1a2030] text-white hover:border-sun"
                }`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(idx);
                    }
                  }}
                  aria-expanded={isOpen}
                  className={`w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 font-bold cursor-pointer select-none ${
                    isOpen ? "bg-sun text-ink border-b-[3px] border-ink" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 mb-1.5 border border-current/30 bg-black/10">
                      {item.category}
                    </span>
                    <h4
                      className={`display text-lg sm:text-xl leading-snug ${
                        isOpen ? "text-ink" : "text-white"
                      }`}
                    >
                      {item.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1">
                    <ReadAloudButton
                      text={itemSpeech}
                      label={`Read question: ${item.question}`}
                      variant="icon"
                      theme={isOpen ? "light" : "dark"}
                    />
                    <span
                      className={`shrink-0 p-1 rounded transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-ink" : "text-mint"
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" strokeWidth={3} />
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div className="p-5 sm:p-6 bg-paper text-ink space-y-4">
                    {/* Bold 1-Sentence Takeaway */}
                    <div className="border-l-4 border-ink bg-cream px-3.5 py-2.5 text-base sm:text-[17px] font-black text-ink leading-snug">
                      {item.summary}
                    </div>

                    {/* High-Contrast Comfortable Reading Copy */}
                    <p className="text-base sm:text-[17px] leading-[1.75] text-ink font-medium">
                      {item.answer}
                    </p>

                    {/* Scannable Bullet Takeaways */}
                    <ul className="space-y-2 border-t-2 border-dashed border-ink/20 pt-3.5">
                      {item.highlights.map((pt) => (
                        <li
                          key={pt}
                          className="flex items-start gap-2.5 text-sm sm:text-base font-bold text-ink leading-snug"
                        >
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center bg-mint text-ink border border-ink">
                            <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                          </span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Footer Bar with Natural Voice Reader Button */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-ink/15">
                      <span className="text-[11px] uppercase font-black tracking-wider text-muted">
                        Topic: {item.category}
                      </span>
                      <ReadAloudButton
                        text={itemSpeech}
                        label="Read Answer Aloud"
                        theme="light"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Highlights Bar — High-Contrast White & Mint */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t-2 border-white/20 pt-8 text-sm">
          <div className="flex items-center gap-3.5 bg-white/5 border border-white/15 p-4">
            <Rocket className="h-6 w-6 text-mint shrink-0" />
            <div>
              <strong className="block text-white text-base font-black">Launch in Minutes</strong>
              <span className="text-white/90 font-medium">From blank canvas to hosted website &amp; plan</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-white/5 border border-white/15 p-4">
            <Sparkles className="h-6 w-6 text-sun shrink-0" />
            <div>
              <strong className="block text-white text-base font-black">Solomon™ AI + Live Data</strong>
              <span className="text-white/90 font-medium">Grounded with live grant &amp; local market data</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-white/5 border border-white/15 p-4">
            <ShieldCheck className="h-6 w-6 text-mint shrink-0" />
            <div>
              <strong className="block text-white text-base font-black">14-Day Money-Back Guarantee</strong>
              <span className="text-white/90 font-medium">Cancel anytime in 1 click with zero commitments</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
