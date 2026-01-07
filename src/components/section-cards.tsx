"use client";

import { IconTrendingDown, IconTrendingUp, IconBuildingBank, IconUsers, IconUserCheck, IconChartLine, IconArrowRight } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getBalanceWithTrendAction } from "@/actions/kledo-actions"
import { cn } from "@/lib/utils"

interface SectionCardsProps {
  selectedDate?: string;
}

interface BalanceData {
  currentBalance: number;
  previousBalance: number | null;
  trend: number | null;
  asOfDate: string;
}

export function SectionCards({ selectedDate }: SectionCardsProps) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      setIsLoading(true);
      const res = await getBalanceWithTrendAction(selectedDate);
      if (res.success && res.data) {
        setBalanceData(res.data);
      } else {
        setBalanceData(null);
      }
      setIsLoading(false);
    }
    fetchBalance();
  }, [selectedDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    if (Math.abs(amount) >= 1e9) {
      return `Rp ${(amount / 1e9).toFixed(1)}B`;
    } else if (Math.abs(amount) >= 1e6) {
      return `Rp ${(amount / 1e6).toFixed(1)}M`;
    }
    return formatCurrency(amount);
  };

  const formatTrend = (trend: number) => {
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(2)}%`;
  };

  const formattedBalance = balanceData?.currentBalance !== undefined
    ? formatCurrency(balanceData.currentBalance)
    : "Not Connected";

  const trendValue = balanceData?.trend ?? null;
  const isPositiveTrend = trendValue !== null && trendValue >= 0;
  const balanceDiff = balanceData && balanceData.previousBalance !== null
    ? balanceData.currentBalance - balanceData.previousBalance
    : null;

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Bank Balance Card */}
      <Card className="@container/card min-w-0 overflow-hidden">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconBuildingBank size={18} />
            </div>
            <CardDescription className="text-sm font-medium">Bank Balance</CardDescription>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <CardTitle className="text-2xl font-bold tabular-nums">
              {isLoading ? (
                <span className="animate-pulse text-muted-foreground">Loading...</span>
              ) : (
                formattedBalance
              )}
            </CardTitle>
            {trendValue !== null && (
              <span className={cn(
                "flex items-center gap-0.5 text-sm font-medium",
                isPositiveTrend ? "text-green-600" : "text-red-600"
              )}>
                {isPositiveTrend ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                {formatTrend(trendValue)}
              </span>
            )}
          </div>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          {balanceDiff !== null ? (
            <div className="flex items-center gap-2">
              <span className={isPositiveTrend ? "text-green-600" : "text-red-600"}>
                {isPositiveTrend ? '+' : ''}{formatCompactCurrency(balanceDiff)}
              </span>
              <span>from last month</span>
              <IconArrowRight className="size-4" />
            </div>
          ) : (
            <span>Total calculated balance</span>
          )}
        </CardFooter>
      </Card>

      {/* New Customers Card */}
      <Card className="@container/card min-w-0 overflow-hidden">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconUsers size={18} />
            </div>
            <CardDescription className="text-sm font-medium">New Customers</CardDescription>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <CardTitle className="text-2xl font-bold tabular-nums">
              1,234
            </CardTitle>
            <span className="flex items-center gap-0.5 text-sm font-medium text-red-600">
              <IconTrendingDown className="size-4" />
              -20%
            </span>
          </div>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-red-600">-308</span>
            <span>from last month</span>
            <IconArrowRight className="size-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Active Accounts Card */}
      <Card className="@container/card min-w-0 overflow-hidden">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconUserCheck size={18} />
            </div>
            <CardDescription className="text-sm font-medium">Active Accounts</CardDescription>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <CardTitle className="text-2xl font-bold tabular-nums">
              45,678
            </CardTitle>
            <span className="flex items-center gap-0.5 text-sm font-medium text-green-600">
              <IconTrendingUp className="size-4" />
              +12.5%
            </span>
          </div>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-green-600">+5,083</span>
            <span>from last month</span>
            <IconArrowRight className="size-4" />
          </div>
        </CardFooter>
      </Card>

      {/* Growth Rate Card */}
      <Card className="@container/card min-w-0 overflow-hidden">
        <CardHeader className="gap-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <IconChartLine size={18} />
            </div>
            <CardDescription className="text-sm font-medium">Growth Rate</CardDescription>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <CardTitle className="text-2xl font-bold tabular-nums">
              4.5%
            </CardTitle>
            <span className="flex items-center gap-0.5 text-sm font-medium text-green-600">
              <IconTrendingUp className="size-4" />
              +0.8%
            </span>
          </div>
        </CardHeader>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-green-600">+0.8%</span>
            <span>from last month</span>
            <IconArrowRight className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
