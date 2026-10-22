import { Redirect, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { useSession } from "../queries/business";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <div className="flex items-center gap-3 font-extrabold uppercase">
        <Loader2 className="h-6 w-6 animate-spin" strokeWidth={3} /> {label}…
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending: sessionPending } = useSession();
  const { user: firebaseUser, loading: firebaseLoading } = useFirebase();
  const [location] = useLocation();

  if (sessionPending && firebaseLoading && !session) return <PageLoader />;
  if (!session && !firebaseUser) {
    return <Redirect to={`/login?next=${encodeURIComponent(location + window.location.search)}`} />;
  }
  return <>{children}</>;
}
