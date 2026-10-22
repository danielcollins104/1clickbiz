import { ExternalLink } from "lucide-react";
import { ChooseButton, CopyButton, Level, List, Section, type ViewerProps } from "./common";

/* ---------------- 01 Idea Wizard ---------------- */

type Idea = {
  title: string;
  summary: string;
  whyYou: string;
  targetCustomer: string;
  revenueModel: string;
  demand: string;
  competition: string;
  startupCost: string;
  timeToFirstSale: string;
  score: number;
};

export function IdeaViewer({ content, choose, choosing }: ViewerProps) {
  const ideas = (content.ideas ?? []) as Idea[];
  const chosen = typeof content.chosen === "number" ? content.chosen : 0;
  return (
    <div className="space-y-6">
      <p className="font-bold">
        Three directions ranked by fit. The one you select feeds every other tool. Changing it later means rebuilding the rest.
      </p>
      <div className="grid gap-6 lg:grid-cols-3">
        {ideas.map((idea, i) => (
          <article key={i} className={`card flex flex-col ${i === chosen ? "bg-cream" : "bg-paper"}`}>
            <div className="flex items-center justify-between border-b-[3px] border-ink px-5 py-3">
              <span className="display text-lg">Idea {i + 1}</span>
              <span className="chip bg-ink text-sun">Fit {Math.round(idea.score)}</span>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-5">
              <h3 className="display text-2xl leading-tight">{idea.title}</h3>
              <p className="font-semibold">{idea.summary}</p>
              <p className="text-sm font-semibold"><b className="font-extrabold uppercase">Why you · </b>{idea.whyYou}</p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="font-extrabold uppercase">Demand</dt><dd className="mt-1"><Level v={idea.demand} /></dd></div>
                <div><dt className="font-extrabold uppercase">Competition</dt><dd className="mt-1"><Level v={idea.competition} /></dd></div>
                <div><dt className="font-extrabold uppercase">Startup cost</dt><dd className="font-semibold">{idea.startupCost}</dd></div>
                <div><dt className="font-extrabold uppercase">First sale</dt><dd className="font-semibold">{idea.timeToFirstSale}</dd></div>
                <div className="col-span-2"><dt className="font-extrabold uppercase">Customer</dt><dd className="font-semibold">{idea.targetCustomer}</dd></div>
                <div className="col-span-2"><dt className="font-extrabold uppercase">Makes money by</dt><dd className="font-semibold">{idea.revenueModel}</dd></div>
              </dl>
              <div className="mt-auto pt-2">
                <ChooseButton selected={i === chosen} disabled={choosing} onClick={choose ? () => choose(i) : undefined} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="text-xs font-bold uppercase text-muted">Demand and competition are AI estimates, not market research. Sense-check them.</p>
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
          const domain = n.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
          return (
            <article key={i} className={`card p-5 ${i === chosen ? "bg-cream" : "bg-paper"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="display text-3xl">{n.name}</h3>
                  <p className="mt-1 font-bold">{n.tagline}</p>
                </div>
                <ChooseButton selected={i === chosen} disabled={choosing} onClick={choose ? () => choose(i) : undefined} />
              </div>
              <p className="mt-3 text-sm font-semibold">{n.why}</p>
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
        <Section title="Your edge"><p className="font-semibold">{c.advantage}</p></Section>
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
            {(c.milestones ?? []).map((x: { when: string; goal: string }, i: number) => (
              <li key={i} className="flex gap-3"><span className="chip shrink-0 bg-sun">{x.when}</span><span className="font-semibold">{x.goal}</span></li>
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
        <Section title="Brand story"><p className="font-semibold leading-relaxed">{c.story}</p></Section>
        <Section title="Values">
          <div className="flex flex-wrap gap-2">
            {(c.values ?? []).map((v: string) => <span key={v} className="chip bg-sun">{v}</span>)}
          </div>
          <p className="mt-5 text-xs font-extrabold uppercase">Visual mood</p>
          <p className="mt-1 font-semibold">{c.visualMood}</p>
        </Section>
      </div>
      <Section title="Voice">
        <div className="flex flex-wrap gap-2">
          {(c.voice?.traits ?? []).map((v: string) => <span key={v} className="chip bg-cream">{v}</span>)}
        </div>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div><p className="mb-2 font-extrabold uppercase">Do</p><List items={c.voice?.do} /></div>
          <div><p className="mb-2 font-extrabold uppercase">Don't</p><List items={c.voice?.dont} /></div>
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
