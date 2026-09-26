import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDeriv } from "@/contexts/DerivContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, CheckCircle, XCircle, ExternalLink, 
  Key, User, Wifi, WifiOff, RefreshCw, Shield, Globe
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getDerivConfig, resolveDerivEnv } from "@/config/derivEnv";
import { setDerivSessionToken, clearDerivSessionToken } from "@/lib/derivAuth";


interface DerivConnectionPanelProps {
  onConnected?: (balance: any) => void;
  showAccountSelection?: boolean;
}

export const DerivConnectionPanel = ({ onConnected, showAccountSelection = true }: DerivConnectionPanelProps) => {
  const { user } = useAuth();
  const { connected, authorized, balance, error, loading, connect, disconnect, refreshDerivConnection } = useDeriv();
  

  const [connectionMethod, setConnectionMethod] = useState<"token" | "oauth">("token");
  const [apiToken, setApiToken] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(showAccountSelection);
  const [accountLabel, setAccountLabel] = useState("");
  const [storedConnection, setStoredConnection] = useState<any>(null);

  const derivConfig = getDerivConfig();
  const currentEnv = resolveDerivEnv();



  // Load existing connection from database
  useEffect(() => {
    const loadStoredConnection = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("deriv_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("env", currentEnv)
        .single();
      if (data) setStoredConnection(data);
    };
    loadStoredConnection();
  }, [user, currentEnv]);

  const handleTokenVerify = async () => {
    if (!apiToken.trim()) { toast.error("Please enter your Deriv PAT"); return; }
    if (apiToken.length < 10) { toast.error("Invalid PAT format"); return; }

    setIsVerifying(true);
    try {
      // No Supabase Edge Function is required for PAT connections.
      // The Deriv WebSocket client performs the live authorization directly.
      const connectedBalance = await connect(apiToken.trim());
      setDerivSessionToken(apiToken.trim());

      if (user) {
        const label = accountLabel || `Deriv ${connectedBalance.loginid}`;
        const { error: saveError } = await supabase.from("trading_accounts").insert({
          user_id: user.id,
          broker: "deriv",
          label,
          api_key_encrypted: "session-active",
          api_secret_encrypted: null,
          login_id: connectedBalance.loginid,
          connection_type: "pat",
          connection_status: "connected",
          is_virtual: connectedBalance.loginid?.startsWith("VRTC") ?? false,
        });
        if (saveError) {
          console.warn("Connection metadata was not saved:", saveError.message);
        }
      }

      toast.success(`Deriv connected: ${connectedBalance.loginid}`);
      onConnected?.({
        loginid: connectedBalance.loginid,
        balance: connectedBalance.balance,
        currency: connectedBalance.currency,
      });
    } catch (e: any) {
      toast.error(e?.message || "Deriv connection failed. Check the PAT and try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  const handleDisconnect = async () => {
    disconnect();
    clearDerivSessionToken();
    setApiToken("");
    if (user) {
      await supabase
        .from("deriv_connections")
        .update({ is_connected: false })
        .eq("user_id", user.id)
        .eq("env", currentEnv);
      setStoredConnection(null);
    }
    toast.info("Disconnected from Deriv");
  };

  const handleHealthCheck = async () => {
    if (!user) return;
    setIsVerifying(true);
    try {
      const ok = await refreshDerivConnection();
      if (ok) {
        toast.success("Connection is healthy!");
      } else {
        toast.warning("Connection needs re-verification. Please reconnect your Deriv PAT.");
      }
      const { data: conn } = await supabase
        .from("deriv_connections")
        .select("*")
        .eq("user_id", user.id)
        .eq("env", currentEnv)
        .maybeSingle();
      setStoredConnection(conn);
    } catch (e: any) {
      toast.error(e?.message || "Health check failed");
    } finally {
      setIsVerifying(false);
    }
  };
  const getConnectionStatus = () => {
    if (loading || isConnecting || isVerifying) return "connecting";
    if (authorized && connected) return "connected";
    if (connected && !authorized) return "connected_no_auth";
    if (error) return "error";
    return "disconnected";
  };

  const status = getConnectionStatus();
  const oauthButtonDisabled = true;
  const oauthButtonText = "OAuth temporarily unavailable";

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Deriv Connection
            </CardTitle>
            <CardDescription>
              Connect your Deriv account to enable trading
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              {currentEnv.toUpperCase()}
            </Badge>
            <Badge
              variant={status === "connected" ? "default" : status === "connecting" ? "secondary" : "outline"}
              className={
                status === "connected"
                  ? "bg-success text-success-foreground"
                  : status === "error"
                  ? "bg-destructive text-destructive-foreground"
                  : ""
              }
            >
              {status === "connected" && <Wifi className="h-3 w-3 mr-1" />}
              {status === "disconnected" && <WifiOff className="h-3 w-3 mr-1" />}
              {status === "connecting" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
              {status === "error" && <XCircle className="h-3 w-3 mr-1" />}
              {status === "connected"
                ? "Connected"
                : status === "connecting"
                ? "Connecting..."
                : status === "error"
                ? "Error"
                : "Disconnected"}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
          <p>Client ID: <strong>{derivConfig.clientId}</strong> | Domain: <strong>{derivConfig.baseDomain}</strong></p>
        </div>
      </CardHeader>
      <CardContent>
        {storedConnection && (
          <div className="mb-4 p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Stored Connection</p>
                <p className="text-xs text-muted-foreground">
                  {storedConnection.login_id || "Unknown"} • {storedConnection.connection_type} • 
                  {storedConnection.is_connected ? " Connected" : " Disconnected"}
                </p>
                {storedConnection.last_verified_at && (
                  <p className="text-xs text-muted-foreground">
                    Last verified: {new Date(storedConnection.last_verified_at).toLocaleString()}
                  </p>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={handleHealthCheck} disabled={isVerifying}>
                {isVerifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}

        {authorized ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">{balance?.fullname || "Deriv Account"}</p>
                    <p className="text-sm text-muted-foreground">{balance?.loginid}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {balance?.balance?.toFixed(2)} {balance?.currency}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {balance?.loginid?.startsWith("VRTC") ? "Demo" : "Real"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleDisconnect}>
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={connectionMethod} onValueChange={(v) => setConnectionMethod(v as "token" | "oauth")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="oauth" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Deriv Login
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">
                    Server setup required
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="token" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  PAT
                </TabsTrigger>
              </TabsList>

              <TabsContent value="token" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="api_token">Personal Access Token (PAT)</Label>
                  <Input
                    id="api_token"
                    type="password"
                    placeholder="Paste your new Deriv PAT"
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    disabled={isConnecting || isVerifying}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your PAT is authorized directly by the Botvio Deriv client and kept only for the current browser session.
                  </p>
                </div>

                {showAccountSelection && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="account_label">Account Label (optional)</Label>
                      <Input
                        id="account_label"
                        placeholder="e.g., My Trading Account"
                        value={accountLabel}
                        onChange={(e) => setAccountLabel(e.target.value)}
                        disabled={isConnecting || isVerifying}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="save_account"
                        checked={saveToAccount}
                        onChange={(e) => setSaveToAccount(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="save_account" className="text-sm cursor-pointer">
                        Save account metadata (credential stays session-only)
                      </Label>
                    </div>
                  </>
                )}

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Legacy API tokens are no longer accepted. Use a new
                    <strong> Personal Access Token (PAT)</strong> created on the
                    updated Deriv API page.
                  </AlertDescription>
                </Alert>

                <Button
                  className="w-full"
                  onClick={handleTokenVerify}
                  disabled={isVerifying || isSaving || !apiToken.trim()}
                >
                  {isVerifying || isSaving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Verifying PAT...</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2" />Verify &amp; Save PAT</>
                  )}
                </Button>

                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p className="font-medium mb-2">How to get your Personal Access Token (PAT):</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>
                      <a href="https://track.deriv.com/_a_gq1w0BG0D1hit6RV3zsGNd7ZgqdRLk/1/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Log in to Deriv
                      </a>{" "}or{" "}
                      <a href="https://track.deriv.com/_a_gq1w0BG0D1hit6RV3zsGNd7ZgqdRLk/1/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        create a free demo account
                      </a>
                    </li>
                    <li>
                      Open{" "}
                      <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Settings → API Token
                      </a>
                    </li>
                    <li>
                      Create a <strong>Personal Access Token (PAT)</strong> with
                      {" "}<strong>Read</strong> and <strong>Trade</strong> scopes
                    </li>
                    <li>Copy and paste it above, then click Verify &amp; Save</li>
                  </ol>
                  <a href="https://app.deriv.com/account/api-token" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary mt-2 hover:underline">
                    Open Deriv PAT page <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setConnectionMethod("oauth")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  ← Skip the PAT — sign in with your Deriv account instead
                </button>
              </TabsContent>

              <TabsContent value="oauth" className="space-y-4 mt-4">
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Sign in with Deriv</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    One‑click redirect to Deriv. Log in with your Deriv account and we'll
                    finish the connection here — no PAT needed.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>No API token to copy or paste</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Secure OAuth 2.0 with PKCE — you stay on Deriv to sign in</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Auto‑syncs balance, currency & real/demo account</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Revoke anytime from Deriv → Security settings</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => toast.info("OAuth requires a server-side token exchange. Use PAT connection for now.")}
                  disabled={oauthButtonDisabled}
                >
                  {loginInProgress ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{oauthButtonText}</>
                  ) : (
                    <><ExternalLink className="h-4 w-4 mr-2" />{oauthButtonText}</>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You'll be redirected to <strong>auth.deriv.com</strong> and returned to
                  <strong> {derivConfig.redirectUrl.replace(/^https?:\/\//, "")}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setConnectionMethod("token")}
                  className="w-full text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                >
                  Prefer a Personal Access Token? Switch to PAT →
                </button>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
