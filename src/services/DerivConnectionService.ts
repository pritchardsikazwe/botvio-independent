import { supabase } from "@/integrations/supabase/client";
import { resolveDerivEnv, getDerivPublicWebSocketUrl } from "@/config/derivEnv";
import { normalizeDerivError } from "@/lib/derivErrors";
import { getStoredDerivToken, setDerivSessionToken, clearDerivSessionToken } from "@/lib/derivAuth";
import { DerivWebSocketService } from "@/services/derivWebSocket";

export interface DerivConnectionInfo {
  provider: "deriv";
  connectionId?: string;
  accountId: string | null;
  accountType: "REAL" | "DEMO" | null;
  currency: string | null;
  environment: "PROD" | "DEV";
  authType: "token" | "oauth" | null;
  connected: boolean;
  lastVerifiedAt?: string | null;
  lastError?: string | null;
}

export interface DerivAccountSummary {
  id: string;
  accountId: string;
  accountType: "REAL" | "DEMO";
  currency: string;
  label: string | null;
  active: boolean;
}

const env = () => resolveDerivEnv();
const envLabel = (): "PROD" | "DEV" => (env() === "prod" ? "PROD" : "DEV");

const emptyConnection = (): DerivConnectionInfo => ({
  provider: "deriv",
  accountId: null,
  accountType: null,
  currency: null,
  environment: envLabel(),
  authType: null,
  connected: false,
});

const mapRow = (row: any): DerivConnectionInfo => ({
  provider: "deriv",
  connectionId: row.id,
  accountId: row.login_id ?? null,
  accountType: row.account_type === "demo" ? "DEMO" : row.account_type === "real" ? "REAL" : null,
  currency: row.currency ?? null,
  environment: row.env === "prod" ? "PROD" : "DEV",
  authType: row.connection_type === "oauth" ? "oauth" : "token",
  connected: !!row.is_connected,
  lastVerifiedAt: row.last_verified_at ?? null,
  lastError: row.last_error ? normalizeDerivError(row.last_error) : null,
});

const sessionAccount = (): DerivAccountSummary | null => {
  try {
    const raw = sessionStorage.getItem("botvio_deriv_account");
    if (!raw) return null;
    const account = JSON.parse(raw);
    if (!account?.loginid) return null;
    return {
      id: account.id ?? account.loginid,
      accountId: account.loginid,
      accountType: account.is_virtual ? "DEMO" : "REAL",
      currency: account.currency ?? "USD",
      label: account.label ?? null,
      active: account.is_active !== false,
    };
  } catch {
    return null;
  }
};

export const DerivConnectionService = {
  async connect(token: string): Promise<DerivConnectionInfo> {
    if (!token?.trim()) throw new Error("Deriv token is required");

    const socket = new DerivWebSocketService({
      url: getDerivPublicWebSocketUrl(),
      autoReconnect: false,
      keepAlive: false,
    });

    try {
      await socket.open();
      const balance = await socket.authorize(token.trim());
      setDerivSessionToken(token.trim());

      const account = socket.account;
      const existing = await DerivConnectionService.getConnectionStatus();

      return {
        ...existing,
        provider: "deriv",
        accountId: balance.loginid ?? account?.loginid ?? null,
        accountType: account?.is_virtual ? "DEMO" : "REAL",
        currency: balance.currency ?? account?.currency ?? null,
        environment: envLabel(),
        authType: "token",
        connected: true,
        lastVerifiedAt: new Date().toISOString(),
        lastError: null,
      };
    } catch (error: any) {
      throw new Error(normalizeDerivError(error?.message || "Deriv authorization failed"));
    } finally {
      socket.close();
    }
  },

  async verify(): Promise<DerivConnectionInfo> {
    const token = getStoredDerivToken();
    const current = (await DerivConnectionService.getConnectionStatus()) ?? emptyConnection();

    if (!token) {
      return { ...current, connected: false, lastError: "No active Deriv session credential" };
    }

    try {
      return await DerivConnectionService.connect(token);
    } catch (error: any) {
      return {
        ...current,
        connected: false,
        lastError: normalizeDerivError(error?.message || "Deriv verification failed"),
      };
    }
  },

  async getAccounts(): Promise<DerivAccountSummary[]> {
    const account = sessionAccount();
    return account ? [account] : [];
  },

  async getActiveAccount(): Promise<DerivAccountSummary | null> {
    return sessionAccount();
  },

  async getConnectionStatus(): Promise<DerivConnectionInfo> {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return emptyConnection();

    const { data } = await supabase
      .from("deriv_connections")
      .select("*")
      .eq("user_id", uid)
      .eq("env", env())
      .maybeSingle();

    if (!data) {
      const account = sessionAccount();
      return account
        ? {
            ...emptyConnection(),
            accountId: account.accountId,
            accountType: account.accountType,
            currency: account.currency,
            authType: "token",
            connected: true,
            lastVerifiedAt: new Date().toISOString(),
          }
        : emptyConnection();
    }

    return mapRow(data);
  },

  async disconnect(): Promise<void> {
    clearDerivSessionToken();

    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes?.user?.id;
    if (!uid) return;

    await supabase
      .from("deriv_connections")
      .update({ is_connected: false })
      .eq("user_id", uid)
      .eq("env", env());
  },
};
