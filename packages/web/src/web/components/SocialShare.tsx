import { useState } from "react";
import { Share2, Check, Copy, ArrowUpRight, MessageSquareShare } from "lucide-react";
import type { Product } from "../../api/catalog";

interface SocialShareProps {
  product: Product;
  className?: string;
}

export function SocialShare({ product, className = "" }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  // Fallback to origin or website URL if window is undefined
  const currentUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://1clickbiz.com/product/${product.slug}`;

  const shareText = `Check out ${product.name} on 1 Click Business — ${product.tagline}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(currentUrl)}`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is blocked
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} — 1 Click Business`,
          text: shareText,
          url: currentUrl,
        });
      } catch {
        // User canceled or share failed
      }
    }
  };

  const hasNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      className={`b3 hard bg-paper border-3 border-ink p-6 md:p-8 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted mb-1">
            <Share2 className="h-4 w-4" strokeWidth={2.75} />
            <span>Spread the Word</span>
          </div>
          <h3 className="display text-2xl md:text-3xl text-ink">
            Share {product.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-muted max-w-xl">
            Know a founder, freelancer, or builder launching a project? Share this tool to help them launch faster.
          </p>
        </div>

        {/* Share Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Twitter / X */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm !bg-black !text-white hover:!bg-neutral-800 transition-colors flex items-center gap-2 no-underline"
            title="Share on Twitter / X"
            aria-label="Share on Twitter / X"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Share on X</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </a>

          {/* LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm !bg-[#0A66C2] !text-white hover:!bg-[#004182] transition-colors flex items-center gap-2 no-underline"
            title="Share on LinkedIn"
            aria-label="Share on LinkedIn"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </a>

          {/* Native Mobile Share if supported */}
          {hasNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="btn btn-sm btn-quiet flex items-center gap-2"
              title="Share with friends"
            >
              <MessageSquareShare className="h-4 w-4" />
              <span>Share…</span>
            </button>
          )}

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`btn btn-sm transition-colors flex items-center gap-2 ${
              copied
                ? "!bg-emerald-500 !text-white !border-emerald-600 font-black"
                : "btn-quiet"
            }`}
            title="Copy link to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
