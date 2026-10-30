import { Link } from "wouter";
import { Search, MapPin, Brain, Shield, User, ArrowLeft, LogIn, Sparkles, Cpu } from "lucide-react";
import { GeminiChatbot } from "../components/GeminiChatbot";
import { useFirebase } from "../context/FirebaseContext";

export default function AdvisorPage() {
  const { user, signInWithGoogle, savedBusinesses } = useFirebase();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link to="/" className="ulink text-xs font-black uppercase inline-flex items-center gap-1 mr-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <span className="inline-flex items-center gap-1 bg-ink text-sun px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5 text-mint" /> Sovereign Multi-Agent Executive Core
            </span>
            <span className="inline-flex items-center gap-1 bg-mint text-ink border border-ink px-2 py-0.5 text-[11px] font-black uppercase">
              Solomon™ Neural Engine v9.4
            </span>
          </div>
          <h1 className="display text-4xl md:text-5xl">Solomon™ Sovereign Business Advisor</h1>
          <p className="mt-2 text-base font-bold text-muted max-w-3xl">
            Autonomous multi-agent executive intelligence engineered specifically for founders—combining deep financial &amp; strategic reasoning with our real-time Global Web Intelligence Grid and Geospatial Commercial Radar.
          </p>
        </div>

        {/* User / Auth status card */}
        <div className="card bg-paper p-4 border-3 border-ink flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="h-10 w-10 rounded-full border-2 border-ink object-cover"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center bg-sun text-ink b3 border-2 border-ink">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div>
                <p className="text-sm font-black">{user.displayName || user.email}</p>
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Cloud Memory Sync Active ({savedBusinesses.length} businesses)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-muted">Sign in to sync Solomon™ memory across devices</p>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="btn btn-sm btn-yellow flex items-center gap-1.5"
              >
                <LogIn className="h-4 w-4" /> Sign in with Google
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Model & Feature Capability Badges */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-white p-4 border-3 border-ink flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-sun text-ink b3">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm">Tri-Core Sovereign Architecture</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Powered by <code>solomon-omni-9</code> for deep venture &amp; margin modeling, <code>solomon-quantum-5</code> for growth execution, and <code>solomon-hyper-lite</code> for instant synthesis.
            </p>
          </div>
        </div>

        <div className="card bg-white p-4 border-3 border-ink flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-sky-200 text-ink b3">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm">Live Market &amp; Grant Intelligence Grid</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Scans live 2026 non-dilutive startup grants, competitor pricing matrices, demand signals, and regulatory filings with verified citations.
            </p>
          </div>
        </div>

        <div className="card bg-white p-4 border-3 border-ink flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-emerald-200 text-ink b3">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm">Geospatial Commercial Telemetry</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Pinpoints high-traffic commercial zones, local competitors, wholesale suppliers, and municipal licensing hubs with live map coordinates.
            </p>
          </div>
        </div>
      </div>

      {/* Main Solomon Interface */}
      <GeminiChatbot />
    </div>
  );
}
