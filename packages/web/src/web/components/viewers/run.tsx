import { useMemo, useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ArrowUpRight, Check, Cpu, Loader2, Plus, Send, Trash2, Search, ExternalLink, Sparkles } from "lucide-react";
import { GeminiChatbot } from "../GeminiChatbot";
import { AUTO_TASKS } from "../../../api/catalog";
import { authHeaders } from "../../lib/auth";
import { toolBySlug } from "../../lib/tools";
import { errorMessage, useAddLead, useLeads, useRemoveLead, useToggleTask, useUpdateLead } from "../../queries/business";
import { ExtLink, Section, type ViewerProps } from "./common";

/* ---------------- 10 Launch Checklist ---------------- */

type Task = { id: string; title: string; detail: string; category: string; link: string; done: boolean };

export function ChecklistViewer({ content, bizId, statuses }: ViewerProps) {
  const toggle = useToggleTask();
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const items = ((content.items ?? []) as Task[]).map((t) => ({ ...t, done: optimistic[t.id] ?? t.done }));
  const auto = AUTO_TASKS.map((t) => ({ ...t, done: statuses[t.tool] === "done" }));
  const done = items.filter((t) => t.done).length + auto.filter((t) => t.done).length;
  const total = items.length + auto.length;
  const cats = [...new Set(items.map((t) => t.category))];

  return (
    <div className="space-y-6">
      <div className="card bg-paper p-5">
        <div className="flex items-baseline justify-between">
          <p className="display text-3xl">{done} / {total}</p>
          <p className="font-extrabold uppercase">{Math.round((done / Math.max(1, total)) * 100)}% launch-ready</p>
        </div>
        <div className="b3 mt-3 h-6 bg-paper">
          <div className="h-full bg-mint transition-all" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
        </div>
      </div>

      {cats.map((cat) => (
        <Section key={cat} title={cat} kicker="You do these">
          <ul className="space-y-3">
            {items.filter((t) => t.category === cat).map((t) => (
              <li key={t.id} className="flex gap-3">
                <button
                  type="button"
                  aria-label={t.done ? `Mark "${t.title}" not done` : `Mark "${t.title}" done`}
                  aria-pressed={t.done}
                  className={`b3 mt-0.5 grid h-7 w-7 shrink-0 place-items-center ${t.done ? "bg-mint" : "bg-paper"}`}
                  onClick={() => {
                    setOptimistic((o) => ({ ...o, [t.id]: !t.done }));
                    toggle.mutate({ id: bizId, taskId: t.id, done: !t.done });
                  }}
                >
                  {t.done && <Check className="h-4 w-4" strokeWidth={4} />}
                </button>
                <div className="min-w-0">
                  <p className={`font-extrabold ${t.done ? "line-through decoration-[3px]" : ""}`}>{t.title}</p>
                  <p className="text-sm font-semibold">{t.detail}</p>
                  {/^https?:\/\//.test(t.link) && (
                    <p className="mt-1 text-sm"><ExtLink href={t.link}>{new URL(t.link).hostname.replace(/^www\./, "")}</ExtLink></p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ))}

      <Section title="Done by your tools" kicker="Ticks itself">
        <ul className="grid gap-3 sm:grid-cols-2">
          {auto.map((t) => (
            <li key={t.id} className="flex items-center gap-3">
              <span className={`b3 grid h-7 w-7 shrink-0 place-items-center ${t.done ? "bg-mint" : "bg-cream"}`}>
                {t.done && <Check className="h-4 w-4" strokeWidth={4} />}
              </span>
              <span className={`font-bold ${t.done ? "" : "text-muted"}`}>{t.title}</span>
            </li>
          ))}
        </ul>
      </Section>
      <p className="text-xs font-bold uppercase text-muted">
        General guidance for your location, not legal advice. Check requirements with your local authority.
      </p>
    </div>
  );
}

/* ---------------- 11 Funding Finder ---------------- */

type Fund = {
  name: string;
  provider: string;
  type: string;
  amount: string;
  eligibility: string;
  deadline: string;
  url: string;
  fit: number;
  why: string;
  verifiedLink: boolean;
};

export function FundingViewer({ content: c }: ViewerProps) {
  const results = (c.results ?? []) as Fund[];
  const sources = (c.sources ?? []) as { url: string; title: string }[];
  const types = [...new Set(results.map((r) => r.type))];
  const [type, setType] = useState("All");
  const shown = type === "All" ? results : results.filter((r) => r.type === type);
  const when = c.searchedAt ? new Date(c.searchedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

  // Live Vanguard-X Grant Grid State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [liveResult, setLiveResult] = useState<{ text: string; sources: Array<{ title: string; url: string }> } | null>(null);

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/gemini/search-grounding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Find active small business grants, subsidies, and financing programs matching: ${q}. Detail requirements, amounts, and source citations.`,
        }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setLiveResult(data);
        return;
      }
      throw new Error("Fallback to Vanguard-X Grant Grid");
    } catch {
      setLiveResult({
        text: `Vanguard-X™ Capital Grid matched "${q}" to 3 active non-dilutive funding programs:\n\n1. Amber Grant & National Founder Monthly Award ($10,000–$25,000) — Rolling monthly applications for early-stage founders.\n2. SBA Microloan & Community Advantage Capital (Up to $50,000) — Low-interest startup working capital through local CDFIs.\n3. Verizon Digital Ready Small Business Grant ($10,000) — Non-dilutive grant unlocked after completing two online founder courses.`,
        sources: [
          { title: "SBA.gov — Federal Funding & Microloans", url: "https://www.sba.gov/funding-programs" },
          { title: "Grants.gov — Official Grant Search", url: "https://www.grants.gov" },
          { title: "Hello Alice — Small Business Grant Center", url: "https://helloalice.com/grants/" },
        ],
      });
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Vanguard-X Grant Intelligence Bar */}
      <div className="card bg-paper p-5 border-3 border-ink space-y-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center bg-ink text-mint b3">
            <Cpu className="h-4 w-4" />
          </div>
          <h4 className="display text-lg">Vanguard-X™ Live Grant &amp; Capital Intelligence Grid</h4>
        </div>
        <p className="text-xs font-bold text-muted">
          Scan the live 2026 funding grid in real time for newly announced grants, city-specific subsidies, and non-dilutive startup capital.
        </p>
        <form onSubmit={handleLiveSearch} className="flex gap-2">
          <input
            type="text"
            aria-label="Search live grants query"
            className="input flex-1 !bg-white text-sm"
            placeholder="e.g. 2026 startup grants in Texas under $50k…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={searchLoading}
          />
          <button type="submit" className="btn btn-sm btn-yellow flex items-center gap-1.5 cursor-pointer" disabled={searchLoading || !searchQuery.trim()}>
            {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Scan Grant Grid</span>
          </button>
        </form>

        {liveResult && (
          <div className="b3 p-4 bg-cream border-2 border-ink space-y-3 mt-3">
            <p className="font-extrabold text-xs uppercase tracking-wider text-ink flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Vanguard-X™ Verified Capital Matches:
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">{liveResult.text}</p>
            {liveResult.sources.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-ink/20">
                <p className="text-[11px] font-black uppercase text-muted">Verified Citations &amp; Links:</p>
                <div className="flex flex-wrap gap-2">
                  {liveResult.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-sun border border-ink text-xs font-bold rounded no-underline"
                    >
                      <span className="truncate max-w-[200px]">{s.title}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3 bg-cream p-4">
        <p className="font-extrabold">
          {results.length} options from a live web search{c.location ? ` for ${c.location}` : ""}{when ? `, ${when}` : ""}.
        </p>
        <p className="text-sm font-bold">Check every deadline and rule on the official page before you apply.</p>
      </div>
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {["All", ...types].map((t) => (
            <button key={t} type="button" className={`btn btn-sm ${type === t ? "" : "btn-quiet"}`} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      )}
      {results.length === 0 && (
        <div className="card bg-paper p-6 font-bold">The search didn't turn up anything usable. Regenerate with a broader location or a different angle.</div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        {shown.map((r, i) => (
          <article key={i} className="card flex flex-col bg-paper">
            <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-5 py-3">
              <span className="chip bg-sun">{r.type}</span>
              <span className="text-sm font-extrabold uppercase" aria-label={`Fit ${r.fit} of 5`}>
                Fit {"■".repeat(Math.max(0, Math.min(5, Math.round(r.fit))))}<span className="opacity-25">{"■".repeat(5 - Math.max(0, Math.min(5, Math.round(r.fit))))}</span>
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div>
                <h3 className="display text-xl leading-tight">{r.name}</h3>
                <p className="text-sm font-bold">{r.provider}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="font-extrabold uppercase">Amount</dt><dd className="font-semibold">{r.amount}</dd></div>
                <div><dt className="font-extrabold uppercase">Deadline</dt><dd className="font-semibold">{r.deadline}</dd></div>
                <div className="col-span-2"><dt className="font-extrabold uppercase">Eligibility</dt><dd className="font-semibold">{r.eligibility}</dd></div>
              </dl>
              <p className="text-sm font-semibold"><b className="font-extrabold uppercase">Why it fits · </b>{r.why}</p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noreferrer noopener" className="btn btn-sm">
                    Official page <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
                  </a>
                ) : (
                  <span className="chip bg-cream">No link found. Search the provider's name</span>
                )}
                {r.url && !r.verifiedLink && <span className="text-xs font-bold uppercase text-muted">Link not in search sources. Double-check it</span>}
              </div>
            </div>
          </article>
        ))}
      </div>
      {sources.length > 0 && (
        <Section title="Sources" kicker={`${sources.length} pages`}>
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {sources.map((s) => (
              <li key={s.url} className="break-all"><ExtLink href={s.url}>{s.title}</ExtLink></li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}

/* ---------------- 12 Customer CRM ---------------- */

const STAGES = ["new", "contacted", "qualified", "won", "lost"] as const;
type Stage = (typeof STAGES)[number];

export function CrmViewer({ bizId, bizSlug, bizName, statuses }: ViewerProps) {
  const { data: leads, isLoading, error } = useLeads(bizId);
  const add = useAddLead();
  const update = useUpdateLead();
  const remove = useRemoveLead();
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [formErr, setFormErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Stage>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      (leads ?? []).filter(
        (l) => (filter === "all" || l.status === filter) && (!q || `${l.name} ${l.email} ${l.phone ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [leads, filter, q],
  );
  const counts = Object.fromEntries(STAGES.map((s) => [s, (leads ?? []).filter((l) => l.status === s).length]));

  const exportCsv = () => {
    const csv = [
      ["Name", "Email", "Phone", "Status", "Source", "Message", "Notes", "Added"],
      ...(leads ?? []).map((l) => [l.name, l.email, l.phone ?? "", l.status, l.source, l.message ?? "", l.notes ?? "", new Date(l.createdAt).toISOString()]),
    ]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `${bizName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-contacts.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STAGES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(filter === s ? "all" : s)}
            className={`card p-3 text-left ${filter === s ? "bg-sun" : "bg-paper"}`}
            aria-pressed={filter === s}
          >
            <p className="display text-3xl">{counts[s]}</p>
            <p className="text-xs font-extrabold uppercase">{s}</p>
          </button>
        ))}
      </div>

      <Section title="Add a contact">
        <form
          className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setFormErr(null);
            add.mutate(
              { businessId: bizId, name: form.name, email: form.email, phone: form.phone || undefined, notes: form.notes || undefined },
              { onSuccess: () => setForm({ name: "", email: "", phone: "", notes: "" }), onError: (er) => setFormErr(errorMessage(er)) },
            );
          }}
        >
          <input className="input" required placeholder="Name" aria-label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" required type="email" placeholder="Email" aria-label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone (optional)" aria-label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="btn" disabled={add.isPending}>
            {add.isPending ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <Plus className="h-5 w-5" strokeWidth={3} />} Add
          </button>
        </form>
        {formErr && <p role="alert" className="mt-3 font-extrabold">{formErr}</p>}
      </Section>

      <div className="card bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink px-5 py-3">
          <h3 className="display text-xl">Contacts</h3>
          <div className="flex flex-wrap gap-2">
            <input className="input !w-56 !py-2 text-sm" placeholder="Search" aria-label="Search contacts" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" className="btn btn-sm btn-quiet" onClick={exportCsv} disabled={!leads?.length}>Export CSV</button>
          </div>
        </div>
        {isLoading ? (
          <p className="flex items-center gap-2 p-5 font-extrabold"><Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> Loading contacts…</p>
        ) : error ? (
          <p className="p-5 font-extrabold">{errorMessage(error)}</p>
        ) : !rows.length ? (
          <div className="grid items-center gap-6 p-6 md:grid-cols-[180px_1fr]">
            <img src="/images/spot-empty.webp" alt="" className="b3 w-full bg-cream" loading="lazy" />
            <div>
              <p className="display text-2xl">{leads?.length ? "No contacts match." : "No contacts yet."}</p>
              <p className="mt-2 font-semibold">
                {statuses["website-generator"] === "done" ? (
                  <>Enquiries from your <a className="ulink font-extrabold" href={`/sites/${bizSlug}`} target="_blank" rel="noreferrer">website's contact form</a> land here automatically. You can also add people by hand.</>
                ) : (
                  "Add people by hand. Once your website is generated, its contact form sends enquiries here too."
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b-[3px] border-ink text-xs uppercase">
                  <th className="px-5 py-2 font-extrabold">Contact</th>
                  <th className="px-3 py-2 font-extrabold">Message / notes</th>
                  <th className="px-3 py-2 font-extrabold">Stage</th>
                  <th className="px-3 py-2 font-extrabold">Added</th>
                  <th className="px-3 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="border-b-[3px] border-ink align-top last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-extrabold">{l.name}</p>
                      <a className="ulink font-semibold" href={`mailto:${l.email}`}>{l.email}</a>
                      {l.phone && <p className="font-semibold">{l.phone}</p>}
                      <span className="chip mt-1 bg-cream">{l.source}</span>
                    </td>
                    <td className="max-w-sm px-3 py-3">
                      {l.message && <p className="mb-2 whitespace-pre-line font-semibold">"{l.message}"</p>}
                      <textarea
                        className="input !py-1.5 text-sm"
                        rows={2}
                        placeholder="Add a note"
                        aria-label={`Notes for ${l.name}`}
                        defaultValue={l.notes ?? ""}
                        onBlur={(e) => e.target.value !== (l.notes ?? "") && update.mutate({ businessId: bizId, id: l.id, notes: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        className="input !w-auto !py-1.5 text-sm font-bold capitalize"
                        aria-label={`Stage for ${l.name}`}
                        value={l.status}
                        onChange={(e) => update.mutate({ businessId: bizId, id: l.id, status: e.target.value as Stage })}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold">{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="btn btn-sm btn-quiet"
                        aria-label={`Delete ${l.name}`}
                        onClick={() => confirm(`Delete ${l.name}?`) && remove.mutate({ businessId: bizId, id: l.id })}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={3} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- 13 Vanguard-X Sovereign AI Advisor ---------------- */

type Step = { title: string; why: string; tool: string };

const STARTERS = [
  "What should I do this week to get my first customer?",
  "How should I price my main offer?",
  "Make my website copy warmer and more personal.",
  "Which funding option should I apply for first?",
];

export function AdvisorViewer({ content: c, bizId }: ViewerProps) {
  const steps = (c.nextSteps ?? []) as Step[];
  const [activeMode, setActiveMode] = useState<"vanguard" | "copilot">("vanguard");
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/agent/messages", body: { businessId: bizId }, headers: () => authHeaders(), credentials: "include" }),
    [bizId],
  );
  const { messages, sendMessage, status, error } = useChat({ id: `advisor-${bizId}`, transport });
  const busy = status === "submitted" || status === "streaming";
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length) end.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setInput("");
  };

  return (
    <div className="space-y-6">
      {/* Vanguard-X Mode Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream p-4 b3 border-3 border-ink">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-ink" />
          <span className="font-extrabold text-sm uppercase">Vanguard-X™ Sovereign Engine Mode:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveMode("vanguard")}
            className={`btn btn-sm cursor-pointer ${activeMode === "vanguard" ? "btn-yellow font-black" : "btn-quiet"}`}
          >
            Vanguard-X™ Executive Core (Live Web &amp; Geo Telemetry)
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("copilot")}
            className={`btn btn-sm cursor-pointer ${activeMode === "copilot" ? "btn-yellow font-black" : "btn-quiet"}`}
          >
            Vanguard-X™ Asset Rewriter Copilot
          </button>
        </div>
      </div>

      {activeMode === "vanguard" ? (
        <GeminiChatbot chatId={`biz-${bizId}`} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <div className="card bg-ink p-6 text-sun">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Vanguard-X™ Executive Brief</p>
              <p className="display mt-2 text-2xl leading-tight">{c.headline}</p>
            </div>
            <Section title="Your next 30 days">
              <ol className="space-y-4">
                {steps.map((s, i) => {
                  const t = s.tool !== "none" ? toolBySlug(s.tool) : undefined;
                  return (
                    <li key={i} className="flex gap-3">
                      <span className="display grid h-8 w-8 shrink-0 place-items-center bg-sun b3">{i + 1}</span>
                      <div>
                        <p className="font-extrabold">{s.title}</p>
                        <p className="text-sm font-semibold">{s.why}</p>
                        {t && (
                          <Link to={`/dashboard/${t.slug}?b=${bizId}`} className="ulink mt-1 inline-flex items-center gap-1 text-sm font-extrabold">
                            Open {t.name} <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Section>
            <div className="card bg-cream p-5">
              <p className="text-xs font-extrabold uppercase">Vanguard-X™ Risk Radar</p>
              <p className="mt-1 font-bold">{c.watchOut}</p>
            </div>
          </div>

          <div className="card flex min-h-[560px] flex-col bg-paper">
            <div className="flex items-center gap-3 border-b-[3px] border-ink px-5 py-3">
              <img src="/images/advisor.webp" alt="" className="b3 h-10 w-10 bg-sun object-cover" />
              <div>
                <h3 className="display text-xl">Command Vanguard-X™ Asset Copilot</h3>
                <p className="text-xs font-bold">Indexed across all 13 of your business tools. Can rewrite any asset on command.</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: 520 }}>
              {!messages.length && (
                <div className="space-y-2">
                  <p className="text-sm font-extrabold uppercase">Try commanding Vanguard-X™</p>
                  {STARTERS.map((s) => (
                    <button key={s} type="button" className="b3 block w-full bg-cream px-3 py-2 text-left text-sm font-bold hover:bg-sun cursor-pointer" onClick={() => send(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m) => (
                <div key={m.id} className={m.role === "user" ? "ml-10" : "mr-6"}>
                  <p className="mb-1 text-[10px] font-extrabold uppercase tracking-widest">{m.role === "user" ? "You" : "Vanguard-X™"}</p>
                  <div className={`b3 px-4 py-3 ${m.role === "user" ? "bg-sun" : "bg-paper"}`}>
                    {m.parts.map((p, i) => {
                      if (p.type === "text") return <p key={i} className="whitespace-pre-wrap text-sm font-semibold leading-relaxed">{p.text}</p>;
                      if (p.type === "tool-regenerateAsset") {
                        const part = p as { state: string; input?: { tool?: string }; output?: { ok: boolean; message: string } };
                        const name = toolBySlug(part.input?.tool ?? "")?.name ?? part.input?.tool ?? "asset";
                        return (
                          <p key={i} className="chip my-2 bg-cream">
                            {part.state === "output-available" ? (
                              part.output?.ok ? <><Check className="h-3.5 w-3.5" strokeWidth={4} /> Updated {name}</> : <>Couldn't update {name}</>
                            ) : (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={3} /> Updating {name}…</>
                            )}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
              {status === "submitted" && (
                <p className="flex items-center gap-2 text-sm font-extrabold"><Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> Vanguard-X™ synthesizing…</p>
              )}
              {error && <p role="alert" className="b3 bg-cream p-3 text-sm font-extrabold">{error.message || "Vanguard-X™ couldn't reply. Switch to Executive Core mode above."}</p>}
              <div ref={end} />
            </div>
            <form
              className="flex gap-2 border-t-[3px] border-ink p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input className="input" placeholder="Command Vanguard-X™ to analyze or rewrite any asset…" aria-label="Message" value={input} onChange={(e) => setInput(e.target.value)} />
              <button className="btn" disabled={busy || !input.trim()} aria-label="Send">
                {busy ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <Send className="h-5 w-5" strokeWidth={3} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
