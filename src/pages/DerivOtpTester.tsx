import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { startDerivOAuthLogin } from "@/lib/derivAuth";

const ACCOUNT_RE = /^[A-Z]{2,5}\d{3,12}$/;

export default function DerivOtpTester() {
  const [accountId, setAccountId] = useState("");
  const [environment, setEnvironment] = useState<"real" | "demo">("real");
  const [wsUrl, setWsUrl] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = accountId.trim().toUpperCase();
    if (!ACCOUNT_RE.test(id)) {
      toast.error("Invalid account ID format (e.g. CR1234567 or VRTC1234567)");
      return;
    }
    setWsUrl(null);
    setErrorDetails(
      "Server-side Deriv OTP generation is temporarily disabled. Botvio currently uses the session-only PAT connection flow instead."
    );
    toast.info("OTP generation is temporarily unavailable");
  };

  const copy = async () => {
    if (!wsUrl) return;
    await navigator.clipboard.writeText(wsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="container max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Deriv OTP Tester</CardTitle>
          <CardDescription>
            Server-side OTP generation is temporarily disabled while Botvio runs
            without Supabase Edge Functions. Use the session-only Deriv
            connection flow from Connections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-5 rounded-md border border-border bg-muted/40 p-3">
            <p className="text-xs text-muted-foreground">
              No credentials are sent to a missing Edge Function. Connect Deriv
              from the main Connections page instead.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => startDerivOAuthLogin()}
            >
              Connect Deriv
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="account_id">Account ID</Label>
              <Input
                id="account_id"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="CR1234567 or VRTC1234567"
                maxLength={20}
                autoComplete="off"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Environment</Label>
              <RadioGroup
                value={environment}
                onValueChange={(v) => setEnvironment(v as "real" | "demo")}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="real" id="env-real" />
                  <Label htmlFor="env-real" className="font-normal cursor-pointer">Real</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="demo" id="env-demo" />
                  <Label htmlFor="env-demo" className="font-normal cursor-pointer">Demo</Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full">
              Request Fresh WS URL
            </Button>
          </form>

          {wsUrl && (
            <div className="mt-6 space-y-2">
              <Label>WebSocket URL</Label>
              <div className="flex gap-2">
                <Input readOnly value={wsUrl} className="font-mono text-xs" />
                <Button type="button" variant="outline" size="icon" onClick={copy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {errorDetails && (
            <div className="mt-6 space-y-2">
              <Label className="text-destructive">Status</Label>
              <pre className="text-xs bg-muted p-3 rounded-md overflow-auto whitespace-pre-wrap break-all">
                {errorDetails}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
