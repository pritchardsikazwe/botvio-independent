import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let active = true;
    const next = safeNext(searchParams.get("next"));

    const finish = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session?.user) {
        navigate(next, { replace: true });
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        navigate(next, { replace: true });
      }
    });

    void finish();

    const timeout = window.setTimeout(() => {
      if (active) navigate("/?authError=google", { replace: true });
    }, 10000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Completing Google sign-in…</span>
      </div>
    </div>
  );
}
