import { ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BROKERS = [
  { name: "Deriv", type: "API-connected", description: "Official API path for market data, contract availability and authenticated trading.", url: "https://deriv.com/", badge: "Live API" },
  { name: "Pocket Option", type: "External broker", description: "Explore the platform and current asset availability. Botvio provides analysis; trading happens on the broker.", url: "https://pocketoption.com/", badge: "External" },
  { name: "Quotex", type: "External broker", description: "Digital-options platform with demo access. Verify current asset, payout and contract terms on the platform.", url: "https://qxbroker.com/", badge: "External" },
  { name: "Olymptrade", type: "External broker", description: "Fixed-time and other trading products. Botvio does not assume an execution API where none is officially documented.", url: "https://olymptrade.com/", badge: "External" },
  { name: "Binomo", type: "External broker", description: "External destination for options trading education and broker access. Verify availability and terms before trading.", url: "https://binomo.com/", badge: "External" },
  { name: "IQ Option", type: "External broker", description: "External trading platform profile. API execution should only be added after official documentation is verified.", url: "https://iqoption.com/", badge: "External" },
];

export function OptionsBrokerDirectory() {
  return (
    <section className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Choose where you trade</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Botvio separates its analysis from broker execution. Availability, pricing, payout and contract terms are broker-specific.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {BROKERS.map((broker) => (
          <Card key={broker.name} className="h-full">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-lg">{broker.name}</h3>
                <Badge variant="outline">{broker.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{broker.type}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 flex-1">{broker.description}</p>
              <div className="flex items-center gap-2 mt-5">
                <Button asChild className="flex-1">
                  <a href={broker.url} target="_blank" rel="noopener noreferrer">
                    Open platform <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Check eligibility and terms in your jurisdiction.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Affiliate disclosure: some broker links may be affiliate links. If you open an account through one, Botvio may receive compensation at no additional cost to you.
      </p>
    </section>
  );
}
