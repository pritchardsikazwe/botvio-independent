import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getDerivConfig } from "@/config/derivEnv";
import { clearPKCEStorage } from "@/lib/derivAuth";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const RETRY_COOLDOWN_KEY = "botvio_oauth_retry_at";
const OAUTH_COOLDOWN_KEY = "botvio_oauth_cooldown_until";

export default function DerivCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing Deriv connection...");
  const [searchParams] = useSearchParams();
  const [retryCountdown, setRetryCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setStatus("error");
    setMessage("Deriv OAuth is temporarily disabled because Botvio has no server-side token exchange configured. Return to Connections and use a Deriv PAT to connect.");
    clearPKCEStorage();
  }, []);

  // Retry countdown timer
  useEffect(() => {
    const checkRetry = () => {
      const retryAt = localStorage.getItem(RETRY_COOLDOWN_KEY);
      if (!retryAt) {
        setRetryCountdown(0);
        return;
      }
      const remaining = Math.max(0, Math.ceil((parseInt(retryAt, 10) - Date.now()) / 1000));
      setRetryCountdown(remaining);
    };

    checkRetry();
    const interval = setInterval(checkRetry, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = () => {
    if (retryCountdown > 0) return;
    navigate("/connections");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
            {status === "success" && <CheckCircle className="h-6 w-6 text-success" />}
            {status === "error" && <XCircle className="h-6 w-6 text-destructive" />}
            Deriv OAuth
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className={
            status === "error"
              ? "text-destructive"
              : status === "success"
              ? "text-success"
              : "text-muted-foreground"
          }>
            {message}
          </p>

          {status === "success" && (
            <p className="text-sm text-muted-foreground">
              Redirecting to accounts...
            </p>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <Button onClick={() => navigate("/accounts")} variant="outline" className="w-full">
                Go to Accounts
              </Button>
              <Button
                onClick={handleRetry}
                disabled={retryCountdown > 0}
                className="w-full"
              >
                {retryCountdown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry in {retryCountdown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
