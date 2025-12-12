"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects, getWeeklyUpdatesForHeatmap } from "../actions";

// Type for project from database with new health fields
interface Project {
  id: string;
  name: string;
  description: string | null;
  monthly_revenue: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  department_id: string | null;
  created_at: string;
  updated_at: string;
  // Core/Static fields
  sow_type: string | null;
  sla_target_type: string | null;
  sla_target_value: number | null;
  billable_cap: number | null;
  project_manager_id: string | null;
  project_manager: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  renewal_date: string | null;
  // Dynamic fields
  current_actual_value: number | null;
  current_sla_percentage: number | null;
  health_status: string | null;
  primary_blocker: string | null;
  last_client_touch: string | null;
  // Link fields
  link_to_sow: string | null;
  link_to_live_tracker: string | null;
  link_to_asset_folder: string | null;
}

interface WeeklyUpdate {
  id: string;
  project_id: string;
  report_date: string;
  actual_value: number | null;
  sla_percentage: number | null;
  health_status: string | null;
  primary_blocker: string | null;
  notes: string | null;
  created_at: string;
}

// Helper to get week number from date
function getWeekNumber(date: Date): string {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return `W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)}`;
}

// Get the last 5 weeks dynamically
function getLast5Weeks(): string[] {
  const weeks: string[] = [];
  const today = new Date();
  
  for (let i = 4; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7));
    weeks.push(getWeekNumber(date));
  }
  
  return weeks;
}

// SOW Type labels
const sowTypeLabels: Record<string, string> = {
  paid_media: "Paid Media",
  content_creation: "Content Creation",
  social_listening: "Social Listening",
};

// Blocker labels
const blockerLabels: Record<string, string> = {
  client_approval: "Client Approval",
  creative_capacity: "Creative Capacity",
  tech_issue: "Tech Issue",
  budget_cap: "Budget Cap",
  none: "None",
};

// Get cell styling based on SLA performance
function getCellStyle(value: number | null): { bg: string; text: string; label: string } {
  if (value === null) {
    return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-400 dark:text-gray-500", label: "No Data" };
  }
  if (value >= 95) {
    return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Stable" };
  }
  if (value >= 90) {
    return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "At Risk" };
  }
  return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Critical" };
}

// Get status badge styling based on health_status field
function getHealthBadge(healthStatus: string | null, slaPercentage: number | null): { variant: "default" | "secondary" | "destructive" | "outline"; label: string } {
  // If health_status is set, use it directly
  if (healthStatus) {
    switch (healthStatus) {
      case 'green':
        return { variant: "default", label: "Healthy" };
      case 'amber':
        return { variant: "secondary", label: "Monitor" };
      case 'red':
        return { variant: "destructive", label: "Churn Risk" };
      default:
        return { variant: "outline", label: "Unknown" };
    }
  }
  
  // Fallback to SLA percentage if health_status is not set
  if (slaPercentage === null) return { variant: "outline", label: "No Data" };
  if (slaPercentage >= 95) return { variant: "default", label: "Healthy" };
  if (slaPercentage >= 90) return { variant: "secondary", label: "Monitor" };
  return { variant: "destructive", label: "Churn Risk" };
}

// Process weekly updates into a heatmap-friendly format
function processWeeklyUpdates(
  updates: WeeklyUpdate[],
  projectId: string,
  weeks: string[]
): Record<string, number | null> {
  const performance: Record<string, number | null> = {};
  
  // Initialize all weeks with null
  weeks.forEach(week => {
    performance[week] = null;
  });
  
  // Fill in actual data from updates
  updates
    .filter(update => update.project_id === projectId)
    .forEach(update => {
      const weekNum = getWeekNumber(new Date(update.report_date));
      if (weeks.includes(weekNum)) {
        performance[weekNum] = update.sla_percentage;
      }
    });
  
  return performance;
}

export default function ProjectHealthHeatmapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyPerformance, setWeeklyPerformance] = useState<Record<string, Record<string, number | null>>>({});
  const [weeks, setWeeks] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, updatesData] = await Promise.all([
          getProjects(),
          getWeeklyUpdatesForHeatmap()
        ]);
        
        setProjects(projectsData);
        
        // Get the last 5 weeks dynamically
        const weekLabels = getLast5Weeks();
        setWeeks(weekLabels);
        
        // Process weekly updates into performance data
        const performanceData: Record<string, Record<string, number | null>> = {};
        projectsData.forEach((project: Project) => {
          performanceData[project.id] = processWeeklyUpdates(
            updatesData,
            project.id,
            weekLabels
          );
        });
        setWeeklyPerformance(performanceData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Count projects by health status
  const healthCounts = {
    healthy: projects.filter(p => p.health_status === 'green' || (!p.health_status && p.current_sla_percentage !== null && p.current_sla_percentage >= 95)).length,
    monitor: projects.filter(p => p.health_status === 'amber' || (!p.health_status && p.current_sla_percentage !== null && p.current_sla_percentage >= 90 && p.current_sla_percentage < 95)).length,
    churnRisk: projects.filter(p => p.health_status === 'red' || (!p.health_status && p.current_sla_percentage !== null && p.current_sla_percentage < 90)).length,
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Project Health Heatmap</h1>
          <p className="text-muted-foreground mt-1">
            SLA performance visualization over the last 5 weeks
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
            <span className="text-sm text-muted-foreground">≥95% Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700" />
            <span className="text-sm text-muted-foreground">90-94% At Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
            <span className="text-sm text-muted-foreground">&lt;90% Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600" />
            <span className="text-sm text-muted-foreground">No Data</span>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly SLA Performance</CardTitle>
          <CardDescription>
            Track project health trends and identify potential churn risks. Data from weekly check-ins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Project Name</TableHead>
                <TableHead className="w-[120px]">Project Manager</TableHead>
                <TableHead className="w-[100px]">SOW Type</TableHead>
                <TableHead className="w-[100px]">Blocker</TableHead>
                {weeks.map((week) => (
                  <TableHead key={week} className="text-center w-[80px]">
                    {week}
                  </TableHead>
                ))}
                <TableHead className="text-center w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                    No projects found. Add projects to see the health heatmap.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const performance = weeklyPerformance[project.id] || {};
                  const healthBadge = getHealthBadge(project.health_status, project.current_sla_percentage);
                  
                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="font-medium">{project.name}</div>
                        {project.renewal_date && (
                          <div className="text-xs text-muted-foreground">
                            Renewal: {new Date(project.renewal_date).toLocaleDateString('id-ID')}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {project.project_manager
                          ? `${project.project_manager.first_name} ${project.project_manager.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {project.sow_type ? sowTypeLabels[project.sow_type] || project.sow_type : "—"}
                      </TableCell>
                      <TableCell>
                        {project.primary_blocker && project.primary_blocker !== 'none' ? (
                          <span className="text-xs text-orange-600 dark:text-orange-400">
                            {blockerLabels[project.primary_blocker] || project.primary_blocker}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {weeks.map((week) => {
                        const value = performance[week] ?? null;
                        const style = getCellStyle(value);
                        
                        return (
                          <TableCell key={week} className="p-1">
                            <div
                              className={`${style.bg} ${style.text} rounded-md py-2 px-2 text-center font-semibold text-sm transition-colors`}
                              title={`${style.label}${value !== null ? ` - ${value}%` : ''}`}
                            >
                              {value !== null ? `${value}%` : "-"}
                            </div>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center">
                        <Badge variant={healthBadge.variant}>{healthBadge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Healthy (Green)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {healthCounts.healthy}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monitor (Amber)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {healthCounts.monitor}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Risk (Red)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {healthCounts.churnRisk}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocker Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Blocker Analysis</CardTitle>
          <CardDescription>
            Projects with active blockers that need attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(blockerLabels).filter(([key]) => key !== 'none').map(([key, label]) => {
              const count = projects.filter(p => p.primary_blocker === key).length;
              return (
                <div key={key} className="p-4 rounded-lg border">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="text-2xl font-bold mt-1">{count}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client Touch Alert */}
      {projects.filter(p => {
        if (!p.last_client_touch) return false;
        const days = Math.floor((new Date().getTime() - new Date(p.last_client_touch).getTime()) / (1000 * 60 * 60 * 24));
        return days > 7;
      }).length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-orange-600 dark:text-orange-400">⚠️ Client Touch Alerts</CardTitle>
            <CardDescription>
              Projects with no client contact in over 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.filter(p => {
                if (!p.last_client_touch) return false;
                const days = Math.floor((new Date().getTime() - new Date(p.last_client_touch).getTime()) / (1000 * 60 * 60 * 24));
                return days > 7;
              }).map(project => {
                const days = Math.floor((new Date().getTime() - new Date(project.last_client_touch!).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={project.id} className="flex justify-between items-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {project.project_manager
                          ? `${project.project_manager.first_name} ${project.project_manager.last_name}`
                          : "No project manager"}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {days} days ago
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}