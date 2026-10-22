import { useState } from "react";
import { Check, Copy, Download, ExternalLink } from "lucide-react";
import type { Img } from "../../lib/tools";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type C = Record<string, any>;

export interface ViewerProps {
  content: C;
  bizId: number;
  bizSlug: string;
  bizName: string;
  /** Picks one option (idea-wizard, name-generator, logo-generation). */
  choose?: (index: number) => void;
  choosing?: boolean;
  /** Status of every other tool, for cross-links / auto-ticks. */
  statuses: Record<string, string>;
}

export const pick = <T,>(arr: T[] | undefined, i: unknown): T | undefined =>
  arr?.[typeof i === "number" && i >= 0 && i < arr.length ? i : 0];

export function Section({ title, kicker, children, className = "" }: { title: string; kicker?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card bg-paper ${className}`}>
      <header className="flex items-baseline justify-between gap-3 border-b-[3px] border-ink px-5 py-3">
        <h3 className="display text-xl">{title}</h3>
        {kicker && <span className="text-xs font-extrabold uppercase tracking-widest">{kicker}</span>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={`btn btn-sm btn-quiet ${className}`}
      aria-label={label || "Copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
    >
      {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" strokeWidth={3} />}
      {done ? "Copied" : label}
    </button>
  );
}

/** Downloads a (cross-origin, signed) image. Falls back to opening it if the fetch is blocked. */
export async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

export function DownloadButton({ img, filename, label = "PNG" }: { img: Img; filename: string; label?: string }) {
  if (!img?.url) return null;
  return (
    <button type="button" className="btn btn-sm btn-quiet" onClick={() => downloadImage(img.url!, filename)}>
      <Download className="h-4 w-4" strokeWidth={3} /> {label}
    </button>
  );
}

export function GenImage({ img, alt, className = "" }: { img: Img; alt: string; className?: string }) {
  if (!img?.url) {
    return <div className={`b3 grid place-items-center bg-cream text-sm font-extrabold uppercase ${className}`}>Image unavailable</div>;
  }
  return <img src={img.url} alt={alt} loading="lazy" className={`b3 bg-paper object-cover ${className}`} />;
}

export function Level({ v }: { v: string }) {
  const cls = v === "High" ? "bg-ink text-sun" : v === "Medium" ? "bg-sun" : "bg-paper";
  return <span className={`chip ${cls}`}>{v}</span>;
}

export function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener" className="ulink inline-flex items-center gap-1 font-extrabold">
      {children} <ExternalLink className="h-3.5 w-3.5" strokeWidth={3} />
    </a>
  );
}

export function List({ items }: { items: string[] | undefined }) {
  if (!items?.length) return <p className="text-sm font-semibold text-muted">None.</p>;
  return (
    <ul className="space-y-2">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 font-semibold">
          <span className="mt-2 h-2 w-2 shrink-0 bg-ink" />
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}

/** Small "Selected" / "Use this" control for option pickers. */
export function ChooseButton({ selected, onClick, disabled }: { selected: boolean; onClick?: () => void; disabled?: boolean }) {
  if (selected) {
    return (
      <span className="chip bg-mint">
        <Check className="h-3.5 w-3.5" strokeWidth={4} /> Selected
      </span>
    );
  }
  return (
    <button type="button" className="btn btn-sm" disabled={disabled || !onClick} onClick={onClick}>
      Use this
    </button>
  );
}
