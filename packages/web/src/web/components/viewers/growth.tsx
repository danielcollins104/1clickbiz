import { useState } from "react";
import { CopyButton, Section, type ViewerProps } from "./common";

/* ------------------------------------------------------------------ */
/* Cold Outreach & Email Pitch Engine                                 */
/* ------------------------------------------------------------------ */

interface OutreachSequence {
  step: number;
  day: string;
  type: string;
  subjectLines: string[];
  body: string;
  callToAction: string;
  proTip: string;
}

export function ColdOutreachViewer({ content: c }: ViewerProps) {
  const icp = c.icp as { targetTitle?: string; industry?: string; painPoint?: string; triggerEvent?: string } | undefined;
  const sequence = (c.sequence ?? []) as OutreachSequence[];
  const linkedin = (c.linkedinMessages ?? []) as { type: string; message: string }[];
  const objections = (c.objections ?? []) as { objection: string; rebuttal: string }[];
  const [activeStep, setActiveStep] = useState(0);

  const current = sequence[activeStep];

  return (
    <div className="space-y-8">
      {/* Target ICP Header */}
      {icp && (
        <Section title="Target Prospect Profile (ICP)" kicker="Audience Definition">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="b3 bg-cream p-4 border-2 border-ink">
              <span className="text-[10px] font-black uppercase text-muted block">Target Role</span>
              <p className="display text-base mt-1 text-ink">{icp.targetTitle || "Decision Maker"}</p>
            </div>
            <div className="b3 bg-cream p-4 border-2 border-ink">
              <span className="text-[10px] font-black uppercase text-muted block">Vertical</span>
              <p className="display text-base mt-1 text-ink">{icp.industry || "General B2B"}</p>
            </div>
            <div className="b3 bg-cream p-4 border-2 border-ink">
              <span className="text-[10px] font-black uppercase text-muted block">Core Pain Point</span>
              <p className="text-xs font-bold mt-1 text-ink leading-tight">{icp.painPoint || "Operational overhead"}</p>
            </div>
            <div className="b3 bg-cream p-4 border-2 border-ink">
              <span className="text-[10px] font-black uppercase text-muted block">Outreach Trigger</span>
              <p className="text-xs font-bold mt-1 text-ink leading-tight">{icp.triggerEvent || "Active hiring / expansion"}</p>
            </div>
          </div>
        </Section>
      )}

      {/* 5-Step Email Sequence */}
      {sequence.length > 0 && (
        <Section title="5-Step Cold Email Pitch Sequence" kicker="Sequence Builder">
          <div className="flex flex-wrap gap-2 border-b-[3px] border-ink pb-4">
            {sequence.map((seq, i) => (
              <button
                key={seq.step}
                type="button"
                onClick={() => setActiveStep(i)}
                className={`chip cursor-pointer text-xs font-black uppercase ${
                  activeStep === i ? "bg-ink text-sun shadow-[2px_2px_0px_#79e784]" : "bg-paper hover:bg-cream"
                }`}
              >
                Step {seq.step} · {seq.day}
              </button>
            ))}
          </div>

          {current && (
            <div className="mt-6 b3 hard bg-paper border-[3px] border-ink p-6 shadow-[4px_4px_0_#000]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3 mb-4">
                <div>
                  <span className="chip bg-mint text-ink text-[10px] font-black uppercase">
                    {current.type}
                  </span>
                  <p className="display text-xl mt-1">Step {current.step} — Send on {current.day}</p>
                </div>
                <CopyButton text={`Subject: ${current.subjectLines?.[0] || ""}\n\n${current.body}\n\n${current.callToAction}`} />
              </div>

              {/* Subject Lines */}
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-muted block mb-1.5">
                  High-Open Subject Line Options (A/B Test):
                </span>
                <div className="space-y-1.5">
                  {(current.subjectLines ?? []).map((subj, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 bg-cream p-2 b3 border border-ink text-xs font-bold">
                      <span>{subj}</span>
                      <CopyButton text={subj} label="Copy Subject" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-muted block mb-1.5">
                  Email Body:
                </span>
                <div className="bg-cream p-4 b3 border-2 border-ink text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                  {current.body}
                </div>
              </div>

              {/* CTA & Pro Tip */}
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="bg-sun/30 border border-ink p-3 b3">
                  <span className="text-[10px] font-black uppercase text-ink block mb-0.5">Recommended Soft Call-To-Action:</span>
                  <p className="text-xs font-extrabold text-ink">{current.callToAction}</p>
                </div>
                <div className="bg-mint/30 border border-ink p-3 b3">
                  <span className="text-[10px] font-black uppercase text-emerald-950 block mb-0.5">Outreach Strategy Tip:</span>
                  <p className="text-xs font-bold text-emerald-950">{current.proTip}</p>
                </div>
              </div>
            </div>
          )}
        </Section>
      )}

      {/* LinkedIn Messages */}
      {linkedin.length > 0 && (
        <Section title="LinkedIn Multi-Touch Messages" kicker="Social Selling">
          <div className="grid gap-4 sm:grid-cols-2">
            {linkedin.map((msg, i) => (
              <div key={i} className="b3 border-2 border-ink bg-cream p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="chip bg-sun text-ink text-[10px] font-black uppercase">{msg.type}</span>
                    <CopyButton text={msg.message} />
                  </div>
                  <p className="text-xs font-semibold leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Objection Handling */}
      {objections.length > 0 && (
        <Section title="Objection Handling Cheatsheet" kicker="Conversion Defense">
          <div className="space-y-3">
            {objections.map((obj, i) => (
              <div key={i} className="b3 border-2 border-ink bg-paper p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-rose-100 text-rose-900 border border-rose-300 px-1.5 py-0.5 text-[10px] font-black uppercase">
                    Prospect: "{obj.objection}"
                  </span>
                </div>
                <p className="text-xs font-bold text-ink mt-2 bg-cream p-2.5 b3 border border-ink/40">
                  <span className="text-emerald-800 font-black">Your Rebuttal:</span> {obj.rebuttal}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Competitor & Market Gap Radar                                      */
/* ------------------------------------------------------------------ */

interface Competitor {
  name: string;
  positioning: string;
  pricingEstimate: string;
  strengths: string[];
  weaknesses: string[];
  customerComplaints: string;
}

export function CompetitorRadarViewer({ content: c }: ViewerProps) {
  const landscape = c.marketLandscape as string | undefined;
  const competitors = (c.competitors ?? []) as Competitor[];
  const gaps = (c.unservedGaps ?? []) as string[];
  const moat = c.defensiveMoat as { unfairAdvantage?: string; switchCost?: string; actionablePlaybook?: string[] } | undefined;

  return (
    <div className="space-y-8">
      {landscape && (
        <Section title="Market Diagnosis" kicker="Terrain Analysis">
          <div className="b3 hard bg-sun p-5 border-[3px] border-ink">
            <p className="display text-xl text-ink leading-snug">{landscape}</p>
          </div>
        </Section>
      )}

      {/* Competitor Teardown Grid */}
      {competitors.length > 0 && (
        <Section title="Top Competitor Teardowns" kicker="Vulnerability Analysis">
          <div className="grid gap-6 md:grid-cols-3">
            {competitors.map((comp, i) => (
              <div key={i} className="b3 border-2 border-ink bg-paper p-5 shadow-[3px_3px_0_#000] flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b-2 border-ink pb-2 mb-3">
                    <div>
                      <p className="display text-lg leading-tight">{comp.name}</p>
                      <p className="text-xs font-bold text-muted">{comp.positioning}</p>
                    </div>
                    <span className="chip bg-mint text-ink text-[10px] font-black shrink-0">
                      {comp.pricingEstimate}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 block mb-1">What They Do Well:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted font-bold">
                        {comp.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase text-rose-800 block mb-1">Their Flaws &amp; Blindspots:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-rose-950 font-bold">
                        {comp.weaknesses.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-50 border border-rose-300 p-2.5 b3">
                      <span className="text-[10px] font-black uppercase text-rose-900 block mb-0.5">Common Buyer Complaint:</span>
                      <p className="text-xs font-bold text-rose-950 italic">"{comp.customerComplaints}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Unserved Gaps */}
      {gaps.length > 0 && (
        <Section title="Neglected Market Opportunities" kicker="White Space">
          <div className="grid gap-4 sm:grid-cols-2">
            {gaps.map((gap, i) => (
              <div key={i} className="b3 border-2 border-ink bg-cream p-4 flex items-start gap-3">
                <span className="grid h-6 w-6 place-items-center bg-mint text-ink b3 text-xs font-black shrink-0">
                  #{i + 1}
                </span>
                <p className="text-sm font-bold text-ink leading-snug">{gap}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Defensive Moat */}
      {moat && (
        <Section title="Your Defensive Moat &amp; Unfair Advantage" kicker="Strategy Playbook">
          <div className="b3 hard bg-ink p-6 text-sun border-[3px] border-ink space-y-4">
            <div>
              <span className="chip bg-mint text-ink text-[10px] font-black uppercase">Core Unfair Advantage</span>
              <p className="display text-2xl text-sun mt-1">{moat.unfairAdvantage}</p>
            </div>
            <div>
              <span className="chip bg-sun text-ink text-[10px] font-black uppercase">Customer Switching Cost</span>
              <p className="text-sm font-bold text-cream mt-1">{moat.switchCost}</p>
            </div>

            {moat.actionablePlaybook && moat.actionablePlaybook.length > 0 && (
              <div className="pt-3 border-t border-sun/20">
                <span className="text-xs font-black uppercase tracking-wider text-mint block mb-2">Tactical Execution Playbook:</span>
                <div className="space-y-2">
                  {moat.actionablePlaybook.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-cream">
                      <span className="text-mint font-black">✓</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* SEO Authority & Keyword Strategy                                   */
/* ------------------------------------------------------------------ */

interface Keyword {
  keyword: string;
  intent: string;
  difficulty: string;
  opportunityNote: string;
}

interface Article {
  title: string;
  targetKeyword: string;
  outline: string[];
  estimatedTrafficValue: string;
}

export function SeoEngineViewer({ content: c }: ViewerProps) {
  const strategy = c.searchStrategy as string | undefined;
  const keywords = (c.commercialKeywords ?? []) as Keyword[];
  const meta = c.metaTags as { homeTitle?: string; homeMetaDescription?: string; ogTitle?: string; ogDescription?: string } | undefined;
  const articles = (c.pillarArticles ?? []) as Article[];

  return (
    <div className="space-y-8">
      {strategy && (
        <Section title="Search Strategy Overview" kicker="Organic Growth Roadmap">
          <div className="b3 hard bg-cream p-5 border-[3px] border-ink">
            <p className="display text-xl text-ink leading-snug">{strategy}</p>
          </div>
        </Section>
      )}

      {/* Meta Tags Preview */}
      {meta && (
        <Section title="Search Engine Snippet Preview (Google &amp; AI)" kicker="SERP Mockup">
          <div className="b3 hard bg-paper p-5 border-[3px] border-ink space-y-3">
            <div className="bg-white p-4 b3 border border-ink/40 max-w-xl">
              <span className="text-xs text-muted block">https://yourbusiness.com</span>
              <p className="text-blue-700 hover:underline text-lg font-bold cursor-pointer mt-0.5 leading-snug">
                {meta.homeTitle || "Your Business Title"}
              </p>
              <p className="text-xs text-neutral-600 mt-1 font-medium leading-relaxed">
                {meta.homeMetaDescription || "Your business meta description snippet."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <CopyButton text={meta.homeTitle || ""} label="Copy Title Tag" />
              <CopyButton text={meta.homeMetaDescription || ""} label="Copy Meta Description" />
            </div>
          </div>
        </Section>
      )}

      {/* Commercial Keyword Matrix */}
      {keywords.length > 0 && (
        <Section title="High-Intent Commercial Keywords" kicker="Keyword Shortlist">
          <div className="overflow-x-auto b3 border-2 border-ink bg-paper">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-ink bg-ink text-sun uppercase font-black">
                  <th className="p-3">Target Keyword</th>
                  <th className="p-3">Intent</th>
                  <th className="p-3">Ranking Difficulty</th>
                  <th className="p-3">Conversion Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-ink/20 font-bold last:border-0 hover:bg-cream">
                    <td className="p-3 font-black text-ink">{kw.keyword}</td>
                    <td className="p-3">
                      <span className="chip bg-mint text-ink text-[10px] font-black uppercase">{kw.intent}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`chip text-[10px] font-black uppercase ${
                          kw.difficulty === "Low"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                            : "bg-amber-100 text-amber-900 border-amber-400"
                        }`}
                      >
                        {kw.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-muted">{kw.opportunityNote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Pillar Article Blueprints */}
      {articles.length > 0 && (
        <Section title="Organic Pillar Content Blueprints" kicker="Authority Articles">
          <div className="grid gap-6 md:grid-cols-3">
            {articles.map((art, i) => (
              <div key={i} className="b3 border-2 border-ink bg-cream p-5 shadow-[3px_3px_0_#000] flex flex-col justify-between">
                <div>
                  <span className="chip bg-sun text-ink text-[10px] font-black uppercase mb-2 block w-fit">
                    Est. Value: {art.estimatedTrafficValue}
                  </span>
                  <p className="display text-base text-ink mb-1">{art.title}</p>
                  <p className="text-[11px] font-bold text-muted mb-3">Target: "{art.targetKeyword}"</p>

                  <div className="space-y-1.5 border-t border-ink/20 pt-3">
                    <span className="text-[10px] font-black uppercase text-ink block">Section Outline:</span>
                    <ul className="list-disc pl-4 space-y-1 text-xs font-semibold text-ink/80">
                      {art.outline.map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
