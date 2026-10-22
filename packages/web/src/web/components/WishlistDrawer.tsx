import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Plus, ShoppingBag, Trash2, X, ArrowRight, Sparkles } from "lucide-react";
import { useWishlist } from "../lib/wishlist";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { ProductArt } from "./product-art";
import { PRODUCTS } from "../../api/catalog";

export function WishlistDrawer() {
  const { items, count, open, setOpen, remove, clear } = useWishlist();
  const { add: addToCart, lines } = useCart();
  const [, navigate] = useLocation();

  // Close drawer on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const subtotal = items.reduce((s, i) => s + i.price, 0);

  const handleAddAllToCart = () => {
    for (const item of items) {
      const fullProduct = PRODUCTS.find((p) => p.slug === item.slug);
      if (fullProduct) {
        addToCart(fullProduct, { open: false });
      }
    }
    setOpen(false);
    navigate("/subscribe");
  };

  const handleMoveToCart = (slug: string) => {
    const fullProduct = PRODUCTS.find((p) => p.slug === slug);
    if (fullProduct) {
      addToCart(fullProduct, { open: true });
      // Keep in wishlist or remove - standard is to keep or prompt, let's keep it saved and add to cart
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" aria-label="Saved Wishlist">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 transition-opacity"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="b3 relative z-10 flex h-full w-full max-w-md flex-col border-r-0 border-y-0 bg-paper">
        {/* Header */}
        <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-6 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-rose-500 text-rose-500" strokeWidth={2.5} />
            <h2 className="display text-2xl text-ink">Wishlist</h2>
            <span className="chip bg-ink text-sun text-xs font-black ml-1">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="btn btn-sm btn-quiet !px-2"
            aria-label="Close wishlist drawer"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-cream b3 border-2 border-ink text-ink mb-4">
              <Heart className="h-8 w-8 text-muted stroke-[2.5]" />
            </div>
            <h3 className="display text-2xl text-ink">Nothing saved yet.</h3>
            <p className="mt-2 text-sm font-semibold text-muted max-w-xs">
              Click the heart icon on any tool card in the shop or product pages to save your favorite tools for later.
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/pricing");
              }}
              className="btn btn-yellow mt-6"
            >
              View Subscription Plans
            </button>
          </div>
        ) : (
          <>
            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between border-b-[3px] border-ink bg-cream px-5 py-2.5 text-xs font-extrabold uppercase">
              <span className="text-muted">Saved tools</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={clear}
                  className="hover:text-ink text-muted underline cursor-pointer"
                  title="Remove all items from saved tools"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="btn btn-sm !py-1 !px-2 text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={3} /> Subscribe to all
                </button>
              </div>
            </div>

            {/* List */}
            <ul className="flex-1 overflow-y-auto divide-y-[3px] divide-ink">
              {items.map((item) => {
                const inCart = lines.some((l) => l.slug === item.slug);
                return (
                  <li key={item.slug} className="flex gap-4 p-4 hover:bg-cream/40 transition-colors">
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="block shrink-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="b3 h-20 w-20 bg-ink object-cover"
                        />
                      ) : (
                        <ProductArt
                          tone={item.tone}
                          icon={item.icon}
                          num={item.num}
                          size="sm"
                          className="h-20 w-20 shrink-0"
                        />
                      )}
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted">
                            {item.category}
                          </span>
                          <Link
                            to={`/product/${item.slug}`}
                            onClick={() => setOpen(false)}
                            className="block"
                          >
                            <h4 className="display text-base leading-tight hover:underline">
                              {item.name}
                            </h4>
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          className="p-1 hover:bg-rose-100 rounded text-muted hover:text-rose-600 transition-colors"
                          aria-label={`Remove ${item.name} from wishlist`}
                          title="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
                        </button>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs font-semibold text-muted">
                        {item.tagline}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="display text-lg text-ink">
                          {money(item.price)}
                          <span className="font-sans text-xs normal-case">/mo</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleMoveToCart(item.slug)}
                          className={`btn btn-sm !py-1 !px-2.5 text-xs flex items-center gap-1 ${
                            inCart ? "btn-quiet" : "btn-yellow"
                          }`}
                        >
                          {inCart ? (
                            <>
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>In cart</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                              <span>Add to cart</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Footer */}
            <div className="border-t-[3px] border-ink bg-cream p-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-extrabold uppercase text-xs text-muted">Wishlist Total</span>
                <span className="display text-2xl text-ink">
                  {money(subtotal)}
                  <span className="font-sans text-sm normal-case font-bold">/mo</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="btn btn-quiet flex items-center justify-center gap-1"
                  onClick={() => {
                    setOpen(false);
                    navigate("/wishlist");
                  }}
                >
                  <span>Wishlist page</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn flex items-center justify-center gap-1"
                  onClick={handleAddAllToCart}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Subscribe all</span>
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
