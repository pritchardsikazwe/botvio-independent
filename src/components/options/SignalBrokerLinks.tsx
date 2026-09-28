import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BROKERS = [
  { name: "Deriv", path: "/deriv-options", external: false },
  { name: "Pocket Option", path: "/brokers/pocket-option", external: false },
  { name: "Quotex", path: "/brokers/quotex", external: false },
  { name: "Olymptrade", path: "/brokers/olymptrade", external: false },
];

export function SignalBrokerLinks({ symbol }: { symbol: string }) {
  const isSynthetic = /^(R_|1HZ|BOOM|CRASH|STEP|JUMP|VOLATILITY)/i.test(symbol);
  const brokers = isSynthetic ? BROKERS.filter(b => b.name === "Deriv") : BROKERS;

  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <p className="text-[11px] font-semibold text-muted-foreground mb-2">Check broker availability</p>
      <div className="flex flex-wrap gap-2">
        {brokers.map((broker) => (
          <Button key={broker.name} size="sm" variant="outline" asChild>
            <Link to={broker.path}>{broker.name}</Link>
          </Button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        These links open broker information. They do not confirm that this exact asset or contract is currently available.
      </p>
    </div>
  );
}
