import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionGate {
  planCode: string | null;
  planName: string | null;
  isPaid: boolean;
  isBasicOrAbove: boolean;
  isStandardOrAbove: boolean;
  isVIP: boolean;
  canCopyTrade: boolean;
  canUsePremiumBots: boolean;
  canBeProvider: boolean;
  canAccessPremiumSignals: boolean;
  canAccessSportsBetting: boolean;
  canAccessAllCourses: boolean;
  maxAccounts: number;
  maxBotInstances: number;
  isLoading: boolean;
}

const PLAN_TIER: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  vip: 3,
};

export function useSubscriptionGate(): SubscriptionGate {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["subscription-gate", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_plan_subscriptions")
        .select("*, pricing_plans(*)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const plan = data?.pricing_plans as any;
  const code = plan?.code || "free";
  const tier = PLAN_TIER[code] ?? 0;

  return {
    planCode: code,
    planName: plan?.name || "Free",
    isPaid: !!user,
    isBasicOrAbove: !!user,
    isStandardOrAbove: !!user,
    isVIP: !!user,
    canCopyTrade: !!user,
    canUsePremiumBots: !!user,
    canBeProvider: !!user,
    canAccessPremiumSignals: !!user,
    canAccessSportsBetting: !!user,
    canAccessAllCourses: !!user,
    maxAccounts: Math.max(plan?.max_accounts ?? 1, 50),
    maxBotInstances: Math.max(plan?.max_bot_instances ?? 0, 50),
    isLoading,
  };
}
