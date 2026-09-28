import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Rocket, Bomb, RefreshCw, Shuffle, Zap, BarChart3, ExternalLink, GitBranch, TrendingUp, TrendingDown } from "lucide-react";
import { SyntxBridgeChart } from "@/components/weltrade/SyntxBridgeChart";
import { SyntxHauzaSignalButton } from "@/components/weltrade/SyntxHauzaSignalButton";

const WELTRADE_LINK = "https://gowt.net/ib67505";

export type SyntxCategory =
  | "FX Vol." | "SFX Vol." | "PainX" | "GainX" | "FlipX"
  | "SwitchX" | "BreakX" | "TrendX" | "Progression";

export interface SyntxInst {
  key: string;
  label: string;
  mt5Symbol: string;
  category: SyntxCategory;
  bias: "buy" | "sell" | "both";
  blurb: string;
}

const make = (
  prefix: string,
  category: SyntxCategory,
  values: Array<string | number>,
  bias: SyntxInst["bias"],
  blurb: string,
) => values.map((value) => {
  const label = `${prefix} ${value}`;
  return { key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, mt5Symbol: label, category, bias, blurb };
});

const SYNTX: SyntxInst[] = [
  ...make("FX Vol.", "FX Vol.", [20, 40, 60, 80, 99], "both", "Synthetic volatility family; analyse the selected volatility level and current structure."),
  ...make("SFX Vol.", "SFX Vol.", [20, 40, 60, 80, 99], "both", "FX Vol.-style behaviour with an additional spike mechanism, according to Weltrade."),
  ...make("PainX", "PainX", [400, 600, 800, 999, 1200], "buy", "Upward directional behaviour with occasional downward jumps; verify the live feed before acting."),
  ...make("GainX", "GainX", [400, 600, 800, 999, 1200], "sell", "Downward directional behaviour with occasional upward jumps; verify the live feed before acting."),
  ...make("FlipX", "FlipX", [1, 2, 3, 4, 5], "both", "Fixed-step directional flips; use range and structure analysis rather than assuming a trend."),
  ...make("SwitchX", "SwitchX", [600, 1200, 1800], "both", "Starts with GainX-style behaviour and can switch to PainX-style behaviour after a qualifying jump."),
  ...make("BreakX", "BreakX", [600, 1200, 1800], "both", "Breakout-style regime mechanics; compare jump behaviour before treating a switch as confirmed."),
  ...make("TrendX", "TrendX", [600, 1200, 1800], "both", "Trend-regime mechanics; confirm higher-high/higher-low or lower-high/lower-low structure."),
  { key: "plusx-1", label: "PlusX 1", mt5Symbol: "PlusX 1", category: "Progression", bias: "both", blurb: "Linear progression: step sizes increase 1, 2, 3, 4, 5 …" },
  { key: "fibox", label: "FiboX", mt5Symbol: "FiboX", category: "Progression", bias: "both", blurb: "Fibonacci progression mechanics: 1, 1, 2, 3, 5, 8 …" },
  { key: "quadx", label: "QuadX", mt5Symbol: "QuadX", category: "Progression", bias: "both", blurb: "Quadratic progression mechanics: 1, 4, 9, 16, 25 …" },
  { key: "max-painx", label: "MAX PainX", mt5Symbol: "MAX PainX", category: "Progression", bias: "buy", blurb: "Progression mechanics combined with PainX-style directional behaviour." },
  { key: "max-gainx", label: "MAX GainX", mt5Symbol: "MAX GainX", category: "Progression", bias: "sell", blurb: "Progression mechanics combined with GainX-style directional behaviour." },
];

const CATEGORY_META: Record<SyntxCategory, { icon: typeof Rocket; tone: string }> = {
  "FX Vol.": { icon: Zap, tone: "text-purple-400 border-purple-500/40" },
  "SFX Vol.": { icon: Zap, tone: "text-fuchsia-400 border-fuchsia-500/40" },
  PainX: { icon: Bomb, tone: "text-red-400 border-red-500/40" },
  GainX: { icon: Rocket, tone: "text-emerald-400 border-emerald-500/40" },
  FlipX: { icon: RefreshCw, tone: "text-amber-400 border-amber-500/40" },
  SwitchX: { icon: Shuffle, tone: "text-blue-400 border-blue-500/40" },
  BreakX: { icon: GitBranch, tone: "text-cyan-400 border-cyan-500/40" },
  TrendX: { icon: TrendingUp, tone: "text-indigo-400 border-indigo-500/40" },
  Progression: { icon: BarChart3, tone: "text-orange-400 border-orange-500/40" },
};

const FILTERS: Array<SyntxCategory | "all"> = [
  "all", "FX Vol.", "SFX Vol.", "PainX", "GainX", "FlipX", "SwitchX", "BreakX", "TrendX", "Progression",
];

export function SyntxChartSection() {
  const [activeKey, setActiveKey] = useState<string>("gainx-400");
  const [filter, setFilter] = useState<SyntxCategory | "all">("all");

  const active = useMemo(() => SYNTX.find((s) => s.key === activeKey) ?? SYNTX[0], [activeKey]);
  const filtered = useMemo(
    () => filter === "all" ? SYNTX : SYNTX.filter((s) => s.category === filter),
    [filter],
  );

  const chooseFilter = (next: SyntxCategory | "all") => {
    setFilter(next);
    if (next !== "all") {
      const first = SYNTX.find((s) => s.category === next);
      if (first) setActiveKey(first.key);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">SyntX instrument browser</p>
              <p className="text-xs text-muted-foreground mt-0.5">Select a family, then choose the exact MT5 symbol.</p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{SYNTX.length} instruments</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-none">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => chooseFilter(item)}
                className={`shrink-0 snap-start rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors ${
                  filter === item ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {item === "all" ? "All" : item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-muted-foreground font-bold">Selected instrument</p>
                <h2 className="text-lg font-extrabold text-foreground truncate mt-0.5">{active.label}</h2>
              </div>
              <Badge variant="outline" className="text-[9px] shrink-0">{active.category}</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">{active.blurb}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary font-mono">{active.mt5Symbol}</Badge>
              <Badge variant="outline" className={`text-[9px] ${active.bias === "buy" ? "border-emerald-500/40 text-emerald-400" : active.bias === "sell" ? "border-red-500/40 text-red-400" : "border-blue-500/40 text-blue-400"}`}>
                {active.bias === "buy" ? "Directional buy" : active.bias === "sell" ? "Directional sell" : "Two-way analysis"}
              </Badge>
            </div>
          </div>

          <SyntxHauzaSignalButton
            mt5Symbol={active.mt5Symbol}
            label={active.label}
            category={active.category}
            bias={active.bias}
          />

          <a href={WELTRADE_LINK} target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="gold" className="w-full font-bold text-xs">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Trade on Weltrade
            </Button>
          </a>
        </div>

        <div className="lg:col-span-3 min-w-0">
          <SyntxBridgeChart symbol={active.mt5Symbol} label={active.label} height={460} />
          <p className="text-[11px] text-muted-foreground mt-2 px-1 leading-relaxed">
            Live prices come from the BOTVIO Bridge EA connected to a Weltrade MT5 terminal. A stale/offline feed is clearly labelled; Botvio does not substitute another market for the selected SyntX instrument.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((inst) => {
          const meta = CATEGORY_META[inst.category];
          const CatIcon = meta.icon;
          const isActive = inst.key === active.key;
          return (
            <button
              key={inst.key}
              onClick={() => setActiveKey(inst.key)}
              className={`text-left rounded-xl border-2 p-3 transition-all min-w-0 ${
                isActive ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border/50 bg-card hover:border-primary/40"
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <CatIcon className={`h-4 w-4 ${meta.tone.split(" ")[0]} shrink-0`} />
                  <span className="text-xs font-bold text-foreground truncate">{inst.label}</span>
                </div>
                <Badge variant="outline" className={`text-[9px] ${meta.tone} font-mono shrink-0`}>{inst.category}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{inst.blurb}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
                  <Activity className="h-2.5 w-2.5 mr-0.5" /> MT5 Bridge
                </Badge>
                <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                  {inst.bias === "buy" ? "Buy bias" : inst.bias === "sell" ? "Sell bias" : "Both"}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const SYNTX_INSTRUMENTS = SYNTX;
