import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BridgeTick {
  symbol: string;
  bid: number | null;
  ask: number | null;
  last_price: number | null;
  ts: string;
}

/** Live Weltrade MT5 Bridge feed with bounded history and stale-feed detection. */
export function useBridgeTicks(symbol: string | null, historyLimit = 300) {
  const [ticks, setTicks] = useState<BridgeTick[]>([]);
  const [latest, setLatest] = useState<BridgeTick | null>(null);
  const [hasFeed, setHasFeed] = useState(false);
  const latestRef = useRef<BridgeTick | null>(null);

  useEffect(() => {
    if (!symbol) {
      latestRef.current = null;
      setTicks([]);
      setLatest(null);
      setHasFeed(false);
      return;
    }

    let cancelled = false;
    const safeHistoryLimit = Math.min(Math.max(historyLimit, 50), 800);

    const applyLatest = (row: BridgeTick) => {
      latestRef.current = row;
      setLatest(row);
      setHasFeed(Date.now() - new Date(row.ts).getTime() < 60_000);
    };

    (async () => {
      const { data, error } = await supabase
        .from("bridge_ticks")
        .select("symbol,bid,ask,last_price,ts")
        .eq("symbol", symbol)
        .order("ts", { ascending: false })
        .limit(safeHistoryLimit);

      if (cancelled) return;

      if (error) {
        latestRef.current = null;
        setTicks([]);
        setLatest(null);
        setHasFeed(false);
        return;
      }

      const rows = (data ?? []).reverse() as BridgeTick[];
      setTicks(rows);
      const last = rows[rows.length - 1] ?? null;
      if (last) applyLatest(last);
      else {
        latestRef.current = null;
        setLatest(null);
        setHasFeed(false);
      }
    })();

    const channel = supabase
      .channel(`bridge-ticks-${symbol}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bridge_ticks",
          filter: `symbol=eq.${symbol}`,
        },
        (payload) => {
          if (cancelled) return;
          const row = payload.new as BridgeTick;
          if (!row?.symbol || row.symbol !== symbol || !row.ts) return;

          applyLatest(row);
          setTicks((prev) => {
            const next = [...prev, row];
            return next.length > safeHistoryLimit
              ? next.slice(next.length - safeHistoryLimit)
              : next;
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setHasFeed(false);
        }
      });

    const watchdog = window.setInterval(() => {
      const row = latestRef.current;
      setHasFeed(!!row && Date.now() - new Date(row.ts).getTime() < 60_000);
    }, 10_000);

    return () => {
      cancelled = true;
      latestRef.current = null;
      supabase.removeChannel(channel);
      window.clearInterval(watchdog);
    };
  }, [symbol, historyLimit]);

  return { ticks, latest, hasFeed };
}
