import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Checking your session…</div>
      </div>
    );
  }

  if (!user) {
    const next = location.pathname + location.search + location.hash;
    return <Navigate to={"/?authRequired=1&next=" + encodeURIComponent(next)} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
