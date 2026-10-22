import { useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "../../api/catalog";
import { useWishlist } from "../lib/wishlist";

interface WishlistButtonProps {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "icon" | "button";
}

export function WishlistButton({
  product,
  className = "",
  size = "md",
  showLabel = false,
  variant = "icon",
}: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.slug);
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    toggleWishlist(product);
    setTimeout(() => setAnimating(false), 400);
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={wishlisted}
        className={`btn transition-transform active:scale-95 flex items-center justify-center gap-2 ${
          wishlisted ? "bg-rose-50 border-rose-600 text-rose-600 hover:bg-rose-100" : "btn-quiet"
        } ${className}`}
      >
        <Heart
          className={`${iconSizes[size]} transition-transform ${
            wishlisted ? "fill-rose-500 text-rose-500" : "text-ink"
          } ${animating ? "scale-125" : "scale-100"}`}
          strokeWidth={wishlisted ? 2.5 : 2.75}
        />
        {showLabel && (
          <span className="font-extrabold text-sm uppercase">
            {wishlisted ? "Saved to Wishlist" : "Save for later"}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      aria-pressed={wishlisted}
      title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
      className={`group relative grid place-items-center b3 border-2 border-ink transition-all active:scale-90 ${
        size === "sm" ? "h-8 w-8" : size === "lg" ? "h-11 w-11" : "h-9 w-9"
      } ${
        wishlisted
          ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "bg-paper text-ink hover:bg-cream"
      } ${className}`}
    >
      <Heart
        className={`${iconSizes[size]} transition-all ${
          wishlisted ? "fill-rose-500 text-rose-500" : "text-ink group-hover:scale-110"
        } ${animating ? "scale-130" : "scale-100"}`}
        strokeWidth={wishlisted ? 2.5 : 2.5}
      />
    </button>
  );
}
