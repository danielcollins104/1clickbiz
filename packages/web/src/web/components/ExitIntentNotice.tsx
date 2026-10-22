import { useState, useEffect } from "react";
import { Sparkles, X, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { useQuickStart } from "../context/QuickStartContext";

export function ExitIntentNotice() {
  const [visible, setVisible] = useState(false);
  const { openQuickStart } = useQuickStart();

  useEffect(() => {
    // Check if dismissed previously in this session
    const dismissed = sessionStorage.getItem("exit_intent_notice_dismissed");
    if (dismissed) return;

    // Detect mouse leaving viewport at top
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !sessionStorage.getItem("exit_intent_notice_dismissed")) {
        setVisible(true);
      }
    };

    // Idle timer fallback: after 45s of active page viewing
    const idleTimer = setTimeout(() => {
      if (!sessionStorage.getItem("exit_intent_notice_dismissed")) {
        setVisible(true);
      }
    }, 45000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(idleTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("exit_intent_notice_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-in slide-in-from-bottom duration-300">
      <div className="b3 hard border-[3px] border-ink bg-sun p-5 shadow-[6px_6px_0px_#000] text-ink relative">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Close notification"
          className="absolute top-3 right-3 p-1 hover:bg-black/10 rounded-xs cursor-pointer"
        >
          <X className="h-4 w-4 stroke-[3]" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="chip bg-mint text-ink text-[10px] font-black uppercase">
            <Sparkles className="h-3 w-3 inline mr-1 fill-ink" />
            100% Risk Free
          </span>
          <span className="flex items-center gap-1 text-[11px] font-black">
            <ShieldCheck className="h-3.5 w-3.5" /> Cancel anytime
          </span>
        </div>

        <h3 className="display text-xl leading-tight">
          Unsure where to begin? Start with 1 click.
        </h3>
        <p className="mt-1.5 text-xs font-bold leading-relaxed text-ink/90">
          Our Quick Start Wizard drafts your business blueprint, tagline, and brand colors in 90 seconds. No card required to preview.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              dismiss();
              openQuickStart();
            }}
            className="btn btn-sm btn-yellow text-xs font-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 fill-ink" />
            Launch Free Blueprint
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-black uppercase hover:underline cursor-pointer"
          >
            I'm browsing
          </button>
        </div>
      </div>
    </div>
  );
}
