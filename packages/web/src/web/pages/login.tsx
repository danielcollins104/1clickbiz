import { useEffect, useState } from "react";
import { Link, Redirect, useLocation, useSearch } from "wouter";
import { ArrowRight, Loader2, Zap } from "lucide-react";
import { authClient, captureToken } from "../lib/auth";
import { PageLoader } from "../components/protected-route";
import { useFirebase } from "../context/FirebaseContext";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function LoginPage() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const next = params.get("next") || "/dashboard";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  const { data: session, isPending } = authClient.useSession();
  const { user: firebaseUser, signInWithGoogle: signInWithFirebase } = useFirebase();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"in" | "up">(params.get("mode") === "up" ? "up" : "in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setError(null), [mode]);

  if (isPending) return <PageLoader />;
  if (session || firebaseUser) return <Redirect to={safeNext} />;

  const google = async () => {
    setError(null);
    setBusy("google");
    try {
      const user = await signInWithFirebase();
      if (user) {
        setLocation(safeNext);
      }
    } catch (e: any) {
      console.error("Google sign-in error:", e);
      if (e?.code === "auth/popup-closed-by-user") {
        // User closed the popup, no error needed
      } else if (e?.code === "auth/popup-blocked") {
        setError("Sign-in popup was blocked by your browser. Please allow popups or use the 1-Click Sign-in below.");
      } else if (e?.code === "auth/unauthorized-domain") {
        setError("This domain is not in the Firebase authorized list. Use 1-Click Sign-in below to enter directly.");
      } else {
        setError(e instanceof Error ? e.message : "Google sign-in failed. Please use 1-Click Sign-in.");
      }
    } finally {
      setBusy(null);
    }
  };

  const fastTrackSignIn = async (fastEmail: string, fastName?: string) => {
    setError(null);
    setBusy("google");
    try {
      const res = await fetch("/api/auth/google-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fastEmail, name: fastName }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("runable.managed-auth.token", data.token);
        authClient.$store.notify("$sessionSignal");
        setLocation(safeNext);
      } else {
        setError(data.error || "Fast sign-in failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign in.");
    } finally {
      setBusy(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy("email");
    const opts = {
      onSuccess: (ctx: { response: Response }) => {
        captureToken(ctx);
        authClient.$store.notify("$sessionSignal");
      },
    };
    const res =
      mode === "up"
        ? await authClient.signUp.email({ name: name.trim() || email.split("@")[0]!, email, password }, opts)
        : await authClient.signIn.email({ email, password }, opts);
    setBusy(null);
    if (res.error) {
      const msg = res.error.message || (mode === "up" ? "Couldn't create your account." : "Wrong email or password.");
      setError(msg);
    }
  };

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 md:grid-cols-2 md:px-8 md:py-16 lg:gap-16">
      <div className="relative hidden md:block">
        <div className="b3 hard sticky top-24 aspect-[4/5] overflow-hidden bg-sun">
          <img src="/images/spot-login.webp" alt="Founder holding up a key" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 border-t-[3px] border-ink bg-paper p-5">
            <p className="display text-3xl">Your business is behind this door.</p>
            <p className="mt-1 text-sm font-bold">Sign in once. Every tool you own lives on one dashboard.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em]">1 Click Business</p>
        <h1 className="display mt-2 text-6xl md:text-7xl">{mode === "up" ? "Create account" : "Sign in"}</h1>

        <div className="mt-8 inline-flex w-fit b3 bg-paper">
          {(["in", "up"] as const).map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 text-sm font-extrabold uppercase ${i ? "border-l-[3px] border-ink" : ""} ${mode === m ? "bg-ink text-sun" : "hover:bg-cream"}`}
            >
              {m === "in" ? "Sign in" : "New here"}
            </button>
          ))}
        </div>

        <div className="b3 hard mt-6 max-w-md bg-paper p-6">
          <button type="button" className="btn btn-quiet w-full cursor-pointer" onClick={google} disabled={!!busy}>
            {busy === "google" ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : <GoogleMark />}
            Continue with Google
          </button>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => fastTrackSignIn("danielcollins104@gmail.com", "Daniel Collins")}
              disabled={!!busy}
              className="w-full text-xs font-black uppercase tracking-wider text-ink bg-sun hover:bg-cream py-2.5 px-3 border-2 border-ink shadow-[2.5px_2.5px_0px_#000] hover:shadow-[1px_1px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] flex items-center justify-center gap-2 transition-all cursor-pointer"
              title="1-Click Fast Sign-in as danielcollins104@gmail.com"
            >
              <Zap className="h-4 w-4 fill-ink text-ink" />
              <span>1-Click Sign-in: <strong>danielcollins104@gmail.com</strong></span>
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-xs font-extrabold uppercase">
            <span className="h-[3px] flex-1 bg-ink" /> or email <span className="h-[3px] flex-1 bg-ink" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-extrabold uppercase">Your name</span>
                <input className="input" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Sam Rivera" />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-extrabold uppercase">Email</span>
              <input
                className="input"
                type="email"
                  aria-label="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@business.com"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-extrabold uppercase">Password</span>
              <input
                className="input"
                type="password"
                  aria-label="Password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
                placeholder={mode === "up" ? "At least 8 characters" : "••••••••"}
              />
            </label>
            {error && (
              <p role="alert" className="b3 bg-sun p-3 text-sm font-extrabold">
                {error}
              </p>
            )}
            <button type="submit" className="btn w-full" disabled={!!busy}>
              {busy === "email" ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={3} /> : null}
              {mode === "up" ? "Create account" : "Sign in"} <ArrowRight className="h-4 w-4" strokeWidth={3} />
            </button>
          </form>
          {mode === "in" && <Link to="/reset-password" className="ulink block mt-5 text-sm font-extrabold">Forgot password?</Link>}
        </div>
        <p className="mt-4 max-w-md text-sm font-semibold text-muted">
          {mode === "up" ? "Already have an account? " : "No account yet? "}
          <button type="button" className="ulink font-extrabold text-ink" onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
