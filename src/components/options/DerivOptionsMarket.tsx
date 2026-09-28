import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, RefreshCw, ShieldCheck } from "lucide-react";

type Contract = {
  contract_type?: string;
  contract_display?: string;
  contract_category_display?: string;
};

type Tick = {
  quote?: number;
  epoch?: number;
};

const SYMBOLS = [
  { label: "EUR/USD", symbol: "frxEURUSD" },
  { label: "GBP/USD", symbol: "frxGBPUSD" },
  { label: "USD/JPY", symbol: "frxUSDJPY" },
  { label: "Gold", symbol: "frxXAUUSD" },
  { label: "Volatility 100", symbol: "R_100" },
  { label: "Volatility 75", symbol: "R_75" },
];

const CONTRACT_LABELS: Record<string, string> = {
  CALL: "Rise",
  PUT: "Fall",
  HIGHER: "Higher",
  LOWER: "Lower",
  ONETOUCH: "Touch",
  NOTOUCH: "No Touch",
  RANGE: "Range",
  EXPIRYRANGE: "Ends Between",
  EXPIRYRANGEE: "Ends Outside",
};

export function DerivOptionsMarket() {
  const [selected, setSelected] = useState(SYMBOLS[0]);
  const [price, setPrice] = useState<number | null>(null);
  const [tickTime, setTickTime] = useState<number | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ws = new WebSocket("wss://api.derivws.com/trading/v1/options/ws/public");
    wsRef.current = ws;

    ws.onopen = () => {
      if (cancelled) return;
      setConnected(true);
      setError(null);
      ws.send(JSON.stringify({ ticks: selected.symbol, subscribe: 1, req_id: 1 }));
      ws.send(JSON.stringify({ contracts_for: selected.symbol, req_id: 2 }));
    };

    ws.onmessage = (event) => {
      if (cancelled) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.msg_type === "tick" && msg.tick?.quote != null) {
          setPrice(Number(msg.tick.quote));
          setTickTime(Number(msg.tick.epoch) * 1000);
        }
        if (msg.msg_type === "contracts_for") {
          const available = msg.contracts_for?.available ?? [];
          setContracts(available);
        }
        if (msg.error) setError(msg.error.message || "Deriv market data error");
      } catch {
        setError("Unable to read Deriv market data.");
      }
    };

    ws.onerror = () => {
      if (!cancelled) {
        setConnected(false);
        setError("Deriv public market feed is unavailable.");
      }
    };
    ws.onclose = () => {
      if (!cancelled) setConnected(false);
    };

    return () => {
      cancelled = true;
      ws.close();
      wsRef.current = null;
    };
  }, [selected.symbol]);

  const optionTypes = useMemo(() => {
    const labels = contracts
      .map(c => c.contract_type)
      .filter(Boolean)
      .map(c => CONTRACT_LABELS[c!] || c!);
    return Array.from(new Set(labels));
  }, [contracts]);

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b border-border/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Deriv live options market
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Read-only public market data. No account credentials are required.
            </p>
          </div>
          <Badge className={connected ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>
            {connected ? "LIVE" : "OFFLINE"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-5">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {SYMBOLS.map(item => (
            <button
              key={item.symbol}
              onClick={() => setSelected(item)}
              className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold ${selected.symbol === item.symbol ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Live price</p>
            <p className="text-2xl font-black mt-1">{price == null ? "—" : price}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {tickTime ? `Updated ${new Date(tickTime).toLocaleTimeString()}` : "Waiting for tick"}
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Available option types</p>
            <p className="font-bold mt-2">{optionTypes.length || "—"}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {optionTypes.slice(0, 6).map(type => <Badge key={type} variant="outline">{type}</Badge>)}
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Data source</p>
            <p className="font-bold mt-2">Deriv public API</p>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Read-only · no trading action
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
          <RefreshCw className="h-3 w-3" />
          Contract availability comes from Deriv for the selected underlying symbol; it can vary by market and account.
        </div>
      </CardContent>
    </Card>
  );
}
