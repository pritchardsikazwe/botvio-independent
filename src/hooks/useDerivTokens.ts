import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface DerivTokenRow {
  id: string;
  loginid: string;
  is_virtual: boolean;
  currency: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

export const useDerivTokens = () => {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<DerivTokenRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = useCallback(async () => {
    if (!user) { setTokens([]); return; }
    setLoading(true);

    // Never persist or query raw Deriv credentials from Supabase.
    // The active credential is scoped to this browser tab/session.
    const raw = sessionStorage.getItem("deriv_pat_token") || sessionStorage.getItem("deriv_oauth_token");
    const loginid = sessionStorage.getItem("deriv_loginid");
    const is_virtual = sessionStorage.getItem("deriv_is_virtual") === "true";
    const currency = sessionStorage.getItem("deriv_currency");

    setTokens(raw && loginid && currency ? [{
      id: `session-${loginid}`,
      loginid,
      is_virtual,
      currency,
      label: is_virtual ? "Demo" : "Real",
      is_active: true,
      created_at: new Date().toISOString(),
    }] : []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const activeToken = tokens.find((t) => t.is_active) ?? null;

  const upsertToken = useCallback(async (params: {
    loginid: string;
    is_virtual: boolean;
    currency: string;
    token_encrypted: string;
    label?: string;
  }) => {
    if (!user) return;
    sessionStorage.setItem("deriv_loginid", params.loginid);
    sessionStorage.setItem("deriv_is_virtual", String(params.is_virtual));
    sessionStorage.setItem("deriv_currency", params.currency);
    await fetchTokens();
  }, [user?.id, fetchTokens]);

  const switchToken = useCallback(async (tokenId: string) => {
    if (!user || !tokenId.startsWith("session-")) return;
    await fetchTokens();
  }, [user?.id, fetchTokens]);

  const removeToken = useCallback(async (tokenId: string) => {
    if (!user || !tokenId.startsWith("session-")) return;
    sessionStorage.removeItem("deriv_pat_token");
    sessionStorage.removeItem("deriv_oauth_token");
    sessionStorage.removeItem("deriv_loginid");
    sessionStorage.removeItem("deriv_is_virtual");
    sessionStorage.removeItem("deriv_currency");
    window.dispatchEvent(new CustomEvent("deriv:token-cleared"));
    await fetchTokens();
  }, [user?.id, fetchTokens]);

  return {
    tokens,
    activeToken,
    loading,
    upsertToken,
    switchToken,
    removeToken,
    refetch: fetchTokens,
  };
};
