import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, CreditCard, Loader2, LogOut, Sparkles } from "lucide-react";
import { PageLoader } from "../components/protected-route";
import { PRODUCTS, planIdFor } from "../../api/catalog";
import { authClient } from "../lib/auth";
import { money } from "../lib/format";
import { errorMessage, useAccess, useBusinesses, useDropSingles, usePortal, useRemoveBusiness, useSession } from "../queries/business";
import { useFirebase } from "../context/FirebaseContext";

export default function AccountPage() {
  const { data: session } = useSession();
  const { user: firebaseUser, signOut: signOutFirebase } = useFirebase();
  const { data: access, isLoading } = useAccess();
  const { data: list } = useBusinesses();
  const portal = usePortal();
  const drop = useDropSingles();
  const remove = useRemoveBusiness();
  const [, navigate] = useLocation();
  const [err, setErr] = useState<string | null>(null);

  if (isLoading) return <PageLoader label="Loading your account" />;

  const byPlan = new Map(PRODUCTS.map((p) => [planIdFor(p.slug), p]));
  const plans = (access?.plans ?? []).filter((p) => byPlan.has(p.planId));
  const gens = access?.generations;
  const hasBundle = plans.some((p) => p.planId === planIdFor("phase-1-launch") && p.status === "active");
  const redundant = hasBundle ? plans.filter((p) => p.planId.startsWith("tool_") && p.status === "active" && !p.canceling) : [];
  const endsOn = (t: number | null) => (t ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <h1 className="display text-5xl md:text-7xl">Account.</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="card bg-paper p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">Signed in as</p>
          <p className="display mt-2 text-2xl">{session?.user.name || firebaseUser?.displayName || "Founder"}</p>
          <p className="font-semibold">{session?.user.email || firebaseUser?.email}</p>
          <button
            type="button"
            className="btn btn-sm btn-quiet mt-6 cursor-pointer"
            onClick={async () => {
              try {
                await authClient.signOut();
              } catch {
                // Ignore
              }
              await signOutFirebase();
              localStorage.removeItem("runable.managed-auth.token");
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4" strokeWidth={3} /> Sign out
          </button>
        </section>

        <section className="card bg-sun p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em]">AI generations this period</p>
          {gens ? (
            <>
              <p className="display mt-2 text-5xl">{gens.remaining}<span className="text-2xl"> / {gens.granted}</span></p>
              <div className="b3 mt-4 h-5 bg-paper">
                <div className="h-full bg-ink" style={{ width: `${(gens.remaining / Math.max(1, gens.granted)) * 100}%` }} />
              </div>
              <p className="mt-3 text-sm font-bold">Each tool run, regenerate or advisor reply uses one. Resets monthly.</p>
            </>
          ) : (
            <p className="mt-2 font-bold">No plan yet, so no generations.</p>
          )}
        </section>
      </div>

      <section className="card mt-6 bg-paper">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4">
          <h2 className="display text-2xl">Subscriptions</h2>
          {plans.length > 0 && (
            <button
              type="button"
              className="btn btn-sm"
              disabled={portal.isPending}
              onClick={() => {
                setErr(null);
                portal.mutate({}, { onSuccess: (r) => r.url && (window.location.href = r.url), onError: (e) => setErr(errorMessage(e)) });
              }}
            >
              {portal.isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} /> : <CreditCard className="h-4 w-4" strokeWidth={3} />}
              Manage billing
            </button>
          )}
        </header>
        {err && <p role="alert" className="border-b-[3px] border-ink px-6 py-3 font-extrabold">{err}</p>}
        {redundant.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-cream px-6 py-4">
            <p className="max-w-xl font-extrabold">
              Your bundle already includes {redundant.length === 1 ? "this single-tool plan" : `these ${redundant.length} single-tool plans`} ({money(redundant.reduce((n, pl) => n + pl.monthly, 0))}/mo). Stop paying for {redundant.length === 1 ? "it" : "them"}?
            </p>
            <button
              type="button"
              className="btn btn-sm"
              disabled={drop.isPending}
              onClick={() => {
                setErr(null);
                drop.mutate({}, { onError: (e) => setErr(errorMessage(e)) });
              }}
            >
              {drop.isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={3} />} Stop at end of period
            </button>
          </div>
        )}
        {plans.length ? (
          <ul>
            {plans.map((pl) => {
              const p = byPlan.get(pl.planId)!;
              return (
                <li key={pl.planId} className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4 last:border-0">
                  <div className="flex items-center gap-4">
                    {p.image && <img src={p.image} alt="" className="b3 h-12 w-12 bg-cream object-cover" loading="lazy" />}
                    <div>
                      <p className="font-extrabold">{p.name}</p>
                      <p className="text-sm font-semibold">{pl.monthly === 0 ? "Complimentary plan" : `${money(pl.monthly)}/mo`}</p>
                    </div>
                  </div>
                  <span className={`chip ${pl.canceling ? "bg-cream" : pl.status === "active" ? "bg-mint" : "bg-cream"}`}>
                    {pl.canceling ? `Ends ${endsOn(pl.periodEnd) ?? "at period end"}` : pl.status}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-6">
            <p className="font-bold">You don't have a subscription yet.</p>
            <Link to="/product/phase-1-launch" className="btn btn-sm">
              <Sparkles className="h-4 w-4" strokeWidth={3} /> All 13 tools · $99/mo
            </Link>
          </div>
        )}
        <p className="border-t-[3px] border-ink px-6 py-3 text-xs font-bold uppercase text-muted">
          Cancel or change cards in Manage billing (Stripe). Tools lock at the end of the paid period.
        </p>
      </section>

      {!!list?.length && (
        <section className="card mt-6 bg-paper">
          <header className="border-b-[3px] border-ink px-6 py-4"><h2 className="display text-2xl">Businesses</h2></header>
          <ul>
            {list.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink px-6 py-4 last:border-0">
                <Link to={`/dashboard?b=${b.id}`} className="ulink inline-flex items-center gap-1 font-extrabold">
                  {b.name} <ArrowUpRight className="h-4 w-4" strokeWidth={3} />
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-quiet"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm(`Delete ${b.name} and everything generated for it, including its website and contacts? This can't be undone.`)) {
                      remove.mutate({ id: b.id });
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
