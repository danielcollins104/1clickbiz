import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Asterisk, BookOpen, CreditCard, Heart, LayoutDashboard, Menu, MousePointerClick, Sparkles, Trash2, UserRound, X, Zap, Check } from "lucide-react";
import { useCart } from "../lib/cart";
import { useWishlist } from "../lib/wishlist";
import { useQuickStart } from "../context/QuickStartContext";
import { useNotebook } from "../context/NotebookContext";
import { money } from "../lib/format";
import { ProductArt } from "./product-art";
import { useAdminStatus } from "../queries/admin";
import { useSession } from "../queries/business";
import { useFirebase } from "../context/FirebaseContext";
import { FAQ } from "./FAQ";
import { WishlistDrawer } from "./WishlistDrawer";
import { QuickStartModal } from "./QuickStartModal";
import { NotebookDrawer } from "./NotebookDrawer";
import { ExitIntentNotice } from "./ExitIntentNotice";
import { BUNDLE_SLUG, PRODUCTS } from "../../api/catalog";

const NAV = [
  { to: "/funnel", label: "Sales Funnel" },
  { to: "/start", label: "Start Wizard" },
  { to: "/dashboard", label: "My Dashboard" },
  { to: "/shop", label: "13 AI Tools" },
  { to: "/advisor", label: "StiltZ-Kin Advisor" },
  { to: "/pricing", label: "Pricing" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 no-underline ${className}`}>
      <span className="grid h-9 w-9 place-items-center bg-ink text-sun b3">
        <MousePointerClick className="h-5 w-5" strokeWidth={3} />
      </span>
      <span className="display text-lg leading-none">
        1 Click
        <br />
        <span className="text-sm">Business</span>
      </span>
    </Link>
  );
}

function Header() {
  const { count, setOpen, bump } = useCart();
  const { count: wishlistCount, setOpen: setWishlistOpen, bump: wishlistBump } = useWishlist();
  const { notes, openNotebook, bump: notebookBump } = useNotebook();
  const { openQuickStart } = useQuickStart();
  const { data: session, isPending } = useSession();
  const { user: firebaseUser, signInWithGoogle, signOut: signOutFirebase } = useFirebase();
  const { data: adminStatus } = useAdminStatus();
  const [menu, setMenu] = useState(false);
  const [location] = useLocation();
  useEffect(() => setMenu(false), [location]);

  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-ink bg-sun">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              className="px-3 py-1.5 text-sm font-extrabold uppercase tracking-wide no-underline hover:bg-ink hover:text-sun"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Start 1-Click Wizard Floating Action Button in Header */}
          <button
            type="button"
            onClick={() => openQuickStart()}
            className="group relative flex items-center gap-1.5 bg-ink text-sun px-2.5 sm:px-3 py-1.5 b3 border-2 border-ink shadow-[2.5px_2.5px_0px_#000] hover:bg-mint hover:text-ink hover:border-ink hover:shadow-[1px_1px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            title="Open Quick Start 1-Click Business Generation Wizard"
            aria-label="Quick Start 1-Click Business Wizard"
          >
            <Zap className="h-4 w-4 fill-sun text-sun group-hover:fill-ink group-hover:text-ink animate-pulse" strokeWidth={2.5} />
            <span className="font-black text-xs uppercase tracking-wider">Quick Start</span>
            <span className="hidden xl:inline-block bg-mint text-ink text-xs font-black px-1.5 py-0.5 border border-ink">
              1-CLICK
            </span>
          </button>

          {adminStatus?.allowed && <Link to="/admin" className="ulink hidden md:inline font-extrabold text-xs">Admin</Link>}

          {/* Firebase / Account Status Controls */}
          {firebaseUser || session?.user ? (
            <div className="hidden sm:flex items-center gap-2 bg-paper px-2 py-1 b3 border-2 border-ink">
              {(firebaseUser?.photoURL || session?.user?.image) ? (
                <img
                  src={firebaseUser?.photoURL || session?.user?.image || ""}
                  alt=""
                  className="h-6 w-6 rounded-full border border-ink object-cover"
                />
              ) : (
                <span className="grid h-6 w-6 place-items-center bg-sun text-ink text-xs font-bold b3">
                  {((firebaseUser?.displayName || session?.user?.name || firebaseUser?.email || session?.user?.email || "U")[0]).toUpperCase()}
                </span>
              )}
              <span className="text-xs font-bold truncate max-w-[100px]">
                {firebaseUser?.displayName || session?.user?.name || (firebaseUser?.email || session?.user?.email)?.split("@")[0]}
              </span>
              <button
                type="button"
                onClick={() => signOutFirebase()}
                className="text-[11px] font-extrabold text-muted hover:text-ink underline ml-1 cursor-pointer"
                title="Sign out"
              >
                Exit
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="hidden lg:inline-flex btn btn-sm btn-quiet !px-2.5 text-xs font-bold items-center gap-1.5 cursor-pointer"
              title="Sign in with Google"
            >
              <span>Google Sign-in</span>
            </button>
          )}

          {!isPending &&
            (session || firebaseUser ? (
              <Link to="/dashboard" className="btn btn-sm btn-yellow !px-3">
                <LayoutDashboard className="h-5 w-5" strokeWidth={2.75} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-sm btn-yellow !px-3">
                <UserRound className="h-5 w-5" strokeWidth={2.75} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            ))}

          {/* Slide-Out Founder Notebook Trigger */}
          <button
            type="button"
            onClick={() => openNotebook()}
            className="btn btn-sm btn-quiet relative !px-3 cursor-pointer"
            aria-label={`Open Founder Notebook, ${notes.length} notes`}
            title="Open Slide-Out Founder Notebook"
          >
            <BookOpen className="h-5 w-5" strokeWidth={2.75} />
            <span className="hidden sm:inline">Notebook</span>
            {notes.length > 0 && (
              <span
                key={notebookBump}
                className="pop grid h-6 min-w-6 place-items-center bg-mint text-ink border border-ink px-1 text-xs font-black"
              >
                {notes.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            className="btn btn-sm btn-quiet relative !px-3"
            aria-label={`Open wishlist, ${wishlistCount} items`}
            title="Saved Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} strokeWidth={2.75} />
            <span className="hidden lg:inline">Wishlist</span>
            {wishlistCount > 0 && (
              <span key={wishlistBump} className="pop grid h-6 min-w-6 place-items-center bg-rose-500 px-1 text-xs text-white font-black">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn btn-sm btn-quiet relative !px-3 cursor-pointer"
            aria-label={`Open subscription plan, ${count} selected`}
          >
            <CreditCard className="h-5 w-5" strokeWidth={2.75} />
            <span className="hidden sm:inline">{count > 0 ? "My Plan" : "Subscribe"}</span>
            {count > 0 && (
              <span key={bump} className="pop grid h-6 min-w-6 place-items-center bg-ink px-1 text-xs text-sun">
                {count}
              </span>
            )}
          </button>
          <button type="button" className="btn btn-sm btn-quiet !px-2 md:hidden" onClick={() => setMenu((m) => !m)} aria-label="Menu">
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="flex flex-col border-t-[3px] border-ink bg-sun md:hidden">
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              openQuickStart();
            }}
            className="display border-b-[3px] border-ink px-4 py-4 text-2xl no-underline flex items-center justify-between bg-sun hover:bg-mint transition-colors text-left w-full cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Zap className="h-6 w-6 fill-ink" />
              <span>Quick Start Wizard</span>
            </span>
            <span className="chip bg-ink text-sun text-xs font-black">1-CLICK</span>
          </button>
          {adminStatus?.allowed && <Link to="/admin" className="display border-b-[3px] border-ink px-4 py-4 text-2xl">Admin console</Link>}
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} className="display border-b-[3px] border-ink px-4 py-4 text-2xl no-underline">
              {n.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => {
              setMenu(false);
              openNotebook();
            }}
            className="display border-b-[3px] border-ink px-4 py-4 text-2xl no-underline flex items-center justify-between text-left w-full cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Founder Notebook</span>
            </span>
            <span className="chip bg-mint text-ink text-sm">{notes.length}</span>
          </button>
          <Link to="/wishlist" className="display border-b-[3px] border-ink px-4 py-4 text-2xl no-underline flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-rose-500 text-rose-500" />
              <span>Wishlist</span>
            </span>
            <span className="chip bg-ink text-sun text-sm">{wishlistCount}</span>
          </Link>
        </nav>
      )}
    </header>
  );
}

export function Ticker({ words, className = "" }: { words: string[]; className?: string }) {
  const row = [...words, ...words, ...words];
  return (
    <div className={`overflow-hidden border-y-[3px] border-ink bg-ink py-3 text-sun ${className}`}>
      <div className="marquee-track">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((w, i) => (
              <span key={i} className="display flex items-center gap-6 pr-6 text-2xl md:text-3xl">
                {w}
                <Asterisk className="h-7 w-7 text-mint" strokeWidth={3.5} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CartDrawer() {
  const { open, setOpen, lines, remove, subtotal, count, add } = useCart();
  const [, navigate] = useLocation();

  const hasBundle = lines.some((l) => l.slug === BUNDLE_SLUG);
  const bundle = PRODUCTS.find((p) => p.slug === BUNDLE_SLUG);
  const diffToBundle = bundle ? bundle.price - subtotal : 0;
  const bundleSaves = bundle && subtotal > bundle.price;

  const crossSellProducts = !hasBundle
    ? PRODUCTS.filter((p) => p.slug !== BUNDLE_SLUG && !lines.some((l) => l.slug === p.slug)).slice(0, 2)
    : [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close subscription drawer" className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
      <aside className="drawer absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l-[3px] border-ink bg-paper">
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-5 py-4">
          <h2 className="display text-3xl">Your Subscription</h2>
          <button type="button" className="btn btn-sm btn-quiet !px-2" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between p-6 overflow-y-auto">
            <div className="b3 hard bg-ink p-5 text-sun">
              <span className="border border-ink bg-mint px-2.5 py-0.5 text-xs font-black uppercase text-ink">
                Most Popular · Save $115/mo
              </span>
              <h3 className="display mt-3 text-3xl text-sun">
                Phase 1 — All-Access Pass
              </h3>
              <p className="mt-2 text-xs font-semibold text-cream/90 leading-relaxed">
                Unlock all 13 AI launch engines on one monthly subscription. Answer 8 questions once and every tool builds in sequence.
              </p>
              <div className="mt-4 flex items-baseline gap-2 border-y border-sun/30 py-3">
                <span className="display text-5xl text-sun">{bundle ? money(bundle.price) : "$99"}</span>
                <span className="text-sm font-bold text-cream">/month · Cancel anytime</span>
              </div>
              <ul className="mt-4 space-y-2 text-xs font-bold text-cream">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-mint" strokeWidth={3} /> All 13 AI Launch Engines unlocked</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-mint" strokeWidth={3} /> 500 AI generations every month</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-mint" strokeWidth={3} /> Free hosted live website &amp; CRM</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-mint" strokeWidth={3} /> 14-Day 100% Money-Back Guarantee</li>
              </ul>
              <button
                type="button"
                className="btn btn-yellow mt-5 w-full font-black text-ink border-sun shadow-[3px_3px_0px_#79e784] cursor-pointer"
                onClick={() => {
                  if (bundle) add(bundle, { open: false });
                  setOpen(false);
                  navigate("/subscribe");
                }}
              >
                <Zap className="h-4 w-4 fill-ink" /> Start All-Access Subscription
              </button>
            </div>

            <div className="mt-6 space-y-3 border-t-2 border-ink pt-4 text-center">
              <p className="text-xs font-bold text-muted">
                Want a 3-tool stage stack or a single AI engine instead?
              </p>
              <button
                type="button"
                className="btn btn-quiet w-full text-xs font-black cursor-pointer"
                onClick={() => {
                  setOpen(false);
                  navigate("/pricing");
                }}
              >
                Compare All Subscription Plans
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Bundle Upsell & Savings Trigger */}
            {!hasBundle && bundle && diffToBundle > 0 && (
              <div className="border-b-[3px] border-ink bg-sun p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase text-ink">
                    <Zap className="h-4 w-4 fill-ink" /> All-Access Upgrade
                  </span>
                  <span className="bg-mint text-ink text-xs font-black px-1.5 py-0.5 border border-ink">Save $115/mo</span>
                </div>
                <p className="mt-1 text-xs font-extrabold text-ink leading-snug">
                  Add <strong>{money(diffToBundle)}/mo</strong> more to unlock all 13 Phase 1 engines and 500 AI generations/mo.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    lines.forEach((l) => remove(l.key));
                    add(bundle, { open: true });
                  }}
                  className="btn btn-sm btn-yellow mt-2.5 w-full text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Switch to All-Access Pass ({money(bundle.price)}/mo)
                </button>
              </div>
            )}

            {!hasBundle && bundle && bundleSaves && (
              <div className="border-b-[3px] border-ink bg-mint p-4 text-ink">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase text-ink">
                    <Sparkles className="h-4 w-4 fill-ink" /> Instant Savings Alert
                  </span>
                  <span className="bg-ink text-sun text-xs font-black px-1.5 py-0.5 border border-ink">
                    Save {money(subtotal - bundle.price)}/mo
                  </span>
                </div>
                <p className="mt-1 text-xs font-extrabold leading-snug">
                  You selected {money(subtotal)}/mo in single tools. Switch to the All-Access Subscription to get <strong>all 13 tools and save {money(subtotal - bundle.price)}/mo</strong>!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    lines.forEach((l) => remove(l.key));
                    add(bundle, { open: true });
                  }}
                  className="btn btn-sm bg-ink text-sun mt-2.5 w-full text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Switch to All-Access ({money(bundle.price)}/mo) &amp; Save
                </button>
              </div>
            )}

            <ul className="flex-1 overflow-y-auto">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 border-b-[3px] border-ink p-4">
                  <ProductArt tone={l.tone} icon={l.icon} num={l.num} size="sm" className="h-20 w-20 shrink-0" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="display text-base leading-tight">{l.name}</p>
                      <button type="button" onClick={() => remove(l.key)} aria-label="Remove" className="shrink-0 p-1 hover:bg-sun">
                        <Trash2 className="h-4 w-4" strokeWidth={2.75} />
                      </button>
                    </div>
                    <p className="text-xs font-extrabold uppercase tracking-wide">Monthly subscription</p>
                    <div className="mt-auto flex items-center justify-end pt-2">
                      <span className="display text-lg">
                        {money(l.price)}
                        <span className="font-sans text-xs normal-case">/mo</span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {crossSellProducts.length > 0 && (
              <div className="border-t-[3px] border-ink bg-sun/30 p-3.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-ink mb-2 flex items-center justify-between">
                  <span>Add companion engine to plan:</span>
                  <span className="text-muted font-bold">1-Click Add</span>
                </p>
                <div className="space-y-2">
                  {crossSellProducts.map((p) => (
                    <div key={p.slug} className="flex items-center justify-between gap-2 bg-paper p-2 b3 border border-ink shadow-[1px_1px_0px_#000]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 shrink-0 overflow-hidden b3 border border-ink">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <ProductArt tone={p.tone} icon={p.icon} num={p.num} size="sm" className="h-full w-full border-0" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="display text-xs truncate">{p.name}</p>
                          <p className="text-[10px] font-bold text-muted">{money(p.price)}/mo</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => add(p, { open: true })}
                        className="btn btn-sm btn-yellow text-[10px] font-black !py-1 !px-2.5 shadow-[1px_1px_0px_#000] shrink-0 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-[3px] border-ink bg-cream p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-extrabold uppercase">Monthly Plan</span>
                <span className="display text-3xl">{money(subtotal)}<span className="font-sans text-sm normal-case">/mo</span></span>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted">Billed monthly through Stripe · Cancel anytime in 1 click.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="btn btn-quiet text-xs font-black border-2 border-ink cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                    navigate("/pricing");
                  }}
                >
                  Change Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    navigate("/subscribe");
                  }}
                  className="btn btn-yellow text-xs font-black shadow-[3px_3px_0px_#000] cursor-pointer"
                >
                  Continue to Subscribe
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t-[3px] border-ink bg-ink text-sun">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <p className="display text-3xl md:text-4xl">Idea to open for business. Automatically.</p>
          <Link to="/start" className="btn btn-yellow mt-6 border-sun" style={{ boxShadow: "6px 6px 0 #79e784" }}>
            Start your business
          </Link>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-mint">Platform &amp; Plans</p>
          <ul className="space-y-2 font-bold">
            <li><Link to="/pricing" className="no-underline hover:underline">Subscription Plans</Link></li>
            <li><Link to="/product/phase-1-launch" className="no-underline hover:underline">All-Access Pass ($99/mo)</Link></li>
            <li><Link to="/shop" className="no-underline hover:underline">All 13 AI Launch Engines</Link></li>
            <li><Link to="/advisor" className="no-underline hover:underline">StiltZ-Kin™ Sovereign Advisor</Link></li>
            <li><Link to="/wishlist" className="no-underline hover:underline flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> Saved Tools</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-extrabold uppercase tracking-widest text-mint">Company</p>
          <ul className="space-y-2 font-bold">
            <li><Link to="/dashboard" className="no-underline hover:underline">Your dashboard</Link></li>
            <li><Link to="/account" className="no-underline hover:underline">Billing &amp; subscription</Link></li>
            <li>Monthly plans · cancel anytime</li>
            <li><Link to="/terms" className="no-underline hover:underline">Terms</Link></li>
            <li><Link to="/privacy" className="no-underline hover:underline">Privacy</Link></li>
            <li><Link to="/refunds" className="no-underline hover:underline">Refund policy</Link></li>
            <li><Link to="/contact" className="no-underline hover:underline">Contact support</Link></li>
          </ul>
        </div>
      </div>
      <FAQ />
      <div className="overflow-hidden border-t-[3px] border-sun">
        <p className="display whitespace-nowrap px-4 py-4 text-[13.5vw] leading-[0.85] md:px-8">1 Click Biz</p>
      </div>
      <div className="flex flex-col justify-between gap-2 border-t-[3px] border-sun px-4 py-4 text-xs font-bold uppercase md:flex-row md:px-8">
        <span>© 2026 AI Service Hub LLC · 1 Click Business · Created by Daniel Collins</span>
        <span>One click. Whole business.</span>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { openQuickStart } = useQuickStart();

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [location]);

  // Generated customer sites render without the store chrome.
  if (location.startsWith("/sites/")) return <>{children}</>;
  return (
    <div className="min-h-screen">
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
      <NotebookDrawer />
      <QuickStartModal />
      <ExitIntentNotice />

      {/* Floating Action Button (FAB) for users to trigger the 1-Click Business Generation Wizard from anywhere */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => openQuickStart()}
          className="group flex items-center gap-2 bg-sun text-ink border-[3px] border-ink px-4 py-2.5 font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_#000] hover:bg-mint hover:shadow-[2px_2px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer"
          title="Open Quick Start 1-Click Business Generator"
          aria-label="Open Quick Start 1-Click Business Generator"
        >
          <span className="grid h-6 w-6 place-items-center bg-ink text-sun border border-ink">
            <Zap className="h-4 w-4 fill-sun text-sun animate-pulse" />
          </span>
          <span className="text-sm font-black hidden xs:inline">Quick Start</span>
          <span className="bg-ink text-mint text-xs font-black px-1.5 py-0.5 border border-ink">1-CLICK</span>
        </button>
      </div>
    </div>
  );
}
