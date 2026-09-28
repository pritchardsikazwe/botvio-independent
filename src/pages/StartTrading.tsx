import { ArrowRight, BarChart3, Bot, BookOpen, LineChart, Radio, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/SEOHead";

const paths = [
  { icon: BookOpen, title: "I'm new to trading", text: "Learn the basics, explore markets, then practise before risking real funds.", href: "/beginner-guide", action: "Start learning" },
  { icon: Radio, title: "I want trading signals", text: "Browse Botvio signals, open the chart, review levels and understand the setup.", href: "/signals", action: "Explore signals" },
  { icon: BarChart3, title: "I want to analyse markets", text: "Explore live market hubs, charts, strategies and educational research.", href: "/markets", action: "Explore markets" },
  { icon: Sparkles, title: "I want options", text: "Compare options workflows and brokers. Execution terms remain broker-specific.", href: "/binary-options", action: "Explore options" },
  { icon: Bot, title: "I want automation", text: "Learn about Botvio automation, Deriv connectivity and supported trading workflows.", href: "/auto-trade", action: "Explore automation" },
  { icon: WalletCards, title: "I already know what I need", text: "Go directly to a broker, market or trading tool without the guided path.", href: "/brokers", action: "Open broker directory" },
];

export default function StartTrading() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Start Trading with Botvio – Markets, Signals, Options & Automation"
        description="A guided Botvio starting point for exploring markets, signals, options, brokers and automated trading."
      />
      <main className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <div className="max-w-3xl mb-8">
          <p className="text-sm font-semibold text-primary mb-2">BOTVIO START HERE</p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">What do you want to do?</h1>
          <p className="text-muted-foreground text-base md:text-lg mt-3 leading-relaxed">
            You do not need to understand Botvio's technical setup first. Choose your goal and we will take you to the relevant market, research, signal or trading workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paths.map(({ icon: Icon, title, text, href, action }) => (
            <Card key={href} className="h-full hover:border-primary/40 transition-colors">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-bold text-lg">{title}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed flex-1">{text}</p>
                <Button asChild className="mt-5 w-full">
                  <Link to={href}>{action}<ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-primary/20">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <h2 className="font-semibold">A clear path from research to execution</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore → Analyse → Choose a market or contract → Check broker availability → Connect or open the broker.
                  Botvio analysis does not guarantee execution, pricing, availability, payout or trading results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="outline"><Link to="/markets"><LineChart className="mr-2 h-4 w-4" /> Markets</Link></Button>
          <Button asChild variant="outline"><Link to="/signals">Signals</Link></Button>
          <Button asChild variant="outline"><Link to="/brokers">Brokers</Link></Button>
          <Button asChild variant="outline"><Link to="/learn">Learn</Link></Button>
        </div>
      </main>
    </div>
  );
}
