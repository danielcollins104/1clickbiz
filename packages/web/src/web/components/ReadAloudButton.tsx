import { useEffect, useState, useId } from "react";
import { Volume2, Square } from "lucide-react";

/**
 * Picks the most natural-sounding human English voice available in the browser.
 * Prioritizes Neural / Natural Online voices (Edge/Chrome), Google US/UK voices,
 * and Apple Premium/Enhanced Siri voices on macOS & iOS.
 */
function pickNaturalHumanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const enVoices = voices.filter(
    (v) => v.lang && (v.lang.startsWith("en-US") || v.lang.startsWith("en-GB") || v.lang.startsWith("en"))
  );
  const pool = enVoices.length > 0 ? enVoices : voices;

  const scoreVoice = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase();
    let score = 0;

    if (v.lang === "en-US") score += 25;
    else if (v.lang.startsWith("en-")) score += 15;

    // Top-tier Neural / Natural human voices
    if (name.includes("natural")) score += 120;
    if (name.includes("neural")) score += 110;
    if (name.includes("online")) score += 80;
    if (name.includes("ava")) score += 95;
    if (name.includes("andrew")) score += 92;
    if (name.includes("aria")) score += 90;
    if (name.includes("jenny")) score += 88;
    if (name.includes("guy")) score += 85;
    if (name.includes("google us english")) score += 90;
    if (name.includes("google uk english")) score += 82;

    // Apple macOS / iOS Premium & Enhanced natural voices
    if (name.includes("premium")) score += 100;
    if (name.includes("enhanced")) score += 90;
    if (name.includes("siri")) score += 85;
    if (name.includes("samantha")) score += 75;
    if (name.includes("allison")) score += 72;
    if (name.includes("alex")) score += 70;
    if (name.includes("daniel")) score += 68;
    if (name.includes("karen")) score += 65;

    // Penalize novelty / robotic voices
    if (
      name.includes("albert") ||
      name.includes("bad news") ||
      name.includes("bahh") ||
      name.includes("bells") ||
      name.includes("boing") ||
      name.includes("bubbles") ||
      name.includes("cellos") ||
      name.includes("fred") ||
      name.includes("good news") ||
      name.includes("jester") ||
      name.includes("organ") ||
      name.includes("superstar") ||
      name.includes("trinoids") ||
      name.includes("whisper") ||
      name.includes("zarvox")
    ) {
      score -= 200;
    }

    return score;
  };

  const sorted = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return sorted[0] ?? null;
}

/**
 * Normalizes text so the speech synthesizer reads it with natural human phrasing
 * instead of pronouncing raw symbols or punctuation.
 */
function normalizeTextForHumanSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_`~>|]/g, " ")
    .replace(/™|®|©/g, "")
    .replace(/\$(\d[\d,]*)\/mo\b/gi, "$$$1 per month")
    .replace(/\$(\d[\d,]*)\/yr\b/gi, "$$$1 per year")
    .replace(/\b1-Click\b/gi, "One Click")
    .replace(/\b24\/7\b/g, "24 7")
    .replace(/\b(\d+)\/(\d+)\b/g, "$1 out of $2")
    .replace(/➔|→|↗|↓|⚡|🔥|🚀|💡|📍|🧠|🎉|✓|•/g, ". ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits long text into natural sentence chunks so browser speech engines
 * never cut off mid-paragraph and pause naturally between thoughts.
 */
function splitIntoSentences(text: string): string[] {
  const cleaned = normalizeTextForHumanSpeech(text);
  if (!cleaned) return [];
  const rawParts = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [cleaned];
  const chunks: string[] = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 220) {
      chunks.push(trimmed);
    } else {
      // Split very long clauses on commas/semicolons/dashes
      const subParts = trimmed.split(/(?<=[,;—–-])\s+/);
      let buffer = "";
      for (const sub of subParts) {
        if ((buffer + " " + sub).trim().length > 200 && buffer) {
          chunks.push(buffer.trim());
          buffer = sub;
        } else {
          buffer = (buffer + " " + sub).trim();
        }
      }
      if (buffer.trim()) chunks.push(buffer.trim());
    }
  }
  return chunks;
}

const READ_ALOUD_STOP_EVENT = "1cb-read-aloud-stop";
let activeReaderId: string | null = null;

export interface ReadAloudButtonProps {
  /** The text content to read aloud when clicked */
  text: string;
  /** Optional accessible label */
  label?: string;
  /** Visual style: 'pill' shows icon + text label; 'icon' shows compact speaker button */
  variant?: "pill" | "icon";
  /** Color theme context: 'light' for light backgrounds, 'dark' for dark bg-ink sections */
  theme?: "light" | "dark";
  className?: string;
}

export function ReadAloudButton({
  text,
  label = "Listen",
  variant = "pill",
  theme = "light",
  className = "",
}: ReadAloudButtonProps) {
  const id = useId();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // Warm up voice list
    window.speechSynthesis.getVoices();
    const handleWarmup = () => {
      window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener?.("voiceschanged", handleWarmup);

    const handleGlobalStop = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail !== id) {
        setSpeaking(false);
      }
    };
    window.addEventListener(READ_ALOUD_STOP_EVENT, handleGlobalStop);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", handleWarmup);
      window.removeEventListener(READ_ALOUD_STOP_EVENT, handleGlobalStop);
      if (activeReaderId === id) {
        window.speechSynthesis.cancel();
        activeReaderId = null;
      }
    };
  }, [id]);

  const stopReading = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (activeReaderId === id) {
      activeReaderId = null;
    }
    setSpeaking(false);
  };

  const startReading = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Notify any other active ReadAloudButton to stop
    window.dispatchEvent(new CustomEvent(READ_ALOUD_STOP_EVENT, { detail: id }));
    window.speechSynthesis.cancel();

    const chunks = splitIntoSentences(text);
    if (!chunks.length) return;

    activeReaderId = id;
    setSpeaking(true);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = pickNaturalHumanVoice(voices);

    let index = 0;

    const speakNext = () => {
      if (activeReaderId !== id || index >= chunks.length) {
        if (activeReaderId === id) {
          activeReaderId = null;
          setSpeaking(false);
        }
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index]!);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
        utterance.lang = preferredVoice.lang;
      } else {
        utterance.lang = "en-US";
      }
      // Natural human conversational pace and warm pitch
      utterance.rate = 0.97;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        index += 1;
        if (activeReaderId === id && index < chunks.length) {
          setTimeout(speakNext, 110);
        } else if (activeReaderId === id) {
          activeReaderId = null;
          setSpeaking(false);
        }
      };

      utterance.onerror = () => {
        if (activeReaderId === id) {
          activeReaderId = null;
          setSpeaking(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (speaking) {
      stopReading();
    } else {
      startReading();
    }
  };

  const baseStyles =
    theme === "dark"
      ? speaking
        ? "bg-mint text-ink border-2 border-ink shadow-[2px_2px_0px_#000]"
        : "bg-paper text-ink border-2 border-ink hover:bg-mint hover:text-ink shadow-[2px_2px_0px_#000]"
      : speaking
      ? "bg-mint text-ink border-2 border-ink shadow-[2px_2px_0px_#000]"
      : "bg-cream text-ink border-2 border-ink hover:bg-sun shadow-[2px_2px_0px_#000]";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={speaking ? "Stop reading aloud" : `${label} (Read section aloud)`}
        aria-label={speaking ? "Stop reading aloud" : `${label} (Read section aloud)`}
        aria-pressed={speaking}
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center transition-all cursor-pointer ${baseStyles} ${className}`}
      >
        {speaking ? (
          <Square className="h-3.5 w-3.5 fill-current animate-pulse" strokeWidth={2.75} />
        ) : (
          <Volume2 className="h-4 w-4" strokeWidth={2.5} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={speaking ? "Stop reading aloud" : `${label} in a natural voice`}
      aria-label={speaking ? "Stop reading aloud" : `${label} in a natural voice`}
      aria-pressed={speaking}
      className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${baseStyles} ${className}`}
    >
      {speaking ? (
        <>
          <Square className="h-3 w-3 fill-current animate-pulse shrink-0" strokeWidth={3} />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2.75} />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
