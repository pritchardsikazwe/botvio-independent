import { useState, useCallback, useEffect } from "react";

export interface DerivTokenRow {
  id: string;
  loginid: string;
  is_virtual: boolean;
  currency: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

const SESSION_KEY = "botvio_deriv_account";

function readSessionAccount(): DerivTokenRow[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const row = JSON.parse(raw) as DerivTokenRow;
    return row?.loginid ? [row] : [];
  } catch {
    return [];
  }
}

export const useDerivTokens = () => {
  const [tokens, setTokens] = useState<DerivTokenRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setTokens(readSessionAccount());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  const activeToken = tokens.find((t) => t.is_active) ?? null;

  const upsertToken = useCallback(async (params: {
    loginid: string;
    is_virtual: boolean;
    currency: string;
    token_encrypted?: string;
    label?: string;
  }) => {
    const row: DerivTokenRow = {
      id: `session-${params.loginid}`,
      loginid: params.loginid,
      is_virtual: params.is_virtual,
      currency: params.currency,
      label: params.label ?? (params.is_virtual ? "Demo" : "Real"),
      is_active: true,
      created_at: new Date().toISOString(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(row));
    setTokens([row]);
  }, []);

  const switchToken = useCallback(async (_tokenId: string) => {
    await fetchTokens();
  }, [fetchTokens]);

  const removeToken = useCallback(async (_tokenId: string) => {
    sessionStorage.removeItem(SESSION_KEY);
    setTokens([]);
  }, []);

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
