import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "../lib/cart";
import { WishlistProvider } from "../lib/wishlist";
import { authClient } from "../lib/auth";
import { FirebaseProvider } from "../context/FirebaseContext";

import { QuickStartProvider } from "../context/QuickStartContext";

const queryClient = new QueryClient();

export function Provider({ children }: { children: React.ReactNode }) {
  // Completes a returning managed (Google) sign-in that used a full-page redirect instead of the popup.
  useEffect(() => {
    authClient.managedAuth
      .handleRedirect()
      .then(() => queryClient.invalidateQueries())
      .catch(() => undefined);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseProvider>
        <WishlistProvider>
          <CartProvider>
            <QuickStartProvider>{children}</QuickStartProvider>
          </CartProvider>
        </WishlistProvider>
      </FirebaseProvider>
    </QueryClientProvider>
  );
}
