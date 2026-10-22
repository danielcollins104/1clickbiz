import { useState, useRef, useEffect } from "react";
import {
  Send,
  Loader2,
  Sparkles,
  Search,
  MapPin,
  Zap,
  Brain,
  Rocket,
  ExternalLink,
  Trash2,
  User,
  Bot,
  Copy,
  Check,
  Globe,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";

export type RoleMode = "general" | "complex" | "fast" | "investor" | "marketing";
export type GroundingMode = "none" | "search" | "maps";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  modelUsed?: string;
  groundingType?: GroundingMode;
  sources?: Array<{ title: string; url: string; snippet?: string; type: "web" | "maps" }>;
  createdAt?: string;
}

export const ROLES: Array<{
  id: RoleMode;
  label: string;
  model: "gemini-4-argon" | "gemini-3.8-flash" | "gemini-3.1-flash-lite";
  badge: string;
  description: string;
  defaultRole: string;
}> = [
  {
    id: "general",
    label: "Growth & Operations",
    model: "gemini-3.8-flash",
    badge: "General Tasks",
    description: "General tasks: customer acquisition, business launch steps, operations & sustainable revenue",
    defaultRole: "Lead Growth & Operations Advisor",
  },
  {
    id: "complex",
    label: "Executive Strategist",
    model: "gemini-4-argon",
    badge: "Complex Tasks",
    description: "Particularly complex tasks: unit economics, strategic moat architecture & deep roadmap modeling",
    defaultRole: "Elite Executive Business Strategist",
  },
  {
    id: "fast",
    label: "Rapid Idea Coach",
    model: "gemini-3.1-flash-lite",
    badge: "Fast Tasks",
    description: "Tasks that should happen fast: rapid brand names, tagline brainstorming & swift checklists",
    defaultRole: "Rapid Idea Coach & High-Velocity Naming Specialist",
  },
  {
    id: "investor",
    label: "Pitch & Venture Critic",
    model: "gemini-4-argon",
    badge: "Complex Tasks",
    description: "Particularly complex tasks: venture interrogation, pitch deck review, risk analysis & valuation",
    defaultRole: "Seasoned Venture Capitalist & Pitch Critic",
  },
  {
    id: "marketing",
    label: "Brand Architect",
    model: "gemini-3.8-flash",
    badge: "General Tasks",
    description: "General tasks: conversion copywriting, ad creative direction & launch sequences",
    defaultRole: "Head of Growth Marketing & Brand Architecture",
  },
];

const STARTER_PROMPTS = [
  {
    icon: Rocket,
    text: "Review my business idea and point out the top 3 blindspots.",
    role: "general" as RoleMode,
    grounding: "none" as GroundingMode,
  },
  {
    icon: Search,
    text: "Find active government grants and funding for small businesses in 2026.",
    role: "general" as RoleMode,
    grounding: "search" as GroundingMode,
  },
  {
    icon: MapPin,
    text: "Analyze local competitors and prime commercial locations near me.",
    role: "general" as RoleMode,
    grounding: "maps" as GroundingMode,
  },
  {
    icon: Brain,
    text: "Stress-test my pricing model and calculate 12-month break-even margins.",
    role: "complex" as RoleMode,
    grounding: "none" as GroundingMode,
  },
  {
    icon: Zap,
    text: "Give me 5 catchy, available brand names and punchy taglines in 10 seconds.",
    role: "fast" as RoleMode,
    grounding: "none" as GroundingMode,
  },
];

export function GeminiChatbot({
  initialPrompt = "",
  chatId = "founder-advisor",
}: {
  initialPrompt?: string;
  chatId?: string;
}) {
  const { user, saveChatMessage, loadChatMessages } = useFirebase();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content:
        "Hello! I am your AI Business Advisor powered by Google Gemini. I can assist with strategic planning, search live web data for funding and competitors, or discover local business resources with Google Maps. What are you building today?",
      modelUsed: "gemini-3.8-flash",
      groundingType: "none",
    },
  ]);

  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<RoleMode>("general");
  const [customInstruction, setCustomInstruction] = useState("");
  const [showRoleConfig, setShowRoleConfig] = useState(false);
  const [grounding, setGrounding] = useState<GroundingMode>("none");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | undefined>();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.id === role) || ROLES[0];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat history from Firestore if user is authenticated
  useEffect(() => {
    if (!user) return;
    const unsubscribe = loadChatMessages(chatId, (firestoreMsgs) => {
      if (firestoreMsgs.length > 0) {
        setMessages(
          firestoreMsgs.map((m) => ({
            id: m.id,
            role: m.role as "user" | "model",
            content: m.content,
            modelUsed: m.modelUsed,
            groundingType: m.groundingType as GroundingMode,
            sources: m.sources as any,
            createdAt: m.createdAt,
          }))
        );
      }
    });
    return unsubscribe;
  }, [user, chatId, loadChatMessages]);

  // Request location when maps grounding is toggled
  const handleToggleMaps = () => {
    if (grounding === "maps") {
      setGrounding("none");
      return;
    }
    setGrounding("maps");
    if (navigator.geolocation && !location) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation skipped:", err.message);
        }
      );
    }
  };

  const handleSend = async (
    textToSend?: string,
    overrideRole?: RoleMode,
    overrideGrounding?: GroundingMode
  ) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const currentRole = overrideRole || role;
    const currentGrounding = overrideGrounding !== undefined ? overrideGrounding : grounding;

    const userMessage: Message = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    // Save user message to Firestore
    if (user) {
      void saveChatMessage(chatId, {
        role: "user",
        content: userMessage.content,
        modelUsed: "user",
        groundingType: "none",
      });
    }

    try {
      // Exclude client-side welcome message and previous error bubbles when sending to backend
      const payloadMessages = newHistory
        .filter((m) => m.id !== "welcome" && !m.content.startsWith("Error:"))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          role: currentRole,
          systemInstruction: customInstruction.trim() || undefined,
          grounding: currentGrounding,
          location,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        role: "model",
        content:
          data.text ||
          "I am ready to help you plan, launch, and grow your business. Tell me about your business concept or ask any questions!",
        modelUsed: data.modelUsed || "gemini-3.8-flash",
        groundingType: data.groundingType || currentGrounding,
        sources: data.sources || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save assistant response to Firestore
      if (user) {
        void saveChatMessage(chatId, {
          role: "model",
          content: botMessage.content,
          modelUsed: botMessage.modelUsed,
          groundingType: botMessage.groundingType,
          sources: botMessage.sources,
        });
      }
    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      const errorMessage: Message = {
        id: `err_${Date.now()}`,
        role: "model",
        content: `Error: ${err.message || "Failed to reach Gemini API. Please try again."}`,
        modelUsed: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: "Chat cleared. What aspect of your business shall we tackle next?",
        modelUsed: "gemini-3.8-flash",
        groundingType: "none",
      },
    ]);
  };

  return (
    <div className="card flex flex-col h-[750px] max-h-[85vh] bg-paper shadow-2xl border-4 border-ink overflow-hidden">
      {/* Chatbot Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink bg-sun p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-ink text-sun b3">
            <Sparkles className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="display text-xl leading-none">Gemini Advisor</h2>
              <span className="badge text-[10px] bg-ink text-sun font-extrabold uppercase px-2 py-0.5 b3">
                {activeRoleConfig.model}
              </span>
            </div>
            <p className="text-xs font-bold text-ink/80 mt-0.5">
              Multi-turn coaching • Grounded with Google Search & Maps
            </p>
          </div>
        </div>

        {/* Controls: Role selection and Tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <div className="flex flex-wrap bg-paper p-1 b3 border-2 border-ink text-xs font-extrabold gap-1">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  if (grounding !== "none" && r.id !== "general") setGrounding("none");
                }}
                className={`px-2.5 py-1 transition-colors rounded ${
                  role === r.id ? "bg-sun text-ink b3 shadow-sm font-black" : "text-muted hover:text-ink"
                }`}
                title={`${r.label}: ${r.description} (${r.model})`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Persona System Instruction toggle */}
          <button
            type="button"
            onClick={() => setShowRoleConfig((s) => !s)}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 ${
              showRoleConfig || customInstruction ? "bg-sun text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Inspect or customize chatbot persona and system instructions"
          >
            <Brain className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>Role Prompt</span>
          </button>

          {/* Search Grounding toggle */}
          <button
            type="button"
            onClick={() => setGrounding((g) => (g === "search" ? "none" : "search"))}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 ${
              grounding === "search" ? "bg-sky-400 text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Ground answers in real-time web results using Google Search"
          >
            <Search className="h-3.5 w-3.5" strokeWidth={3} />
            <span>Search</span>
          </button>

          {/* Maps Grounding toggle */}
          <button
            type="button"
            onClick={handleToggleMaps}
            className={`btn btn-sm !px-2.5 !py-1 text-xs flex items-center gap-1.5 ${
              grounding === "maps" ? "bg-emerald-400 text-ink font-black ring-2 ring-ink" : "btn-quiet"
            }`}
            title="Ground answers in places, venues, and local geography with Google Maps"
          >
            <MapPin className="h-3.5 w-3.5" strokeWidth={3} />
            <span>Maps</span>
          </button>

          {/* Clear button */}
          <button
            type="button"
            onClick={clearChat}
            className="btn btn-sm btn-quiet !px-2"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Role & Persona System Instruction Drawer */}
      {showRoleConfig && (
        <div className="p-3 bg-cream border-b-3 border-ink text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[10px] tracking-wider text-muted">
                Active Chatbot Role:
              </span>
              <strong className="text-sm font-black">{activeRoleConfig.label}</strong>
              <span className="badge text-[10px] bg-ink text-sun px-2 py-0.5 font-bold">
                {activeRoleConfig.model}
              </span>
              <span className="chip text-[10px] bg-mint text-ink font-extrabold">
                {activeRoleConfig.badge}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowRoleConfig(false)}
              className="text-muted hover:text-ink font-bold text-xs"
            >
              Close
            </button>
          </div>
          <p className="text-muted font-medium text-xs">{activeRoleConfig.description}</p>
          <div>
            <label
              htmlFor="custom-instruction-input"
              className="block text-[10px] font-black uppercase text-muted mb-1"
            >
              Custom Persona &amp; System Instruction (Optional):
            </label>
            <input
              id="custom-instruction-input"
              type="text"
              aria-label="Custom persona and system instruction"
              className="input !py-1.5 !text-xs w-full !bg-white"
              placeholder={`E.g. "Focus on direct-to-consumer organic foods" or "Tone: extremely skeptical and metrics-driven"`}
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
            />
            {customInstruction && (
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                Active custom system prompt will guide every turn of this conversation.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Grounding Active Banner */}
      {grounding !== "none" && (
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold bg-cream border-b-2 border-ink">
          <div className="flex items-center gap-2">
            {grounding === "search" ? (
              <>
                <Search className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  <strong>Google Search Grounding active:</strong> Model will retrieve real-time web citations via gemini-3.5-flash.
                </span>
              </>
            ) : (
              <>
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>
                  <strong>Google Maps Grounding active:</strong> Model will fetch real locations & place snippets via gemini-3.5-flash
                  {location ? " (using your coordinates)" : ""}.
                </span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setGrounding("none")}
            className="text-muted hover:text-ink underline text-[11px]"
          >
            Disable
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-paper/60">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[92%] ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-9 w-9 shrink-0 grid place-items-center b3 border-2 border-ink ${
                  isUser ? "bg-sun text-ink" : "bg-ink text-sun"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted">
                    {isUser ? "You" : "Advisor"}
                  </span>
                  {!isUser && m.modelUsed && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-cream text-ink border border-ink/30 rounded">
                      {m.modelUsed}
                    </span>
                  )}
                  {!isUser && m.groundingType === "search" && (
                    <span className="text-[10px] font-extrabold text-blue-700 flex items-center gap-0.5">
                      <Search className="h-2.5 w-2.5" /> Search Grounded
                    </span>
                  )}
                  {!isUser && m.groundingType === "maps" && (
                    <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5" /> Maps Grounded
                    </span>
                  )}
                </div>

                <div
                  className={`b3 p-4 border-2 border-ink relative group ${
                    isUser
                      ? "bg-sun text-ink font-bold shadow-md"
                      : "bg-white text-ink shadow-sm font-medium"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => copyText(m.id, m.content)}
                    className="absolute top-2 right-2 p-1 bg-paper/80 hover:bg-cream rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy text"
                  >
                    {copiedId === m.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted" />
                    )}
                  </button>
                </div>

                {/* Grounding Sources (Search & Maps Links) */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 b3 p-3 bg-cream border-2 border-ink text-xs space-y-2">
                    <p className="font-extrabold uppercase text-[10px] tracking-wider text-muted flex items-center gap-1.5">
                      {m.groundingType === "maps" ? (
                        <>
                          <MapPin className="h-3 w-3 text-emerald-600" />
                          Places & Map Grounding References ({m.sources.length})
                        </>
                      ) : (
                        <>
                          <Globe className="h-3 w-3 text-blue-600" />
                          Google Search Sources ({m.sources.length})
                        </>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-sun border border-ink text-xs font-bold text-ink rounded no-underline transition-colors max-w-full truncate"
                        >
                          <span className="truncate">{s.title}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="h-9 w-9 shrink-0 grid place-items-center b3 border-2 border-ink bg-ink text-sun">
              <Bot className="h-4 w-4" />
            </div>
            <div className="b3 p-4 border-2 border-ink bg-white flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-ink" strokeWidth={3} />
              <span className="text-sm font-extrabold">
                {grounding === "search"
                  ? "Searching Google & analyzing results…"
                  : grounding === "maps"
                  ? "Looking up locations on Google Maps…"
                  : role === "complex"
                  ? "Reasoning with Gemini Pro…"
                  : "Formulating response…"}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 py-2 bg-cream border-t-2 border-ink">
          <p className="text-[11px] font-extrabold uppercase text-muted mb-1.5">
            Suggested questions
          </p>
          <div className="flex flex-wrap gap-2">
            {STARTER_PROMPTS.map((sp, idx) => {
              const Icon = sp.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setRole(sp.role);
                    setGrounding(sp.grounding);
                    handleSend(sp.text, sp.role, sp.grounding);
                  }}
                  className="b3 bg-white hover:bg-sun border border-ink px-3 py-1.5 text-xs font-bold text-left flex items-center gap-2 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ink" />
                  <span className="line-clamp-1">{sp.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t-4 border-ink bg-sun p-3"
      >
        <input
          type="text"
          aria-label="Chat message input"
          className="input flex-1 !bg-white"
          placeholder={
            grounding === "search"
              ? "Ask a live web search question (grants, market trends, news)…"
              : grounding === "maps"
              ? "Ask about local venues, competitors, suppliers, or addresses…"
              : role === "complex"
              ? "Ask for in-depth financial, legal, or strategic breakdown…"
              : "Ask anything about your business concept, launch steps, or ideas…"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="btn !px-5"
          disabled={loading || !input.trim()}
          aria-label="Send Message"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} />
          ) : (
            <Send className="h-5 w-5" strokeWidth={3} />
          )}
        </button>
      </form>
    </div>
  );
}
