import { BarChart3, Home, MoreHorizontal, Radio, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS = [
  { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { to: "/markets", label: "Markets", icon: BarChart3, match: (p: string) => p.startsWith("/markets") || p === "/gold" || p === "/bitcoin" || p === "/btc" || p === "/silver" },
  { to: "/signals", label: "Signals", icon: Radio, match: (p: string) => p.startsWith("/signals") },
  { to: "/deriv-app", label: "Trade", icon: BarChart3, match: (p: string) => ["/deriv-app", "/deriv-options", "/rise-fall", "/auto-trade", "/trade-modes"].some(x => p.startsWith(x)) },
  { to: "/start", label: "Start", icon: UserRound, match: (p: string) => p === "/start" || p === "/start-here" },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
