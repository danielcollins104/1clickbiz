import { useState } from "react";
import type { Img } from "../../lib/tools";
import { CopyButton, DownloadButton, GenImage, Section, type ViewerProps } from "./common";

/* ---------------- 08 Ad Generator ---------------- */

type Ad = {
  platform: string;
  angle: string;
  persona: string;
  headlines: string[];
  primaryText: string;
  description: string;
  cta: string;
};

function Limit({ text, max }: { text: string; max: number }) {
  const over = text.length > max;
  return <span className={`text-[10px] font-extrabold ${over ? "bg-ink px-1 text-sun" : "text-muted"}`}>{text.length}/{max}</span>;
}

export function AdViewer({ content: c, bizName }: ViewerProps) {
  const ads = (c.ads ?? []) as Ad[];
  const images = (c.images ?? []) as { format: string; image: Img }[];
  const platforms = [...new Set(ads.map((a) => a.platform))];
  const [tab, setTab] = useState<string>("All");
  const shown = tab === "All" ? ads : ads.filter((a) => a.platform === tab);
  const file = bizName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Audience">
          <dl className="space-y-3 font-semibold">
            <div><dt className="text-xs font-extrabold uppercase">Where</dt><dd>{c.audience?.locations}</dd></div>
            <div><dt className="text-xs font-extrabold uppercase">Ages</dt><dd>{c.audience?.ages}</dd></div>
            <div>
              <dt className="text-xs font-extrabold uppercase">Interests</dt>
              <dd className="mt-1 flex flex-wrap gap-2">{(c.audience?.interests ?? []).map((x: string) => <span key={x} className="chip bg-cream">{x}</span>)}</dd>
            </div>
          </dl>
        </Section>
        <Section title="Starter budget">
          <p className="display text-4xl">{c.budget?.daily}<span className="ml-1 text-base font-extrabold uppercase">/ day</span></p>
          <p className="mt-2 font-semibold">{c.budget?.note}</p>
          <p className="mt-4 text-xs font-bold uppercase text-muted">Suggestion only. You set the actual spend in each ad platform.</p>
        </Section>
      </div>

      {images.length > 0 && (
        <Section title="Ad visuals" kicker="PNG">
          <div className="flex flex-wrap items-start gap-6">
            {images.map((x, i) => (
              <figure key={i} className={x.format.includes("9:16") ? "w-48" : "w-72"}>
                <GenImage img={x.image} alt={`${x.format} ad visual`} className={`w-full ${x.format.includes("9:16") ? "aspect-[9/16]" : "aspect-square"}`} />
                <figcaption className="mt-2 flex items-center justify-between gap-2 text-sm font-extrabold uppercase">
                  {x.format}
                  <DownloadButton img={x.image} filename={`${file}-ad-${i + 1}.png`} />
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold">Visuals have no text so you can add your headline in the ad platform.</p>
        </Section>
      )}

      <div className="flex flex-wrap gap-2" role="tablist">
        {["All", ...platforms].map((p) => (
          <button key={p} type="button" role="tab" aria-selected={tab === p} className={`btn btn-sm ${tab === p ? "" : "btn-quiet"}`} onClick={() => setTab(p)}>
            {p}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {shown.map((a, i) => {
          const google = a.platform === "Google Search";
          const all = `Headlines:\n${a.headlines.join("\n")}\n\nPrimary text:\n${a.primaryText}\n\nDescription:\n${a.description}\n\nCTA: ${a.cta}`;
          return (
            <article key={i} className="card bg-paper">
              <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink px-5 py-3">
                <span className="chip bg-sun">{a.platform}</span>
                <CopyButton text={all} label="Copy ad" />
              </div>
              <div className="space-y-4 p-5">
                <p className="text-sm font-semibold"><b className="font-extrabold uppercase">Angle · </b>{a.angle} <span className="text-muted">for {a.persona}</span></p>
                <div>
                  <p className="text-xs font-extrabold uppercase">Headlines</p>
                  <ul className="mt-1 space-y-1">
                    {a.headlines.map((h) => (
                      <li key={h} className="flex items-center justify-between gap-3 font-extrabold">
                        {h} {google && <Limit text={h} max={30} />}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase">Primary text</p>
                  <p className="mt-1 whitespace-pre-line font-semibold">{a.primaryText}</p>
                </div>
                <div>
                  <p className="flex items-center justify-between text-xs font-extrabold uppercase">Description {google && <Limit text={a.description} max={90} />}</p>
                  <p className="mt-1 font-semibold">{a.description}</p>
                </div>
                <span className="chip bg-ink text-sun">{a.cta}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- 09 Social Generator ---------------- */

type Post = { day: number; platform: string; format: string; hook: string; caption: string; hashtags: string[] };

export function SocialViewer({ content: c, bizName }: ViewerProps) {
  const posts = ((c.posts ?? []) as Post[]).slice().sort((a, b) => a.day - b.day);
  const images = (c.images ?? []) as { image: Img; concept: string }[];
  const file = bizName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const csv = [
    ["Day", "Platform", "Format", "Hook", "Caption", "Hashtags"],
    ...posts.map((p) => [p.day, p.platform, p.format, p.hook, p.caption, p.hashtags.join(" ")]),
  ]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <a className="btn btn-sm btn-quiet" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download={`${file}-social-calendar.csv`}>
          Download calendar CSV
        </a>
        <span className="chip bg-cream">Copy and post yourself. Nothing is published automatically.</span>
      </div>

      {images.length > 0 && (
        <Section title="Post visuals" kicker="4:5 PNG">
          <div className="grid gap-5 sm:grid-cols-3">
            {images.map((x, i) => (
              <figure key={i}>
                <GenImage img={x.image} alt={x.concept} className="aspect-[4/5] w-full" />
                <figcaption className="mt-2 flex items-start justify-between gap-2">
                  <span className="line-clamp-2 text-xs font-semibold">{x.concept}</span>
                  <DownloadButton img={x.image} filename={`${file}-post-${i + 1}.png`} />
                </figcaption>
              </figure>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {posts.map((p) => {
          const text = `${p.caption}\n\n${p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`;
          return (
            <article key={p.day} className="card flex flex-col bg-paper">
              <div className="flex items-center justify-between border-b-[3px] border-ink px-4 py-2">
                <span className="display text-lg">Day {p.day}</span>
                <span className="flex gap-1.5">
                  <span className="chip bg-sun">{p.platform}</span>
                  <span className="chip bg-paper">{p.format}</span>
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="font-extrabold">{p.hook}</p>
                <p className="whitespace-pre-line text-sm font-semibold">{p.caption}</p>
                <p className="text-sm font-bold text-muted">{p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}</p>
                <div className="mt-auto pt-1"><CopyButton text={text} label="Copy caption" /></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
