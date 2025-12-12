"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconRefresh, IconTrendingUp, IconTrendingDown, IconAlertCircle } from "@tabler/icons-react";
import { toast } from "sonner";
import { getGoogleAdsPerformance, type PerformanceData, type Recommendation } from "./actions";

export default function AdsPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGoogleAdsPerformance();
      setPerformanceData(data.performance);
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error("Error loading Google Ads data:", error);
      toast.error("Failed to load Google Ads performance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Ads Performance</h1>
          <p className="text-muted-foreground">
            Insights and recommendations for your advertising campaigns
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <IconRefresh className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.impressions.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.impressionsChange || "+0%"} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.clicks.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.clicksChange || "+0%"} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click-Through Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData?.ctr || "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.ctrChange || "+0%"} from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <IconTrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${performanceData?.cost.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData?.costChange || "+0%"} from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Recommendations</h2>
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No recommendations available at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((rec, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    rec.priority === "high" 
                      ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      : rec.priority === "medium"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                  }`}>
                    <IconAlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {rec.description}
                    </CardDescription>
                    {rec.impact && (
                      <p className="text-sm font-medium mt-2 text-green-600 dark:text-green-400">
                        Expected Impact: {rec.impact}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}