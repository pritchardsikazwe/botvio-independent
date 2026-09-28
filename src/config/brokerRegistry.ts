export type BrokerCapability = "api" | "market-data" | "contracts" | "trading" | "external" | "asset-availability" | "signals" | "affiliate" | "account" | "copy-trading" | "bots";

export interface BrokerRegistryEntry {
  id: string;
  name: string;
  status: "api-connected" | "external" | "api-verified-readonly";
  description: string;
  capabilities: BrokerCapability[];
  routes: { label: string; path: string }[];
  markets: string[];
  notes: string[];
}

export const BROKER_REGISTRY: BrokerRegistryEntry[] = [
  {
    id: "deriv",
    name: "Deriv",
    status: "api-connected",
    description: "Botvio's deepest broker integration, covering public market data, options contracts, authenticated account connectivity and trading workflows.",
    capabilities: ["api", "market-data", "contracts", "trading", "account", "signals", "affiliate", "copy-trading", "bots"],
    routes: [
      { label: "Deriv Options Hub", path: "/deriv-options" },
      { label: "Deriv App", path: "/deriv-app" },
      { label: "Rise/Fall", path: "/rise-fall" },
      { label: "Synthetic Indices", path: "/synthetic-hub" },
      { label: "Auto Trade", path: "/auto-trade" },
      { label: "Trade Modes", path: "/trade-modes" },
      { label: "Binary Options Hub", path: "/binary-options" },
      { label: "Deriv Trading Bot Guide", path: "/best-deriv-trading-bot" },
      { label: "How to Automate Deriv", path: "/how-to-automate-deriv-trading" },
    ],
    markets: ["Forex", "Stock indices", "Commodities", "Cryptocurrencies", "Derived/Synthetic Indices", "Options", "Multipliers", "Accumulators"],
    notes: [
      "Public ticks and proposal pricing can be used without user authentication.",
      "Authenticated trading and account/portfolio operations require authorized user access.",
      "Deriv Crypto Exchange is a separate product surface and should use its own adapter until an official Exchange trading API is verified.",
    ],
  },
  {
    id: "pocket-option",
    name: "Pocket Option",
    status: "external",
    description: "External broker destination with Botvio analysis and affiliate support; execution remains on Pocket Option.",
    capabilities: ["external", "asset-availability", "signals", "affiliate"],
    routes: [{ label: "Pocket Option Hub", path: "/brokers/pocket-option" }],
    markets: ["Digital options", "Forex/OTC and other broker-listed assets"],
    notes: ["Do not claim Botvio execution without a verified official integration."],
  },
  {
    id: "quotex",
    name: "Quotex",
    status: "external",
    description: "External digital-options destination with Botvio signals and educational analysis.",
    capabilities: ["external", "signals", "affiliate"],
    routes: [{ label: "Quotex Hub", path: "/brokers/quotex" }],
    markets: ["Digital options", "Broker-listed assets"],
    notes: ["Do not use unofficial API wrappers as an execution integration."],
  },
  {
    id: "olymptrade",
    name: "Olymptrade",
    status: "external",
    description: "External broker destination for platform information, Botvio analysis and affiliate traffic.",
    capabilities: ["external", "signals", "affiliate"],
    routes: [{ label: "Olymptrade Hub", path: "/brokers/olymptrade" }],
    markets: ["Fixed-time and broker-listed trading products"],
    notes: ["Verify current products and availability by jurisdiction."],
  },
  {
    id: "binomo",
    name: "Binomo",
    status: "external",
    description: "External broker destination for options education, Botvio analysis and affiliate traffic.",
    capabilities: ["external", "signals", "affiliate"],
    routes: [{ label: "Binomo Hub", path: "/brokers/binomo" }],
    markets: ["Digital options", "Broker-listed assets"],
    notes: ["Verify current instruments, terms and eligibility before trading."],
  },
  {
    id: "iq-option",
    name: "IQ Option",
    status: "external",
    description: "External trading destination with Botvio research and affiliate support; API status must be verified before automation.",
    capabilities: ["external", "signals", "affiliate"],
    routes: [{ label: "IQ Option Hub", path: "/brokers/iq-option" }],
    markets: ["Options and broker-listed trading products"],
    notes: ["No automated execution claim until an official current API is verified."],
  },
];
