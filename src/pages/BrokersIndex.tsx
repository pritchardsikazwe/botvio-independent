import { Header } from "@/components/trading/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { PageBanner } from "@/components/layout/PageBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BROKER_REGISTRY } from "@/config/brokerRegistry";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, ShieldCheck, Zap, Signal, Bot, Users, BookOpen } from "lucide-react";

const capabilityLabels: Record<string, string> = {
  api: "API",
  "market-data": "Market data",
  contracts: "Contracts",
  trading: "Trading",
  external: "External platform",
  "asset-availability": "Asset checks",
  signals: "Signals",
  affiliate: "Affiliate",
  account: "Accounts",
  "copy-trading": "Copy trading",
  bots: "Bots",
};

const BrokersIndex = () => (
  <div className="min-h-screen bg-background">
    <SEOHead
      title="Trading Brokers & Platforms | Botvio"
      description="Explore broker and trading-platform options supported by Botvio research, signals, market data and verified integrations. Check capabilities and execution model before choosing a platform."
    />
    <Header />
    <main className="container mx-auto space-y-6 px-4 py-6">
      <PageBanner
        title="Broker"
        accent="Hub"
        description="Choose a trading platform based on the markets, products, connectivity and workflow you actually need."
        crumbs={[{ label: "Home", to: "/" }, { label: "Brokers" }]}
        features={[
          { icon: ShieldCheck, label: "Transparent", sub: "Integration status is shown" },
          { icon: Signal, label: "Research", sub: "Signals & market analysis" },
          { icon: Zap, label: "Execution", sub: "Check where trades actually execute" },
          { icon: BookOpen, label: "Compare", sub: "Review before opening an account" },
        ]}
      />

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">How to choose</p>
              <h2 className="mt-1 text-lg font-bold">Research first. Connect second.</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                Botvio can provide research and signals across different platforms, but an external broker card does not mean Botvio executes trades there. Check the integration status and the broker's current availability for your country and account.
              </p>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link to="/start">Start here <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="broker-list">
        <div className="mb-4">
          <h2 id="broker-list" className="text-2xl font-black">Platforms in the Botvio registry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Integration status and capabilities are shown explicitly so you know what Botvio does—and does not—connect to.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BROKER_REGISTRY.map((broker) => {
            const integrated = broker.status === "api-connected";
            return (
              <Card key={broker.id} className="h-full border-border/60 transition hover:border-primary/50">
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold">{broker.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{broker.description}</p>
                    </div>
                    <Badge variant={integrated ? "default" : "outline"} className="shrink-0 text-[10px]">
                      {integrated ? "Connected" : "External"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {broker.capabilities.slice(0, 6).map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-[9px]">{capabilityLabels[cap] ?? cap}</Badge>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Markets / products</p>
                    <p className="mt-1 text-xs leading-5 text-foreground">{broker.markets.join(" · ")}</p>
                  </div>

                  <div className="mt-auto pt-5">
                    <div className="mb-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connection model</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {integrated ? "Botvio has a verified API-connected workflow for supported features." : "Botvio provides research/navigation; execution remains on the external platform."}
                      </p>
                    </div>
                    <Button className="w-full" variant={integrated ? "default" : "outline"} asChild>
                      <Link to={broker.primaryAction.path}>
                        {broker.primaryAction.label}
                        {integrated ? <ArrowRight className="ml-2 h-4 w-4" /> : <ExternalLink className="ml-2 h-4 w-4" />}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-black">Other platform pages</h2>
          <p className="mt-1 text-sm text-muted-foreground">These platforms have Botvio information pages. Review the current platform details before connecting or funding an account.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Exness", "/brokers/exness", "Forex, gold and multi-asset trading"],
            ["Weltrade", "/brokers/weltrade", "MT5 and multi-market trading"],
            ["Binance", "/brokers/binance", "Crypto trading and market access"],
            ["Deriv ecosystem", "/brokers/deriv", "Options, synthetic indices and trading workflows"],
          ].map(([name, path, description]) => (
            <Link key={path} to={path} className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-primary/50">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold">{name}</h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
              <Badge variant="outline" className="mt-3 text-[9px]">Platform information</Badge>
            </Link>
          ))}
        </div>
      </section>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Link to="/signals" className="rounded-xl border border-border/60 p-4 transition hover:border-primary/50">
            <Signal className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Compare with signals</h3>
            <p className="mt-1 text-xs text-muted-foreground">Review the market setup before choosing where to trade.</p>
          </Link>
          <Link to="/copy-trading" className="rounded-xl border border-border/60 p-4 transition hover:border-primary/50">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Copy trading</h3>
            <p className="mt-1 text-xs text-muted-foreground">Review provider strategies before connecting an account.</p>
          </Link>
          <Link to="/learn" className="rounded-xl border border-border/60 p-4 transition hover:border-primary/50">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-bold">Learn first</h3>
            <p className="mt-1 text-xs text-muted-foreground">Understand leverage, contracts and risk before trading.</p>
          </Link>
        </CardContent>
      </Card>

      <p className="pb-8 text-center text-[11px] leading-5 text-muted-foreground">
        Broker availability, products, fees, eligibility and execution conditions can vary by country and account. Some links may be affiliate links. Review the broker's current terms before opening or funding an account.
      </p>
    </main>
  </div>
);

export default BrokersIndex;
