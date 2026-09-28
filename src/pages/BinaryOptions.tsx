import { Link } from "react-router-dom";
import { useEffect } from "react";
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
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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

  const activeSignals = signals.filter((s) => s.status === "ACTIVE").slice(0, 8);

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
