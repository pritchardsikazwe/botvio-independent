import { ExternalLink, ShieldCheck, Zap, Globe, Activity } from "lucide-react";
import { BROKER_REGISTRY } from "@/config/brokerRegistry";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        {BROKER_REGISTRY.map((broker) => (
          <Card key={broker.name} className="h-full">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-lg">{broker.name}</h3>
                <Badge variant="outline">{broker.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{broker.type}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 flex-1">{broker.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">{broker.capabilities.slice(0, 5).map(cap => <Badge key={cap} variant="secondary" className="text-[10px]">{cap}</Badge>)}</div>
              <div className="flex items-center gap-2 mt-5">
                <Button asChild className="flex-1">
                  <a href={broker.id === "deriv" ? "/deriv-options" : broker.routes[0]?.path || "/brokers"} >
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
