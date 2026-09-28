import { ExternalLink, Shield, BarChart3, BookOpen } from "lucide-react";
import { Header } from "@/components/trading/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DATA = {
  "src/pages/PocketOption.tsx": {name:"Pocket Option",url:"https://pocketoption.com/",desc:"Review the platform, available markets and Botvio analysis before opening the broker terminal.",model:"External broker + affiliate",note:"Verify the current asset, contract, payout and eligibility directly on the broker."},
  "src/pages/Quotex.tsx": {name:"Quotex",url:"https://qxbroker.com/",desc:"Explore digital-options education and use Botvio signals as market analysis rather than an execution guarantee.",model:"External broker",note:"Botvio does not claim an official execution API for Quotex."},
  "src/pages/Olymptrade.tsx": {name:"Olymptrade",url:"https://olymptrade.com/",desc:"Explore platform information, education and Botvio market analysis before trading.",model:"External broker + affiliate",note:"Check the products and rules currently available to your jurisdiction."},
  "src/pages/Binomo.tsx": {name:"Binomo",url:"https://binomo.com/",desc:"Explore digital-options information and Botvio analysis while keeping broker execution separate.",model:"External broker",note:"Verify current instruments, terms and availability on the platform."},
  "src/pages/IQOption.tsx": {name:"IQ Option",url:"https://iqoption.com/",desc:"Explore the platform and use Botvio research to understand market conditions before deciding whether to trade.",model:"External broker",note:"Only add automated execution after an official API and current terms are verified."}
}[path as keyof typeof DATA];

export default function BrokerHub(){
 return <div className="min-h-screen bg-background"><SEOHead title={`Binomo Trading Hub — Markets, Signals & Trading Guide | Botvio`} description={`Botvio Binomo Trading Hub: market analysis, signals, platform information, education and broker access.`} /><Header />
 <main className="container mx-auto px-4 py-6 md:py-10">
  <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10 mb-8">
   <Badge variant="outline">BROKER HUB</Badge><h1 className="text-3xl md:text-5xl font-extrabold mt-4">{DATA.name}</h1>
   <p className="mt-4 max-w-3xl text-muted-foreground text-base md:text-lg leading-relaxed">{DATA.desc}</p>
   <div className="flex flex-col sm:flex-row gap-3 mt-6"><Button asChild size="lg"><a href={DATA.url} target="_blank" rel="noopener noreferrer">Open {DATA.name}<ExternalLink className="ml-2 h-4 w-4"/></a></Button><Button asChild variant="outline" size="lg"><Link to="/binary-options">Back to Options Hub</Link></Button></div>
  </section>
  <section className="grid md:grid-cols-3 gap-4 mb-8">
   <Card><CardHeader><CardTitle className="flex gap-2 text-base"><BarChart3 className="h-5 w-5 text-primary"/>Botvio analysis</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Use current Botvio market signals and charts as analysis. Signal direction does not guarantee a broker outcome.</CardContent></Card>
   <Card><CardHeader><CardTitle className="flex gap-2 text-base"><BookOpen className="h-5 w-5 text-primary"/>Platform guide</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Review the broker's own current contract terms, asset availability, payout and expiry before trading.</CardContent></Card>
   <Card><CardHeader><CardTitle className="flex gap-2 text-base"><Shield className="h-5 w-5 text-primary"/>Execution boundary</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{DATA.note}</CardContent></Card>
  </section>
  <Card className="mb-8"><CardHeader><CardTitle>How to use this page</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-muted-foreground"><p>1. Check the market and signal timestamp.</p><p>2. Open the broker and verify the same asset and contract terms.</p><p>3. Compare the broker's current price, expiry and payout before making your own decision.</p><p>4. Never treat a Botvio signal as a guaranteed result.</p></CardContent></Card>
  <p className="text-xs text-muted-foreground">Affiliate disclosure: some broker links may be affiliate links. If you open an account through one, Botvio may receive compensation at no additional cost to you. Trading involves substantial risk.</p>
 </main></div>;
}