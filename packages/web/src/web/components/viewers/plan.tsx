import { useState } from "react";
import { Check, ExternalLink, Lightbulb, Loader2, Rocket, Sparkles } from "lucide-react";
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

export function IdeaViewer({ content, bizId, choose, choosing }: ViewerProps) {
  const qc = useQueryClient();
  const rawIdeas = (content.ideas ?? []) as ProvenBusinessIdea[];
  const initialChosen = typeof content.chosen === "number" ? content.chosen : 0;

  const [interests, setInterests] = useState<string>(
    (content.interests as string) || "AI automation, local services, helping small businesses"
  );
  const [possibilities, setPossibilities] = useState<string>(
    (content.possibilities as string) || "Recurring subscription or turnkey package I can run from home"
  );
  const [ideas, setIdeas] = useState<ProvenBusinessIdea[]>(() =>
    rawIdeas.length >= 3 && rawIdeas[0]?.summary
      ? rawIdeas
      : buildThreeProvenIdeas(interests, possibilities)
  );
  const [chosen, setChosen] = useState<number>(initialChosen);
  const [isBuilding, setIsBuilding] = useState(false);
  const [justBuilt, setJustBuilt] = useState(false);

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
      const generated = buildThreeProvenIdeas(interests, possibilities);
      setIdeas(generated);
      setChosen(0);
      saveLocalIdeaWizardCards(bizId, generated, 0, interests, possibilities);
      qc.invalidateQueries({ queryKey: orpc.businesses.key() });
      setIsBuilding(false);
      setJustBuilt(true);
      setTimeout(() => setJustBuilt(false), 3000);
    }, 350);
  };

  const handleSelectCard = (index: number) => {
    setChosen(index);
    saveLocalIdeaWizardCards(bizId, ideas, index, interests, possibilities);
    if (choose) choose(index);
    qc.invalidateQueries({ queryKey: orpc.businesses.key() });
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
              3 Complete Business Cards
            </span>
          </div>
          <h2 className="display text-2xl sm:text-3xl md:text-4xl text-sun leading-tight">
            Don't know what kind of business you want to start? No problem! Let us generate proven business ideas that we know can be successful!
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
                  <Check className="h-4 w-4 stroke-[3]" /> Built 3 complete business idea cards below! Click "Choose this idea" on your favorite.
                </span>
              ) : (
                "Click the button to build 3 complete, proven business idea cards tailored to your inputs:"
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

      {/* 3 Complete Business Idea Cards */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="display text-2xl md:text-3xl">
              Your 3 Complete Business Idea Cards
            </h3>
            <p className="text-sm font-bold text-muted">
              Compare demand, startup cost, and how each business makes money—then click <strong>"Choose this idea"</strong> on the card you want to launch.
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
            const scoreNum = typeof idea.score === "number" && !Number.isNaN(idea.score) ? Math.round(idea.score) : 95 - i * 3;
            return (
              <article
                key={i}
                className={`card flex flex-col transition-all ${
                  isSelected ? "bg-sun/25 ring-2 ring-ink" : "bg-paper"
                }`}
              >
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

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <h4 className="display text-2xl leading-tight">{idea.title}</h4>
                  <p className="font-semibold text-sm leading-relaxed">{summaryText}</p>

                  <div className="b3 bg-cream p-3 text-sm font-semibold">
                    <b className="font-extrabold uppercase block text-xs text-muted mb-1">Why This Works For You</b>
                    {idea.whyYou}
                  </div>

                  <dl className="grid grid-cols-2 gap-3 text-sm border-t-2 border-ink/15 pt-3">
                    <div>
                      <dt className="text-xs font-extrabold uppercase text-muted">Market Demand</dt>
                      <dd className="mt-1"><Level v={idea.demand || "High"} /></dd>
                    </div>
                    <div>
                      <dt className="text-xs font-extrabold uppercase text-muted">Competition</dt>
                      <dd className="mt-1"><Level v={idea.competition || "Low"} /></dd>
                    </div>
                    <div className="b3 bg-paper p-2.5">
                      <dt className="text-[11px] font-extrabold uppercase text-muted">Startup Cost</dt>
                      <dd className="font-black text-ink mt-0.5">{idea.startupCost || "$250 – $1,000"}</dd>
                    </div>
                    <div className="b3 bg-paper p-2.5">
                      <dt className="text-[11px] font-extrabold uppercase text-muted">Time to First Sale</dt>
                      <dd className="font-black text-ink mt-0.5">{idea.timeToFirstSale || "5 – 10 days"}</dd>
                    </div>
                    <div className="col-span-2 b3 bg-paper p-3">
                      <dt className="text-xs font-extrabold uppercase text-muted">Target Customer</dt>
                      <dd className="font-semibold mt-1">{idea.targetCustomer}</dd>
                    </div>
                    <div className="col-span-2 b3 bg-paper p-3">
                      <dt className="text-xs font-extrabold uppercase text-muted">How It Makes Money</dt>
                      <dd className="font-semibold mt-1">{idea.revenueModel}</dd>
                    </div>
                    {idea.firstStep && (
                      <div className="col-span-2 b3 bg-mint/35 p-3">
                        <dt className="text-xs font-extrabold uppercase text-ink flex items-center gap-1">
                          <Rocket className="h-3.5 w-3.5" /> Day-1 Launch Step
                        </dt>
                        <dd className="font-semibold text-xs mt-1">{idea.firstStep}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-auto pt-3">
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
