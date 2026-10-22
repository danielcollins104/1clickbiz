import { useState, useEffect } from "react";
import { TrendingUp, ShieldCheck, Zap } from "lucide-react";

const RECENT_LAUNCHES = [
  { name: "Kinship Hearth Bread Co.", location: "Denver, CO", time: "3m ago", tool: "1-Click Launch" },
  { name: "Apex RevOps & Systems", location: "San Francisco, CA", time: "7m ago", tool: "Business Plan" },
  { name: "TerraCycle Living", location: "Portland, OR", time: "12m ago", tool: "Phase 1 Bundle" },
  { name: "PulseFit Conditioning", location: "Miami, FL", time: "18m ago", tool: "Website + CRM" },
  { name: "Lumen & Key Digital Studio", location: "Austin, TX", time: "24m ago", tool: "Vector Logo" },
  { name: "Haven Home Maintenance", location: "Charlotte, NC", time: "31m ago", tool: "1-Click Launch" },
];

export function SocialProofTicker({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % RECENT_LAUNCHES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const current = RECENT_LAUNCHES[index]!;

  return (
    <div
      className={`border-b-[3px] border-ink bg-sun py-2.5 px-4 flex flex-wrap items-center justify-between gap-3 text-ink text-xs font-black uppercase tracking-wider ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
        </span>
        <span className="text-ink">Live Activity:</span>
        <div className="flex items-center gap-1.5 transition-all duration-300">
          <span className="bg-paper px-2 py-0.5 border border-ink shadow-[1px_1px_0px_#000]">
            {current.name}
          </span>
          <span className="text-muted hidden sm:inline">({current.location})</span>
          <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.5 border border-emerald-700 text-[10px] hidden md:inline">
            {current.tool} · {current.time}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-ink">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" /> 4,280+ Blueprints Generated
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5" /> 94.6% Kept Generated Brand
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5 fill-ink" /> Instant Launch in &lt; 2 Mins
        </span>
      </div>
    </div>
  );
}
