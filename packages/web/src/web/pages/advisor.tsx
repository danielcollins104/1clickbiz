import { Link } from "wouter";
import { Search, MapPin, Brain, Shield, User, ArrowLeft, LogIn } from "lucide-react";
import { GeminiChatbot } from "../components/GeminiChatbot";
import { useFirebase } from "../context/FirebaseContext";

export default function AdvisorPage() {
  const { user, signInWithGoogle, savedBusinesses } = useFirebase();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-4 border-ink pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/" className="ulink text-xs font-black uppercase inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
          </div>
          <h1 className="display text-4xl md:text-5xl">Gemini Business Advisor</h1>
          <p className="mt-2 text-base font-bold text-muted max-w-2xl">
            Multi-turn intelligent business coaching powered by Google Gemini models, integrated with real-time Google Search and Maps Grounding.
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
                  <Shield className="h-3 w-3" /> Firestore Sync Active ({savedBusinesses.length} businesses)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-bold text-muted">Sign in to save chat history to Firestore</p>
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
            <h4 className="font-black text-sm">Multi-Model Intelligence</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Powered by <code>gemini-4-argon</code> for complex tasks, <code>gemini-3.8-flash</code> for general tasks, and <code>gemini-3.1-flash-lite</code> for speed.
            </p>
          </div>
        </div>

        <div className="card bg-white p-4 border-3 border-ink flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-sky-200 text-ink b3">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm">Google Search Grounding</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Retrieves live web citations for 2026 small business grants, news, competitor launches, and regulations.
            </p>
          </div>
        </div>

        <div className="card bg-white p-4 border-3 border-ink flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center bg-emerald-200 text-ink b3">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-black text-sm">Google Maps Grounding</h4>
            <p className="text-xs font-medium text-muted mt-0.5">
              Scouts local business establishments, physical storefronts, suppliers, and municipal offices with live Google Maps links.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chatbot Interface */}
      <GeminiChatbot />
    </div>
  );
}
