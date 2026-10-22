import {
  Bot,
  FileText,
  Globe,
  HandCoins,
  Lightbulb,
  ListChecks,
  Megaphone,
  MousePointerClick,
  Palette,
  PenTool,
  Rocket,
  Search,
  Send,
  Share2,
  Sparkles,
  Target,
  Type,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Bot,
  FileText,
  Globe,
  HandCoins,
  Lightbulb,
  ListChecks,
  Megaphone,
  MousePointerClick,
  Palette,
  PenTool,
  Rocket,
  Search,
  Send,
  Share2,
  Sparkles,
  Target,
  Type,
  Users,
};

export function ProductIcon({ name, className, strokeWidth = 2.5 }: { name: string; className?: string; strokeWidth?: number }) {
  const I = ICONS[name] ?? MousePointerClick;
  return <I className={className} strokeWidth={strokeWidth} />;
}

const TONES = {
  yellow: { bg: "bg-sun", fg: "text-ink", pattern: "dots", sticker: "bg-ink text-sun" },
  black: { bg: "bg-ink", fg: "text-sun", pattern: "none", sticker: "bg-sun text-ink" },
  white: { bg: "bg-paper", fg: "text-ink", pattern: "stripes", sticker: "bg-ink text-sun" },
  green: { bg: "bg-mint", fg: "text-ink", pattern: "dots", sticker: "bg-ink text-mint" },
} as const;

export function ProductArt({
  tone,
  icon,
  num,
  label,
  size = "lg",
  className,
}: {
  tone: keyof typeof TONES;
  icon: string;
  num: string;
  label?: string;
  size?: "sm" | "card" | "md" | "lg";
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div className={cn("relative overflow-hidden b3", t.bg, t.fg, className)}>
      {t.pattern === "dots" && <div className="dots absolute -right-6 -top-6 h-1/2 w-1/2 opacity-80" />}
      {t.pattern === "stripes" && <div className="stripes absolute bottom-0 left-0 h-1/3 w-full opacity-90" />}
      {tone === "black" && (
        <div className="absolute -bottom-[18%] -right-[18%] aspect-square w-[70%] rounded-full border-[3px] border-sun" />
      )}
      <span
        className={cn(
          "display absolute left-[6%] top-[5%]",
          size === "sm" ? "text-lg" : size === "card" ? "text-2xl" : size === "md" ? "text-3xl" : "text-6xl md:text-7xl",
        )}
      >
        {num}
      </span>
      <div className="absolute inset-0 grid place-items-center">
        <div
          className={cn(
            "grid place-items-center b3 hard",
            tone === "black" ? "bg-sun text-ink" : "bg-paper text-ink",
            size === "sm" ? "h-12 w-12" : size === "card" ? "mt-6 h-16 w-16" : size === "md" ? "h-24 w-24" : "h-40 w-40 md:h-52 md:w-52",
          )}
          style={tone === "black" ? { boxShadow: "6px 6px 0 #3b74ff", borderColor: "#3b74ff" } : undefined}
        >
          <ProductIcon
            name={icon}
            className={size === "sm" ? "h-6 w-6" : size === "card" ? "h-8 w-8" : size === "md" ? "h-12 w-12" : "h-20 w-20 md:h-28 md:w-28"}
          />
        </div>
      </div>
      {label && size !== "sm" && size !== "card" && (
        <span className={cn("absolute bottom-[5%] right-[5%] px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider", t.sticker)}>
          {label}
        </span>
      )}
    </div>
  );
}
