import { useAuth } from "@/contexts/AuthContext";
import { useDeriv } from "@/contexts/DerivContext";
import { useBotInstances, useMyCopySubscriptions, useTradingAccounts, useMySubscription, useNotifications } from "@/hooks/useBotvio";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Wallet, Users, TrendingUp, Bell, ArrowRight, Play, Pause, AlertCircle } from "lucide-react";
import { Header } from "@/components/trading/Header";
import { MarketDataPanel } from "@/components/trading/MarketDataPanel";
import { SEOHead } from "@/components/seo/SEOHead";

const Dashboard = () => {
  const { user } = useAuth();
  const { derivTokens, isDerivReady, balance } = useDeriv();
  const navigate = useNavigate();
  const { data: botInstances, isLoading: botsLoading } = useBotInstances();
  const { data: subscriptions, isLoading: subsLoading } = useMyCopySubscriptions();
  const { data: accounts, isLoading: accountsLoading } = useTradingAccounts();
  const { data: myPlan, isLoading: planLoading } = useMySubscription();
  const { data: notifications } = useNotifications();

  const activeBots = botInstances?.filter(b => b.status === "active").length || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === "active").length || 0;
  const connectedAccounts = Math.max(accounts?.length || 0, derivTokens.length);
  const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;

  const { data: todayPnL = 0 } = useQuery({
    queryKey: ["todays-pnl", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data, error } = await supabase
        .from("executions")
        .select("pnl")
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());
      if (error) throw error;
      return (data || []).reduce((sum, e) => sum + (e.pnl || 0), 0);
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Trading Dashboard" description="Monitor your active trading bots, copy trading subscriptions, and portfolio performance across Deriv and Binance in real time." noIndex />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your accounts, bots, signals and copy trading from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="gold" asChild><Link to="/connections"><Wallet className="mr-2 h-4 w-4" />Connect Account</Link></Button>
            <Button variant="outline" asChild><Link to="/signals">View Signals</Link></Button>
          </div>
        </div>

        {connectedAccounts === 0 && (
          <Card className="glass-card mb-8 border-primary/30 bg-primary/5">
            <CardContent className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-lg">Choose your next step</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore live research first, then connect a supported account when you are ready to execute.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" asChild><Link to="/signals">Review signals</Link></Button>
                <Button variant="gold" asChild><Link to="/connections">Connect account</Link></Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col" asChild><Link to="/connections"><Wallet className="h-6 w-6 mb-2" /><span>Connect Account</span></Link></Button>
          <Button variant="outline" className="h-auto py-4 flex-col" asChild><Link to="/bots"><Bot className="h-6 w-6 mb-2" /><span>Activate Bot</span></Link></Button>
          <Button variant="outline" className="h-auto py-4 flex-col" asChild><Link to="/providers"><Users className="h-6 w-6 mb-2" /><span>Copy Traders</span></Link></Button>
          <Button variant="outline" className="h-auto py-4 flex-col" asChild><Link to="/provider-dashboard"><TrendingUp className="h-6 w-6 mb-2" /><span>Provider Panel</span></Link></Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
