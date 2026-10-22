import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Heart, Plus, ShoppingBag, Trash2, ArrowLeft } from "lucide-react";
import { useWishlist } from "../lib/wishlist";
import { useCart } from "../lib/cart";
import { money } from "../lib/format";
import { PRODUCTS, type Product } from "../../api/catalog";
import { GridCard } from "../components/product-card";

export default function WishlistPage() {
  const { items, count, clear } = useWishlist();
  const { add: addToCart } = useCart();
  const [selectedCat, setSelectedCat] = useState("all");

  const wishlistedProducts = useMemo(() => {
    return items
      .map((item) => PRODUCTS.find((p) => p.slug === item.slug))
      .filter((p): p is Product => Boolean(p));
  }, [items]);

  const categories = useMemo(() => {
    const cats = new Set(wishlistedProducts.map((p) => p.category));
    return ["all", ...Array.from(cats)];
  }, [wishlistedProducts]);

  const filtered = useMemo(() => {
    if (selectedCat === "all") return wishlistedProducts;
    return wishlistedProducts.filter((p) => p.category === selectedCat);
  }, [wishlistedProducts, selectedCat]);

  const subtotal = wishlistedProducts.reduce((sum, p) => sum + p.price, 0);

  const handleAddAll = () => {
    for (const product of wishlistedProducts) {
      addToCart(product, { open: false });
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-extrabold uppercase no-underline hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} /> Back to shop
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-[3px] border-ink pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center bg-rose-50 text-rose-600 b3 border-2 border-ink">
              <Heart className="h-6 w-6 fill-rose-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-muted">
              Saved Tools · {count} {count === 1 ? "Product" : "Products"}
            </span>
          </div>
          <h1 className="display mt-2 text-6xl md:text-8xl text-ink">My Wishlist</h1>
          <p className="mt-2 text-lg font-bold text-muted">
            Tools you're considering for your business launch. Saved to your browser and account.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="b3 bg-cream p-4 border-2 border-ink flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-muted">
                Total saved value
              </p>
              <p className="display text-3xl text-ink">
                {money(subtotal)}
                <span className="font-sans text-sm font-bold">/mo</span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAddAll}
                className="btn btn-yellow flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" strokeWidth={3} />
                <span>Add all to cart</span>
              </button>
              <button
                type="button"
                onClick={clear}
                className="btn btn-quiet flex items-center gap-1.5"
                title="Clear all saved products"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {wishlistedProducts.length === 0 ? (
        <div className="mx-auto max-w-xl py-24 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-cream b3 border-3 border-ink text-ink mb-6">
            <Heart className="h-10 w-10 text-muted stroke-[2.5]" />
          </div>
          <h2 className="display text-4xl text-ink">Your wishlist is empty.</h2>
          <p className="mt-3 text-base font-semibold text-muted">
            You haven't saved any tools yet. Browse the catalog and tap the heart icon on any tool card to keep track of ideas for your launch.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/shop" className="btn btn-yellow">
              <ShoppingBag className="h-5 w-5" /> Explore all tools
            </Link>
            <Link to="/product/phase-1-launch" className="btn btn-quiet">
              View Phase 1 bundle ($99/mo)
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Category filter tabs */}
          {categories.length > 2 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`chip cursor-pointer px-3.5 py-1.5 text-xs font-black uppercase tracking-wider ${
                    selectedCat === cat
                      ? "bg-ink text-sun"
                      : "bg-paper hover:bg-cream"
                  }`}
                >
                  {cat === "all" ? "All saved" : cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid of Wishlisted Products */}
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <GridCard key={product.slug} p={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
