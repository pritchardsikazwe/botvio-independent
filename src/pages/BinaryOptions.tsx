import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/trading/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { useManualSignals, ManualSignal } from "@/hooks/useManualSignals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { OptionsBrokerDirectory } from "@/components/options/OptionsBrokerDirectory";

const CONTRACT_TYPES = [
  {
    title: "Rise / Fall",
    description: "Predict whether the market will finish above or below the entry price at expiry.",
    icon: TrendingUp,
    link: "/rise-fall",
  },
  {
    title: "Higher / Lower",
    description: "Set a barrier and assess whether the final price will be higher or lower.",
    icon: Target,
    link: "/deriv-options",
  },
  {
    title: "Touch / No Touch",
    description: "Assess whether price will touch a defined barrier during the contract period.",
    icon: Zap,
    link: "/deriv-options",
  },
  {
    title: "Range contracts",
    description: "Explore contracts based on whether price stays inside or moves outside defined barriers.",
    icon: BarChart3,
    link: "/deriv-options",
  },
];

const MARKET_TYPES = [
  "Forex",
  "Stock indices",
  "Commodities",
  "Cryptocurrencies",
  "Derived / Synthetic Indices",
];

function timeAgo(dateStr: string) {
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function SignalRow({ signal }: { signal: ManualSignal }) {
  const isBuy = signal.direction === "BUY";
  return (
    <Link
      to={`/chart/${encodeURIComponent(signal.symbol)}?signal=${encodeURIComponent(signal.id)}`}
      className="block rounded-xl border border-border/50 bg-card/60 p-3 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <Badge className={isBuy ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>
            {isBuy ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {signal.direction}
          </Badge>
          <span className="font-semibold truncate">{signal.symbol}</span>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
          <Clock className="h-3 w-3" /> {timeAgo(signal.created_at)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <span><span className="text-muted-foreground">Entry:</span> {signal.entry_price ?? "—"}</span>
        <span><span className="text-muted-foreground">TF:</span> {signal.timeframe ?? "—"}</span>
        <span><span className="text-muted-foreground">Confidence:</span> {signal.confidence ? `${signal.confidence}%` : "—"}</span>
        <span className="text-primary text-right">Open chart →</span>
      </div>
    </Link>
  );
}

export default function BinaryOptions() {
  const { data: signals = [], isLoading } = useManualSignals({ status: "ACTIVE" });
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("binary-options-live-signals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trading_signals" },
        () => queryClient.invalidateQueries({ queryKey: ["manual-signals"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const [directionFilter, setDirectionFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [timeframeFilter, setTimeframeFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const terminalSignals = useMemo(() => {
    return signals
      .filter((s) => s.status === "ACTIVE")
      .filter((s) => directionFilter === "ALL" || s.direction === directionFilter)
      .filter((s) => timeframeFilter === "ALL" || s.timeframe === timeframeFilter)
      .filter((s) => !search || s.symbol.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 20);
  }, [signals, directionFilter, timeframeFilter, search]);

  const timeframes = useMemo(
    () => Array.from(new Set(signals.filter((s) => s.status === "ACTIVE").map((s) => s.timeframe).filter(Boolean))),
    [signals],
  );

  const riseCount = terminalSignals.filter((s) => s.direction === "BUY").length;
  const fallCount = terminalSignals.filter((s) => s.direction === "SELL").length;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        seoKey="binary-options"
        title="Binary Options Trading Hub — Signals, Strategies & Education | Botvio"
        description="Learn digital and binary options, explore Rise/Fall and other contract types, review market signals and understand the risks before trading."
      />
      <Header />

      <main className="container mx-auto px-4 py-6 md:py-10">
        <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10 mb-8">
          <Badge variant="outline" className="mb-4">OPTIONS TRADING HUB</Badge>
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Binary & Digital Options
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              A practical starting point for traders looking for short-duration, fixed-outcome
              option contracts. Learn the contract types, inspect market conditions and use
              Botvio signals as analysis rather than as a guarantee of an outcome.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button asChild size="lg">
                <Link to="/signals">Explore live signals <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/learn">Learn before trading <BookOpen className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> How options work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                Digital options are time-bound contracts where the trader selects a market,
                contract condition, duration and stake. The result depends on whether the
                specified condition is satisfied at expiry or during the contract.
              </p>
              <p>
                This is different from CFD trading: the contract has defined terms and the
                maximum loss on a digital option can be limited to the amount staked, subject
                to the product's rules.
              </p>
              <p>
                Contract availability, payout, duration and market availability can vary by
                platform and jurisdiction. Always verify the current terms on the trading
                platform before placing an order.
              </p>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-destructive" /> Risk first
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Options can expire out of the money and the initial stake can be lost.
              Very short durations make timing and market noise especially important.
              Botvio does not guarantee profitable trades.
            </CardContent>
          </Card>
        </section>

        <OptionsBrokerDirectory />

        <section className="mb-8">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-2xl font-bold">Contract types</h2>
              <p className="text-sm text-muted-foreground mt-1">Start with the contract mechanics, then choose a strategy.</p>
            </div>
            <Link to="/deriv-options" className="text-sm text-primary hover:underline">All options →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTRACT_TYPES.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="h-full hover:border-primary/40 transition-colors">
                  <CardContent className="p-5">
                    <Icon className="h-6 w-6 text-primary mb-3" />
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
                    <Button variant="ghost" className="px-0 mt-3" asChild>
                      <Link to={item.link}>Learn more <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mb-8">
          <Card className="border-primary/20 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Binary Options Signal Terminal
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use Botvio's current market analysis to research a possible Rise or Fall bias.
                    It is not an order, expiry prediction or guarantee.
                  </p>
                </div>
                <Badge variant="outline">{terminalSignals.length} active analysis signals</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] gap-2 mb-5">
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search asset, e.g. XAUUSD"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    aria-label="Search option signal asset"
                  />
                </div>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  {(["ALL", "BUY", "SELL"] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => setDirectionFilter(value)}
                      className={`px-3 text-xs font-semibold ${directionFilter === value ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"}`}
                    >
                      {value === "BUY" ? "Rise bias" : value === "SELL" ? "Fall bias" : "All"}
                    </button>
                  ))}
                </div>
                <select
                  value={timeframeFilter}
                  onChange={(e) => setTimeframeFilter(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
                  aria-label="Filter signal timeframe"
                >
                  <option value="ALL">All timeframes</option>
                  {timeframes.map((tf) => <option key={tf} value={tf}>{tf}</option>)}
                </select>
                <Button variant="outline" onClick={() => { setSearch(""); setDirectionFilter("ALL"); setTimeframeFilter("ALL"); }}>
                  <Filter className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="rounded-xl border p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Signals</p>
                  <p className="text-xl font-bold">{terminalSignals.length}</p>
                </div>
                <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Rise bias</p>
                  <p className="text-xl font-bold text-success">{riseCount}</p>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-center">
                  <p className="text-[11px] text-muted-foreground">Fall bias</p>
                  <p className="text-xl font-bold text-destructive">{fallCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                {isLoading ? (
                  [1, 2, 3].map((n) => <div key={n} className="h-20 rounded-xl bg-muted/30 animate-pulse" />)
                ) : terminalSignals.length ? (
                  terminalSignals.map((signal) => (
                    <div key={signal.id} className="rounded-xl border border-border/50 bg-card/60 p-3 md:p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="min-w-0 lg:w-44">
                          <div className="flex items-center gap-2">
                            <Badge className={signal.direction === "BUY" ? "bg-success/15 text-success border-success/30" : "bg-destructive/15 text-destructive border-destructive/30"}>
                              {signal.direction === "BUY" ? "RISE" : "FALL"}
                            </Badge>
                            <span className="font-bold truncate">{signal.symbol}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1">{signal.timeframe} · {timeAgo(signal.created_at)}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 text-xs">
                          <div><span className="text-muted-foreground block">Reference entry</span><strong>{signal.entry_price ?? "—"}</strong></div>
                          <div><span className="text-muted-foreground block">Analysis confidence</span><strong>{signal.confidence ? `${signal.confidence}%` : "—"}</strong></div>
                          <div><span className="text-muted-foreground block">Expiry</span><strong>Not supplied</strong></div>
                          <div><span className="text-muted-foreground block">Status</span><strong className="text-success">ACTIVE</strong></div>
                        </div>
                        <Button size="sm" variant="outline" asChild className="shrink-0">
                          <Link to={`/chart/${encodeURIComponent(signal.symbol)}?signal=${encodeURIComponent(signal.id)}`}>
                            Open chart <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                      {signal.reason && <p className="mt-3 pt-3 border-t border-border/40 text-xs text-muted-foreground">{signal.reason}</p>}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-8 text-center">
                    <p className="font-semibold">No matching active analysis</p>
                    <p className="text-sm text-muted-foreground mt-1">Try another asset, direction or timeframe.</p>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Important:</strong> “RISE” and “FALL” here are labels derived from
                Botvio's BUY/SELL market-analysis direction. They do not specify a broker contract, stake, payout or expiry.
                Always check the actual option terms and current price feed before making any decision.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Active Botvio market signals
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Signals are market analysis. They are not binary-option trade instructions and do not guarantee expiry outcomes.
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {isLoading ? (
                <div className="h-32 rounded-xl bg-muted/30 animate-pulse" />
              ) : activeSignals.length ? (
                activeSignals.map((signal) => <SignalRow key={signal.id} signal={signal} />)
              ) : (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No active public signals right now.
                </div>
              )}
              <Button variant="outline" className="w-full mt-2" asChild>
                <Link to="/signals">Open full signal terminal <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Markets commonly used for options</CardTitle>
              <p className="text-sm text-muted-foreground">Availability depends on the platform and account.</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {MARKET_TYPES.map((market) => (
                  <div key={market} className="rounded-xl border bg-muted/20 p-3 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {market}
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground">
                <strong className="text-foreground">Deriv focus:</strong> Deriv currently offers
                digital options including Rise/Fall, Higher/Lower and Touch/No Touch across
                multiple market categories. Check the live platform for the instruments and
                terms available to your account.
              </div>
              <Button className="w-full mt-4" asChild>
                <a href="https://deriv.com/trade/options" target="_blank" rel="noopener noreferrer">
                  View Deriv options <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Before placing a short-duration trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  ["1", "Identify the market", "Check the actual asset, price feed and current market session."],
                  ["2", "Define the condition", "Know exactly what must happen, the expiry and any barrier before entering."],
                  ["3", "Control the stake", "Use a stake size you can afford to lose and avoid increasing it to recover losses."],
                ].map(([number, title, description]) => (
                  <div key={number} className="rounded-xl border p-4">
                    <Badge className="mb-3">{number}</Badge>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border border-border/60 p-5 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Important:</strong> Trading derivatives and digital
          options involves significant risk. Product rules, availability, payouts and legal
          restrictions vary by provider and country. This page is educational and does not
          constitute financial advice. If a broker link on Botvio is an affiliate link, that
          relationship will be disclosed near the relevant call to action.
        </section>
      </main>
    </div>
  );
}
