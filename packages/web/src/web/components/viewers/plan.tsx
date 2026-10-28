import { useState } from "react";
import { Check, ExternalLink, Lightbulb, Loader2, RefreshCw, Rocket, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChooseButton, CopyButton, Level, List, Section, type ViewerProps } from "./common";
import {
  buildThreeProvenIdeas,
  saveLocalIdeaWizardCards,
  type ProvenBusinessIdea,
} from "../../queries/business";
import { orpc } from "../../lib/api";

/* ---------------- 01 Idea Wizard ---------------- */

const INTEREST_CHIPS = [
  "⚡ AI & Automation",
  "☕ Coffee & Artisan Food",
  "🐾 Pets & Dog Care",
  "🏠 Home & Property Care",
  "💪 Fitness & Wellness",
  "🎨 Design & Creative",
  "🛍️ E-Commerce & Crafts",
  "📈 Local Business Marketing",
];

const POSSIBILITY_CHIPS = [
  "🏡 Run from home",
  "🔁 Monthly subscription model",
  "⏱️ Weekend side-hustle",
  "💰 Under $500 startup cost",
  "🤝 Local neighborhood service",
  "🌐 100% online digital delivery",
];

export type IdeaFacetKey =
  | "title"
  | "summary"
  | "whyYou"
  | "targetCustomer"
  | "revenueModel"
  | "firstStep";

const ALL_IDEA_FACETS: IdeaFacetKey[] = [
  "title",
  "summary",
  "whyYou",
  "targetCustomer",
  "revenueModel",
  "firstStep",
];

type IdeaWithApprovals = ProvenBusinessIdea & {
  approvedFacets?: Partial<Record<IdeaFacetKey, boolean>>;
  iterationCount?: number;
};

/** Generates a fresh variation for a specific facet (incorporating optional user tweak text). */
function generateFacetVariation(
  facet: IdeaFacetKey,
  cardIndex: number,
  step: number,
  interests: string,
  possibilities: string,
  customNote?: string
): string {
  const cleanTopic =
    interests
      .split(/[,;&/]+/)[0]
      ?.trim()
      .replace(/\.$/, "") || "Modern Specialist";
  const topicTitle =
    cleanTopic.length > 30
      ? cleanTopic.slice(0, 30).trim()
      : cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  const noteSuffix = customNote?.trim() ? ` — tailored for ${customNote.trim()}` : "";
  const v = (step + cardIndex) % 4;

  switch (facet) {
    case "title": {
      const titlesByCard = [
        [
          `${topicTitle} VIP Membership & Retainer Club`,
          `${topicTitle} Autopilot Monthly Studio`,
          `All-Access ${topicTitle} Subscription Co.`,
          `Premier ${topicTitle} Recurring Partner`,
        ],
        [
          `48-Hour Turnkey ${topicTitle} Express`,
          `${topicTitle} Flat-Rate Launch Box`,
          `Instant ${topicTitle} Productized Studio`,
          `Done-For-You ${topicTitle} Sprint Package`,
        ],
        [
          `Bespoke ${topicTitle} Concierge Collective`,
          `${topicTitle} White-Glove Advisory & Kits`,
          `Signature ${topicTitle} Curated Experience`,
          `Private ${topicTitle} Specialist Guild`,
        ],
      ];
      const pool = titlesByCard[cardIndex % 3]!;
      return customNote?.trim() && customNote.trim().length < 36
        ? `${topicTitle} · ${customNote.trim().replace(/^\w/, (c) => c.toUpperCase())}`
        : pool[v]!;
    }
    case "summary": {
      const summaries = [
        `A streamlined, high-retention business centered on ${interests.toLowerCase()} (${possibilities})${noteSuffix}. Clients subscribe or book online in 60 seconds with zero complicated sales calls.`,
        `A modern, low-overhead ${cleanTopic.toLowerCase()} service designed around ${possibilities.toLowerCase()}${noteSuffix}. Built to start generating cash flow in your first week with repeatable checklists.`,
        `An above-and-beyond ${cleanTopic.toLowerCase()} offering that packages your passion for ${interests.toLowerCase()} into a clear, irresistible offer${noteSuffix}.`,
        `A community-loved ${cleanTopic.toLowerCase()} brand combining effortless online booking with standout personal delivery (${possibilities})${noteSuffix}.`,
      ];
      return summaries[v]!;
    }
    case "whyYou": {
      const reasons = [
        `Turns your genuine enthusiasm for ${interests} into a simple, repeatable system${noteSuffix}—so you get paid for what you already enjoy without heavy overhead.`,
        `Built specifically around "${possibilities}"${noteSuffix}, allowing you to start lean on your own schedule and scale up as word-of-mouth grows.`,
        `Most competitors in ${cleanTopic.toLowerCase()} are slow and confusing; your clear packaging and passion for ${interests} make you the obvious first choice${noteSuffix}.`,
        `Zero gatekeeping or expensive equipment required—leverages your eye for ${cleanTopic.toLowerCase()} to create immediate value for paying customers${noteSuffix}.`,
      ];
      return reasons[v]!;
    }
    case "targetCustomer": {
      const targets = [
        `Busy local households and professionals who value quality ${cleanTopic.toLowerCase()} and gladly pay for reliable, hassle-free delivery${noteSuffix}.`,
        `Small business owners and founders looking for a trusted ${cleanTopic.toLowerCase()} partner without hiring a full-time employee${noteSuffix}.`,
        `High-intent enthusiasts and repeat buyers who want curated ${cleanTopic.toLowerCase()} results delivered fast${noteSuffix}.`,
        `Neighborhood clients and online referrals searching for a friendly, dependable ${cleanTopic.toLowerCase()} specialist${noteSuffix}.`,
      ];
      return targets[v]!;
    }
    case "revenueModel": {
      const models = [
        `$99 Starter Session + $199/mo Flagship Membership + $349/mo VIP Priority Tier (80%+ gross profit margin)${noteSuffix}.`,
        `$149 Flat-Rate Standard Package, $299 Deluxe Bundle, and $59/mo recurring care add-on${noteSuffix}.`,
        `$79 Intro Trial Offer that converts into a $249/mo recurring plan or $450 seasonal package${noteSuffix}.`,
        `3 Simple Tiers: $125 Basic, $275 Most Popular Complete Package, and $495 White-Glove VIP${noteSuffix}.`,
      ];
      return models[v]!;
    }
    case "firstStep": {
      const steps = [
        `Share your free live 1-Click website link with 10 warm contacts and offer a "Founding 5" VIP discount this week${noteSuffix}.`,
        `Post a before/after or quick demo of your ${cleanTopic.toLowerCase()} offer in 3 local groups with a direct link to your online quote calculator${noteSuffix}.`,
        `Send a friendly 2-sentence invite to 15 people you know offering a risk-free starter package in exchange for a launch testimonial${noteSuffix}.`,
        `Turn on your live hosted website today, pick your 3 pricing tiers, and book your very first paying customer within 7 days${noteSuffix}.`,
      ];
      return steps[v]!;
    }
  }
}

export function IdeaViewer({ content, bizId, choose, choosing }: ViewerProps) {
  const qc = useQueryClient();
  const rawIdeas = (content.ideas ?? []) as IdeaWithApprovals[];
  const initialChosen = typeof content.chosen === "number" ? content.chosen : 0;

  const [interests, setInterests] = useState<string>(
    (content.interests as string) || "AI automation, local services, helping small businesses"
  );
  const [possibilities, setPossibilities] = useState<string>(
    (content.possibilities as string) || "Recurring subscription or turnkey package I can run from home"
  );
  const [ideas, setIdeas] = useState<IdeaWithApprovals[]>(() =>
    rawIdeas.length >= 3 && rawIdeas[0]?.summary
      ? rawIdeas
      : buildThreeProvenIdeas(interests, possibilities)
  );
  const [chosen, setChosen] = useState<number>(initialChosen);
  const [isBuilding, setIsBuilding] = useState(false);
  const [justBuilt, setJustBuilt] = useState(false);
  const [cardNotes, setCardNotes] = useState<Record<number, string>>({});

  const persistIdeas = (nextIdeas: IdeaWithApprovals[], nextChosen = chosen) => {
    setIdeas(nextIdeas);
    saveLocalIdeaWizardCards(bizId, nextIdeas, nextChosen, interests, possibilities);
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
  };

  const handleAddInterestChip = (chip: string) => {
    const clean = chip.replace(/^[^\w]+/, "").trim();
    if (interests.toLowerCase().includes(clean.toLowerCase())) return;
    setInterests((prev) => (prev.trim() ? `${prev.trim()}, ${clean}` : clean));
  };

  const handleAddPossibilityChip = (chip: string) => {
    const clean = chip.replace(/^[^\w]+/, "").trim();
    if (possibilities.toLowerCase().includes(clean.toLowerCase())) return;
    setPossibilities((prev) => (prev.trim() ? `${prev.trim()}, ${clean}` : clean));
  };

  const handleBuildThreeCards = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsBuilding(true);
    setJustBuilt(false);
    setTimeout(() => {
      const freshCards = buildThreeProvenIdeas(interests, possibilities);
      // Preserve any facets the user already checked/approved on each card!
      const merged: IdeaWithApprovals[] = freshCards.map((fresh, idx) => {
        const existing = ideas[idx];
        const approved = existing?.approvedFacets ?? {};
        const hasAnyApproved = Object.values(approved).some(Boolean);
        if (!existing || !hasAnyApproved) {
          return { ...fresh, approvedFacets: {}, iterationCount: 1 };
        }
        return {
          ...fresh,
          title: approved.title ? existing.title : fresh.title,
          summary: approved.summary ? existing.summary : fresh.summary,
          whyYou: approved.whyYou ? existing.whyYou : fresh.whyYou,
          targetCustomer: approved.targetCustomer ? existing.targetCustomer : fresh.targetCustomer,
          revenueModel: approved.revenueModel ? existing.revenueModel : fresh.revenueModel,
          firstStep: approved.firstStep ? existing.firstStep : fresh.firstStep,
          approvedFacets: approved,
          iterationCount: (existing.iterationCount ?? 1) + 1,
        };
      });
      persistIdeas(merged, chosen);
      setIsBuilding(false);
      setJustBuilt(true);
      setTimeout(() => setJustBuilt(false), 3000);
    }, 300);
  };

  /** Toggle the checkmark approval for a single facet on a card */
  const toggleFacetApproval = (cardIdx: number, facet: IdeaFacetKey) => {
    const next = ideas.map((card, i) => {
      if (i !== cardIdx) return card;
      const prevApproved = card.approvedFacets ?? {};
      return {
        ...card,
        approvedFacets: {
          ...prevApproved,
          [facet]: !prevApproved[facet],
        },
      };
    });
    persistIdeas(next);
  };

  /** Approve or uncheck all 6 facets on a card in 1 click */
  const toggleAllFacetsOnCard = (cardIdx: number, approveAll: boolean) => {
    const next = ideas.map((card, i) => {
      if (i !== cardIdx) return card;
      const nextMap: Partial<Record<IdeaFacetKey, boolean>> = {};
      if (approveAll) {
        for (const k of ALL_IDEA_FACETS) nextMap[k] = true;
      }
      return {
        ...card,
        approvedFacets: nextMap,
      };
    });
    persistIdeas(next);
  };

  /** Iterate a single facet OR all unchecked facets on a card until it's perfect */
  const handleIterateCard = (cardIdx: number, singleFacet?: IdeaFacetKey) => {
    const customNote = cardNotes[cardIdx]?.trim();
    const next = ideas.map((card, i) => {
      if (i !== cardIdx) return card;
      const approved = card.approvedFacets ?? {};
      const nextStep = (card.iterationCount ?? 1) + 1;

      if (singleFacet) {
        return {
          ...card,
          [singleFacet]: generateFacetVariation(
            singleFacet,
            cardIdx,
            nextStep,
            interests,
            possibilities,
            customNote
          ),
          iterationCount: nextStep,
        };
      }

      // Regenerate ONLY the facets that are NOT checked/approved
      const updated = { ...card, iterationCount: nextStep };
      for (const facet of ALL_IDEA_FACETS) {
        if (!approved[facet]) {
          (updated as any)[facet] = generateFacetVariation(
            facet,
            cardIdx,
            nextStep,
            interests,
            possibilities,
            customNote
          );
        }
      }
      return updated;
    });

    persistIdeas(next);
    if (!singleFacet && customNote) {
      setCardNotes((prev) => ({ ...prev, [cardIdx]: "" }));
    }
  };

  const handleSelectCard = (index: number) => {
    setChosen(index);
    persistIdeas(ideas, index);
    if (choose) choose(index);
  };

  return (
    <div className="space-y-8">
      {/* Welcoming Intro + Interactive Interests & Possibilities Builder */}
      <section className="b3 hard bg-paper overflow-hidden">
        <div className="border-b-[3px] border-ink bg-ink p-5 md:p-6 text-paper">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 bg-sun text-ink px-2.5 py-0.5 text-xs font-black uppercase tracking-wider border border-ink">
              <Lightbulb className="h-3.5 w-3.5 fill-ink" /> Proven Business Idea Generator
            </span>
            <span className="inline-flex items-center gap-1 bg-mint text-ink px-2.5 py-0.5 text-xs font-black uppercase">
              Check ✓ What You Like · Iterate the Rest
            </span>
          </div>
          <h2 className="display text-2xl sm:text-3xl md:text-4xl text-sun leading-tight">
            The time to start a business is now! If you still haven&apos;t decided on something, use our Idea Wizard. We&apos;ll make you a business based on your interests that we know will succeed. You can always start a different one later, but how long have you been at a standstill? Run the wizard and choose the project that excites you. Do it right now. See you in the next step.
          </h2>
          <p className="mt-2.5 text-sm sm:text-base font-bold text-paper/90 max-w-3xl">
            Just enter your interests and a few possibilities below and we will build 3 complete business idea cards you can choose from.
          </p>
        </div>

        <form onSubmit={handleBuildThreeCards} className="p-5 md:p-6 space-y-6 bg-cream/60">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Field 1: Interests */}
            <div className="b3 bg-paper p-4 md:p-5">
              <label htmlFor="wizard-interests-input" className="block text-sm font-black uppercase tracking-wider text-ink">
                1. Enter Your Interests &amp; Passions
              </label>
              <p className="mt-1 text-xs font-semibold text-muted">
                What topics, hobbies, or industries do you enjoy? Type your own or click any quick tag below:
              </p>
              <textarea
                id="wizard-interests-input"
                rows={2}
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Coffee, dogs, fitness, AI tools, design, helping local businesses..."
                className="input mt-3 resize-none text-sm font-bold"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {INTEREST_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAddInterestChip(chip)}
                    className="text-xs font-extrabold bg-cream hover:bg-sun px-2.5 py-1 border-2 border-ink transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: A Few Possibilities */}
            <div className="b3 bg-paper p-4 md:p-5">
              <label htmlFor="wizard-possibilities-input" className="block text-sm font-black uppercase tracking-wider text-ink">
                2. Enter a Few Possibilities (How You Want to Run It)
              </label>
              <p className="mt-1 text-xs font-semibold text-muted">
                Any possibilities in mind? (e.g. work from home, weekend side hustle, recurring subscription, local service)
              </p>
              <textarea
                id="wizard-possibilities-input"
                rows={2}
                value={possibilities}
                onChange={(e) => setPossibilities(e.target.value)}
                placeholder="e.g. Something I can run from home, low startup cost, monthly subscription or local service..."
                className="input mt-3 resize-none text-sm font-bold"
              />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {POSSIBILITY_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleAddPossibilityChip(chip)}
                    className="text-xs font-extrabold bg-cream hover:bg-sun px-2.5 py-1 border-2 border-ink transition-colors cursor-pointer"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink/20 pt-4">
            <p className="text-xs sm:text-sm font-extrabold text-ink">
              {justBuilt ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-mint px-3 py-1 border-2 border-ink">
                  <Check className="h-4 w-4 stroke-[3]" /> Updated your 3 idea cards! Any parts you checked ✓ were kept locked.
                </span>
              ) : (
                "Tip: Check ✓ the parts of any card you like to lock them in, then iterate the rest until the card is perfect!"
              )}
            </p>
            <button
              type="submit"
              disabled={isBuilding}
              className="btn btn-yellow font-black text-sm sm:text-base px-6 py-3 cursor-pointer"
            >
              {isBuilding ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
                  Building Your 3 Business Idea Cards…
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 fill-ink" strokeWidth={2.5} />
                  Build 3 Complete Business Idea Cards
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* 3 Complete Business Idea Cards with Individual Facet Checkmarks & Simple Iteration */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="display text-2xl md:text-3xl">
              Your 3 Complete Business Idea Cards
            </h3>
            <p className="text-sm font-bold text-muted">
              Click the <strong>✓ Checkmark</strong> on each part you love to lock it in, and click <strong>Iterate Unchecked ↻</strong> until the card is 100% perfect for you.
            </p>
          </div>
          <span className="chip bg-sun text-xs font-black">
            Selected Card: #{chosen + 1}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {ideas.map((idea, i) => {
            const isSelected = i === chosen;
            const summaryText = idea.summary || (idea as any).oneLiner || "";
            const firstStepText =
              idea.firstStep ||
              "Launch your free hosted website and invite your first 5 founding customers this week.";
            const scoreNum =
              typeof idea.score === "number" && !Number.isNaN(idea.score)
                ? Math.round(idea.score)
                : 95 - i * 3;
            const approved = idea.approvedFacets ?? {};
            const approvedCount = ALL_IDEA_FACETS.filter((k) => approved[k]).length;
            const allApproved = approvedCount === ALL_IDEA_FACETS.length;

            /** Helper bar rendered on every facet row for 1-click checkmark approval + 1-click single-facet spin */
            const renderFacetControls = (facet: IdeaFacetKey, label: string) => {
              const isChecked = !!approved[facet];
              return (
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-muted">
                    {label}
                  </span>
                  <div className="flex items-center gap-1">
                    {!isChecked && (
                      <button
                        type="button"
                        onClick={() => handleIterateCard(i, facet)}
                        title="Try another variation for just this part"
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-black uppercase bg-paper hover:bg-sun border border-ink cursor-pointer transition-colors"
                      >
                        <RefreshCw className="h-2.5 w-2.5" strokeWidth={3} /> New
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFacetApproval(i, facet)}
                      title={isChecked ? "Approved & locked! Click to unlock" : "Click to approve & lock this part"}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase border border-ink cursor-pointer transition-all ${
                        isChecked
                          ? "bg-mint text-ink shadow-[1px_1px_0px_#000]"
                          : "bg-white hover:bg-mint/40 text-ink/80"
                      }`}
                    >
                      <span
                        className={`grid h-3.5 w-3.5 place-items-center border border-ink ${
                          isChecked ? "bg-ink text-mint" : "bg-cream"
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[4]" />}
                      </span>
                      {isChecked ? "Approved" : "Approve"}
                    </button>
                  </div>
                </div>
              );
            };

            return (
              <article
                key={i}
                className={`card flex flex-col transition-all ${
                  isSelected ? "bg-sun/25 ring-2 ring-ink" : "bg-paper"
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b-[3px] border-ink bg-ink text-paper px-5 py-3">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-mint block">
                      {idea.modelBadge || `Proven Idea Card #${i + 1}`}
                    </span>
                    <span className="display text-lg text-sun">Business Card #{i + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="bg-mint text-ink px-2 py-0.5 text-[11px] font-black uppercase border border-ink">
                        ✓ Active
                      </span>
                    )}
                    <span className="chip bg-sun text-ink font-black">Fit {scoreNum}%</span>
                  </div>
                </div>

                {/* Simple Approval Progress Bar */}
                <div className="flex items-center justify-between gap-2 border-b-2 border-ink bg-cream px-4 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 font-black border border-ink text-[11px] ${
                        allApproved ? "bg-mint text-ink" : "bg-paper text-ink"
                      }`}
                    >
                      ✓ {approvedCount} / {ALL_IDEA_FACETS.length} Approved
                    </span>
                    {allApproved && (
                      <span className="text-[11px] font-black text-emerald-800">
                        Perfect Card!
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAllFacetsOnCard(i, !allApproved)}
                    className="text-[11px] font-black underline hover:text-emerald-800 cursor-pointer"
                  >
                    {allApproved ? "Uncheck All" : "✓ Approve All 6"}
                  </button>
                </div>

                <div className="flex flex-1 flex-col gap-3.5 p-5">
                  {/* Facet 1: Idea Title */}
                  <div
                    className={`b3 p-3 transition-colors ${
                      approved.title ? "bg-mint/20 border-emerald-900" : "bg-paper"
                    }`}
                  >
                    {renderFacetControls("title", "1. Business Concept Name")}
                    <h4 className="display text-xl sm:text-2xl leading-tight">{idea.title}</h4>
                  </div>

                  {/* Facet 2: Pitch / Summary */}
                  <div
                    className={`b3 p-3 transition-colors ${
                      approved.summary ? "bg-mint/20 border-emerald-900" : "bg-paper"
                    }`}
                  >
                    {renderFacetControls("summary", "2. The Pitch")}
                    <p className="font-semibold text-sm leading-relaxed">{summaryText}</p>
                  </div>

                  {/* Facet 3: Why This Works For You */}
                  <div
                    className={`b3 p-3 text-sm font-semibold transition-colors ${
                      approved.whyYou ? "bg-mint/20 border-emerald-900" : "bg-cream"
                    }`}
                  >
                    {renderFacetControls("whyYou", "3. Why This Works For You")}
                    <p>{idea.whyYou}</p>
                  </div>

                  {/* Quick Stats Snapshot */}
                  <dl className="grid grid-cols-2 gap-2.5 text-sm">
                    <div className="b3 bg-paper p-2">
                      <dt className="text-[10px] font-extrabold uppercase text-muted">Market Demand</dt>
                      <dd className="mt-1"><Level v={idea.demand || "High"} /></dd>
                    </div>
                    <div className="b3 bg-paper p-2">
                      <dt className="text-[10px] font-extrabold uppercase text-muted">Startup Cost</dt>
                      <dd className="font-black text-xs text-ink mt-1">{idea.startupCost || "$250 – $1,000"}</dd>
                    </div>
                  </dl>

                  {/* Facet 4: Target Customer */}
                  <div
                    className={`b3 p-3 text-sm transition-colors ${
                      approved.targetCustomer ? "bg-mint/20 border-emerald-900" : "bg-paper"
                    }`}
                  >
                    {renderFacetControls("targetCustomer", "4. Target Customer")}
                    <p className="font-semibold">{idea.targetCustomer}</p>
                  </div>

                  {/* Facet 5: How It Makes Money */}
                  <div
                    className={`b3 p-3 text-sm transition-colors ${
                      approved.revenueModel ? "bg-mint/20 border-emerald-900" : "bg-paper"
                    }`}
                  >
                    {renderFacetControls("revenueModel", "5. How It Makes Money")}
                    <p className="font-semibold">{idea.revenueModel}</p>
                  </div>

                  {/* Facet 6: Day-1 Launch Step */}
                  <div
                    className={`b3 p-3 text-sm transition-colors ${
                      approved.firstStep ? "bg-mint/25 border-emerald-900" : "bg-mint/20"
                    }`}
                  >
                    {renderFacetControls("firstStep", "6. Day-1 Launch Step")}
                    <p className="font-semibold text-xs flex items-start gap-1.5">
                      <Rocket className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{firstStepText}</span>
                    </p>
                  </div>

                  {/* Simple Card Iteration Box: Regenerates ONLY unchecked facets */}
                  <div className="mt-auto pt-3 border-t-2 border-dashed border-ink/25 space-y-3">
                    {allApproved ? (
                      <div className="bg-mint/40 border-2 border-ink p-2.5 text-center text-xs font-black text-ink">
                        ✓ All 6 facets approved! Uncheck any box above if you want to iterate it further.
                      </div>
                    ) : (
                      <div className="bg-cream border-2 border-ink p-3 space-y-2">
                        <label className="block text-[11px] font-black uppercase text-ink">
                          Iterate {ALL_IDEA_FACETS.length - approvedCount} Unchecked Part{ALL_IDEA_FACETS.length - approvedCount === 1 ? "" : "s"} (Checked ✓ parts stay locked):
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={cardNotes[i] || ""}
                            onChange={(e) =>
                              setCardNotes((prev) => ({ ...prev, [i]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleIterateCard(i);
                              }
                            }}
                            placeholder="Optional tweak (e.g. lower price, 100% online)..."
                            className="input !py-1.5 !px-2.5 text-xs font-bold flex-1 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleIterateCard(i)}
                            className="btn btn-sm btn-yellow !px-3 !py-1.5 text-xs font-black shrink-0 cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.5} /> Iterate
                          </button>
                        </div>
                      </div>
                    )}

                    <ChooseButton
                      selected={isSelected}
                      disabled={choosing}
                      onClick={() => handleSelectCard(i)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <p className="text-xs font-bold uppercase text-muted">
        Selecting any of the 3 business idea cards above automatically feeds your chosen model into your Business Name, Plan, Brand, Logo, and Live Website.
      </p>
    </div>
  );
}

/* ---------------- 03 Name Generator ---------------- */

type Name = { name: string; tagline: string; why: string; domain: string };

export function NameViewer({ content, choose, choosing }: ViewerProps) {
  const names = (content.names ?? []) as Name[];
  const chosen = typeof content.chosen === "number" ? content.chosen : 0;
  return (
    <div className="space-y-6">
      <p className="font-bold">
        Selecting a name renames your business and its website address. The domain and trademark links open searches. Nothing has been checked or registered for you.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {names.map((n, i) => {
          const rawDomain = n.domain || (n as any).domains?.[0] || `${n.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`;
          const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
          return (
            <article key={i} className={`card p-5 ${i === chosen ? "bg-cream" : "bg-paper"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="display text-3xl">{n.name}</h3>
                  <p className="mt-1 font-bold">{n.tagline}</p>
                </div>
                <ChooseButton selected={i === chosen} disabled={choosing} onClick={choose ? () => choose(i) : undefined} />
              </div>
              <p className="mt-3 text-sm font-semibold">{n.why || (n as any).rationale}</p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <a
                  className="ulink inline-flex items-center gap-1 font-extrabold"
                  href={`https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Search {domain} <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
                </a>
                <a
                  className="ulink inline-flex items-center gap-1 font-extrabold"
                  href={`https://tmsearch.uspto.gov/search/search-results?query=${encodeURIComponent(n.name)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Trademark search <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 02 Business Plan ---------------- */

export function PlanViewer({ content: c, bizName }: ViewerProps) {
  const cur = /^[A-Z]{3}$/.test(c.currency ?? "") ? c.currency : "USD";
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(undefined, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${Math.round(n)}`;
    }
  };
  const projection = (c.projection ?? []) as { month: number; revenue: number; costs: number }[];
  const costs = (c.startupCosts ?? []) as { item: string; cost: number }[];
  const totalCost = costs.reduce((s, x) => s + (x.cost || 0), 0);
  const totRev = projection.reduce((s, x) => s + x.revenue, 0);
  const totCost = projection.reduce((s, x) => s + x.costs, 0);
  const max = Math.max(1, ...projection.flatMap((p) => [p.revenue, p.costs]));
  let running = 0;
  const breakEven = projection.find((p) => (running += p.revenue - p.costs) >= 0 && p.revenue > p.costs)?.month;

  const asText = [
    `${bizName} — Business plan`,
    `\nExecutive summary\n${c.executiveSummary}`,
    `\nProblem\n${c.problem}`,
    `\nSolution\n${c.solution}`,
    `\nTarget market\n${c.targetMarket}`,
    `\nCompetitive advantage\n${c.advantage}`,
    `\nCompetitors\n${(c.competitors ?? []).map((x: { name: string; note: string }) => `- ${x.name}: ${x.note}`).join("\n")}`,
    `\nPricing\n${(c.pricing ?? []).map((x: { item: string; price: string; note: string }) => `- ${x.item}: ${x.price} (${x.note})`).join("\n")}`,
    `\nMarketing\n${(c.marketing ?? []).map((x: string) => `- ${x}`).join("\n")}`,
    `\nOperations\n${(c.operations ?? []).map((x: string) => `- ${x}`).join("\n")}`,
    `\nStartup costs\n${costs.map((x) => `- ${x.item}: ${fmt(x.cost)}`).join("\n")}\nTotal: ${fmt(totalCost)}`,
    `\n12-month projection (estimate)\n${projection.map((p) => `Month ${p.month}: revenue ${fmt(p.revenue)}, costs ${fmt(p.costs)}`).join("\n")}`,
    `\nMilestones\n${(c.milestones ?? []).map((x: { when: string; goal: string }) => `- ${x.when}: ${x.goal}`).join("\n")}`,
    `\nRisks\n${(c.risks ?? []).map((x: { risk: string; mitigation: string }) => `- ${x.risk} → ${x.mitigation}`).join("\n")}`,
  ].join("\n");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <CopyButton text={asText} label="Copy whole plan" />
        <button type="button" className="btn btn-sm btn-quiet" onClick={() => window.print()}>Print / save PDF</button>
      </div>
      <Section title="Executive summary">
        <p className="text-lg font-semibold leading-relaxed">{c.executiveSummary}</p>
      </Section>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Problem"><p className="font-semibold">{c.problem}</p></Section>
        <Section title="Solution"><p className="font-semibold">{c.solution}</p></Section>
        <Section title="Target market"><p className="font-semibold">{c.targetMarket}</p></Section>
        <Section title="Your edge"><p className="font-semibold">{c.advantage || c.uniqueValue}</p></Section>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Competitors">
          <ul className="space-y-3">
            {(c.competitors ?? []).map((x: { name: string; note: string }, i: number) => (
              <li key={i}><b className="font-extrabold">{x.name}</b><p className="text-sm font-semibold">{x.note}</p></li>
            ))}
          </ul>
        </Section>
        <Section title="Pricing">
          <ul className="space-y-3">
            {(c.pricing ?? []).map((x: { item: string; price: string; note: string }, i: number) => (
              <li key={i} className="flex justify-between gap-4">
                <span><b className="font-extrabold">{x.item}</b><span className="block text-sm font-semibold">{x.note}</span></span>
                <span className="display shrink-0 text-lg">{x.price}</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Marketing"><List items={c.marketing} /></Section>
        <Section title="Operations"><List items={c.operations} /></Section>
      </div>

      <Section title="Startup costs" kicker={`Total ${fmt(totalCost)}`}>
        <table className="w-full text-left text-sm">
          <tbody>
            {costs.map((x, i) => (
              <tr key={i} className="border-b-[3px] border-ink last:border-0">
                <td className="py-2 font-semibold">{x.item}</td>
                <td className="py-2 text-right font-extrabold">{fmt(x.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="12-month projection" kicker="Estimate">
        <div className="mb-4 flex flex-wrap gap-3 text-sm">
          <span className="chip bg-sun">Revenue {fmt(totRev)}</span>
          <span className="chip bg-paper">Costs {fmt(totCost)}</span>
          <span className={`chip ${totRev - totCost >= 0 ? "bg-mint" : "bg-ink text-sun"}`}>Net {fmt(totRev - totCost)}</span>
          {breakEven && <span className="chip bg-cream">First profitable month: {breakEven}</span>}
        </div>
        <figure className="flex h-44 items-end gap-1.5 border-b-[3px] border-ink" aria-label="Monthly revenue (yellow) and costs (white) chart">
          {projection.map((p) => (
            <div key={p.month} className="flex h-full flex-1 items-end gap-0.5" title={`Month ${p.month}: ${fmt(p.revenue)} / ${fmt(p.costs)}`}>
              <div className="flex-1 border-[3px] border-b-0 border-ink bg-sun" style={{ height: `${(p.revenue / max) * 100}%` }} />
              <div className="flex-1 border-[3px] border-b-0 border-ink bg-paper" style={{ height: `${(p.costs / max) * 100}%` }} />
            </div>
          ))}
        </figure>
        <div className="mt-1 flex gap-1.5 text-center text-[10px] font-extrabold">
          {projection.map((p) => <span key={p.month} className="flex-1">M{p.month}</span>)}
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead>
              <tr className="border-b-[3px] border-ink">
                <th className="py-2 text-left font-extrabold uppercase">Month</th>
                {projection.map((p) => <th key={p.month} className="px-1 py-2 font-extrabold">{p.month}</th>)}
              </tr>
            </thead>
            <tbody className="font-semibold">
              <tr className="border-b-[3px] border-ink"><td className="py-2 text-left font-extrabold">Revenue</td>{projection.map((p) => <td key={p.month} className="px-1">{fmt(p.revenue)}</td>)}</tr>
              <tr className="border-b-[3px] border-ink"><td className="py-2 text-left font-extrabold">Costs</td>{projection.map((p) => <td key={p.month} className="px-1">{fmt(p.costs)}</td>)}</tr>
              <tr><td className="py-2 text-left font-extrabold">Net</td>{projection.map((p) => <td key={p.month} className="px-1 font-extrabold">{fmt(p.revenue - p.costs)}</td>)}</tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs font-bold uppercase text-muted">AI estimate from your answers. Not financial advice.</p>
      </Section>

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Milestones">
          <ol className="space-y-3">
            {(c.milestones ?? []).map((x: { when?: string; month?: string; goal: string }, i: number) => (
              <li key={i} className="flex gap-3"><span className="chip shrink-0 bg-sun">{x.when || x.month}</span><span className="font-semibold">{x.goal}</span></li>
            ))}
          </ol>
        </Section>
        <Section title="Risks">
          <ul className="space-y-3">
            {(c.risks ?? []).map((x: { risk: string; mitigation: string }, i: number) => (
              <li key={i}><b className="font-extrabold">{x.risk}</b><p className="text-sm font-semibold">→ {x.mitigation}</p></li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

/* ---------------- 04 Brand Generator ---------------- */

type Persona = { name: string; snapshot: string; pains: string[]; goals: string[]; whereTheyHangOut: string };

export function BrandViewer({ content: c }: ViewerProps) {
  return (
    <div className="space-y-6">
      <div className="card bg-ink p-6 text-sun md:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Mission</p>
        <p className="display mt-3 text-3xl leading-tight md:text-5xl">{c.mission}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Brand story"><p className="font-semibold leading-relaxed">{c.story || c.positioning}</p></Section>
        <Section title="Values">
          <div className="flex flex-wrap gap-2">
            {(c.values ?? []).map((v: string | { name: string }) => {
              const label = typeof v === "string" ? v : v.name;
              return <span key={label} className="chip bg-sun">{label}</span>;
            })}
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase">Visual mood</p>
          <p className="mt-1 font-semibold">{c.visualMood || c.uvp}</p>
        </Section>
      </div>
      <Section title="Voice">
        <div className="flex flex-wrap gap-2">
          {(c.voice?.traits ?? c.voiceAttributes ?? []).map((v: string) => <span key={v} className="chip bg-cream">{v}</span>)}
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div><p className="mb-2 font-extrabold uppercase">Do</p><List items={c.voice?.do ?? c.doList} /></div>
          <div><p className="mb-2 font-extrabold uppercase">Don't</p><List items={c.voice?.dont ?? c.dontList} /></div>
        </div>
      </Section>
      <div className="grid gap-6 md:grid-cols-2">
        {((c.personas ?? []) as Persona[]).map((p) => (
          <Section key={p.name} title={p.name} kicker="Persona">
            <p className="font-semibold">{p.snapshot}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><p className="mb-2 text-sm font-extrabold uppercase">Pains</p><List items={p.pains} /></div>
              <div><p className="mb-2 text-sm font-extrabold uppercase">Goals</p><List items={p.goals} /></div>
            </div>
            <p className="mt-4 text-sm font-semibold"><b className="font-extrabold uppercase">Find them · </b>{p.whereTheyHangOut}</p>
          </Section>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Taglines">
          <ul className="space-y-3">
            {(c.taglines ?? []).map((t: string) => (
              <li key={t} className="flex items-center justify-between gap-3">
                <span className="display text-lg">{t}</span>
                <CopyButton text={t} label="" />
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Key messages"><List items={c.keyMessages} /></Section>
      </div>
    </div>
  );
}
