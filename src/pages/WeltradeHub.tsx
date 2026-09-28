import { useMemo, useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Header } from "@/components/trading/Header";
import { PageBanner } from "@/components/layout/PageBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity, BarChart3, BookOpen, ExternalLink, Info, LayoutDashboard,
  Radio, ShieldAlert, Sparkles, Target, TrendingDown, TrendingUp, Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import { SyntxChartSection, SYNTX_INSTRUMENTS } from "@/components/weltrade/SyntxChartSection";
import { SyntxSignalsSection } from "@/components/weltrade/SyntxSignalsSection";
import { SyntxTipsSection } from "@/components/weltrade/SyntxTipsSection";
import { SyntxBotvioStrategy } from "@/components/weltrade/SyntxHauzaStrategy";
import { SyntxCommunitySection } from "@/components/weltrade/SyntxCommunitySection";

const WELTRADE_LINK = "https://gowt.net/ib67505";

const FAMILY_INFO = [
  { name: "FX Vol.", tag: "Volatility", detail: "20%–99% annualised volatility levels; analyse structure and volatility rather than treating it like a normal FX pair." },
  { name: "SFX Vol.", tag: "Volatility + spikes", detail: "FX Vol. behaviour with an additional spike mechanism occurring on average around every 30 minutes, according to Weltrade." },
  { name: "PainX", tag: "Directional", detail: "Upward price behaviour with occasional downward jumps. Variants include 400, 600, 800, 999 and 1200." },
  { name: "GainX", tag: "Directional", detail: "Downward price behaviour with occasional upward jumps. Variants include 400, 600, 800, 999 and 1200." },
  { name: "FlipX", tag: "Range / step", detail: "Direction can flip at each step with a fixed step structure; use range and mean-reversion analysis cautiously." },
  { name: "SwitchX", tag: "Regime switch", detail: "Starts with GainX-style behaviour and can switch to PainX-style behaviour after a qualifying jump." },
  { name: "BreakX", tag: "Breakout", detail: "A GainX-style starting regime that can switch after a jump exceeds the previous jump." },
  { name: "TrendX", tag: "Trend regime", detail: "A GainX-style starting regime that can switch when a confirmed trend reversal is detected." },
  { name: "PlusX 1", tag: "Linear progression", detail: "Step sizes increase linearly: 1, 2, 3, 4, 5 …" },
  { name: "FiboX", tag: "Fibonacci progression", detail: "Progression follows 1, 1, 2, 3, 5, 8 …; the sequence describes the instrument's progression mechanics." },
  { name: "QuadX", tag: "Quadratic progression", detail: "Step sizes follow a quadratic sequence such as 1, 4, 9, 16, 25 …" },
  { name: "MAX PainX", tag: "Progression + PainX", detail: "Combines progression mechanics with PainX-style direction and changing jump characteristics." },
  { name: "MAX GainX", tag: "Progression + GainX", detail: "Combines progression mechanics with GainX-style direction and changing jump characteristics." },
];

export default function WeltradeHub() {
  const [activeTab, setActiveTab] = useState("overview");

  const counts = useMemo(() => {
    const families = new Set(SYNTX_INSTRUMENTS.map((i) => i.category));
    return { instruments: SYNTX_INSTRUMENTS.length, families: families.size };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        seoKey="weltrade"
        title="Weltrade SyntX Trading Hub – Live MT5 Charts, Signals & Strategies | Botvio"
        description="Botvio's Weltrade SyntX hub for MT5 market data, SyntX instrument behaviour, signals, chart analysis and family-specific strategy education. Live data is shown only when the Weltrade Bridge EA is connected."
      />
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
        <PageBanner
          title="Weltrade"
          accent="SyntX Hub"
          description="Explore SyntX instruments by their documented market mechanics, then analyse the selected instrument with Botvio's MT5 Bridge feed when live data is available."
          crumbs={[
            { label: "Home", to: "/" },
            { label: "Trading Hubs", to: "/markets" },
            { label: "Weltrade SyntX" },
          ]}
          action={
            <div className="flex flex-wrap gap-2">
              <Badge className="border-primary/30 bg-primary/20 font-mono text-xs text-primary">SyntX</Badge>
              <Badge variant="outline" className="border-success/40 text-xs text-success">MT5</Badge>
              <Badge variant="outline" className="border-warning/30 text-xs text-warning">Bridge data</Badge>
            </div>
          }
          stats={[
            { icon: BarChart3, value: String(counts.instruments), label: "Listed instruments" },
            { icon: LayersIcon, value: String(FAMILY_INFO.length), label: "SyntX families" },
            { icon: Activity, value: "MT5", label: "Execution platform" },
            { icon: ShieldAlert, value: "High risk", label: "CFD / leverage" },
          ]}
        />

        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 shrink-0">
                <Radio className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground">Live-data rule</h2>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">No fabricated prices</Badge>
                </div>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  Botvio only labels a Weltrade feed as live when recent ticks are actually arriving from the Bridge EA.
                  If the feed is stale, the chart stays honest and shows the last-seen time instead of inventing candles or signals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 border border-border/50 bg-card p-1">
            <TabsTrigger value="overview" className="gap-1.5 text-[11px] sm:text-xs font-bold">
              <LayoutDashboard className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="signals" className="gap-1.5 text-[11px] sm:text-xs font-bold">
              <Target className="h-4 w-4" /> Signals
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-1.5 text-[11px] sm:text-xs font-bold">
              <Sparkles className="h-4 w-4" /> Strategy
            </TabsTrigger>
            <TabsTrigger value="learn" className="gap-1.5 text-[11px] sm:text-xs font-bold">
              <BookOpen className="h-4 w-4" /> Learn
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-1.5 text-[11px] sm:text-xs font-bold">
              <Activity className="h-4 w-4" /> Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-5 sm:mt-6 space-y-6">
            <SyntxChartSection />

            <section className="space-y-3">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" /> How each SyntX family behaves
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                  These descriptions are based on Weltrade's current SyntX documentation; Botvio uses them to select appropriate analysis modes, not to promise an outcome.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {FAMILY_INFO.map((family) => (
                  <Card key={family.name} className="border-border/50 bg-card">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-foreground">{family.name}</h3>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary shrink-0">{family.tag}</Badge>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">{family.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-warning">Risk and execution</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Weltrade states that SyntX products are synthetic CFD instruments and that leverage can magnify losses.
                    Use the hub for analysis and education, verify the live feed in MT5, and test strategies on demo before committing real funds.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground">Ready to trade on Weltrade?</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Review the instrument mechanics first, then open MT5 and confirm the exact symbol and current feed.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                    <Link to="/learn">
                      <Button variant="outline" className="w-full sm:w-auto text-xs font-bold">
                        <BookOpen className="h-4 w-4 mr-2" /> Learn first
                      </Button>
                    </Link>
                    <a href={WELTRADE_LINK} target="_blank" rel="noopener noreferrer">
                      <Button variant="gold" className="w-full sm:w-auto text-xs font-bold">
                        <ExternalLink className="h-4 w-4 mr-2" /> Open Weltrade
                      </Button>
                    </a>
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/80">
                  Affiliate disclosure: this Weltrade link may be an affiliate link. Botvio may receive compensation if you open an account through it, at no additional cost to you.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="mt-5 sm:mt-6">
            <SyntxSignalsSection />
          </TabsContent>

          <TabsContent value="strategy" className="mt-5 sm:mt-6">
            <SyntxBotvioStrategy />
          </TabsContent>

          <TabsContent value="learn" className="mt-5 sm:mt-6">
            <SyntxTipsSection />
          </TabsContent>

          <TabsContent value="community" className="mt-5 sm:mt-6">
            <SyntxCommunitySection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LayersIcon({ className }: { className?: string }) {
  return <BarChart3 className={className} />;
}
