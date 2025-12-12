"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { WeeklyCheckinDialog } from "@/components/weekly-checkin-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProject, deleteProject, getEmployeesForSelect } from "./actions";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconExternalLink } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

// Employee type for the select dropdown
type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

// Project Manager type from joined query
type ProjectManager = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
} | null;

export type Project = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  monthly_revenue: number | null;
  status: string;
  // Core/Static fields
  sow_type: string | null;
  sla_target_type: string | null;
  sla_target_value: number | null;
  billable_cap: number | null;
  project_manager_id: string | null;
  project_manager: ProjectManager;
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
};

// Helper functions for display
const sowTypeLabels: Record<string, string> = {
  paid_media: "Paid Media",
  content_creation: "Content Creation",
  social_listening: "Social Listening",
};

const healthStatusColors: Record<string, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  amber: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const blockerLabels: Record<string, string> = {
  client_approval: "Client Approval",
  creative_capacity: "Creative Capacity",
  tech_issue: "Tech Issue",
  budget_cap: "Budget Cap",
  none: "None",
};

// Get project manager display name
function getProjectManagerName(pm: ProjectManager): string {
  if (!pm) return "—";
  return `${pm.first_name} ${pm.last_name}`;
}

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const project = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
      const [employees, setEmployees] = useState<Employee[]>([]);
      
      useEffect(() => {
        if (isEditDialogOpen) {
          getEmployeesForSelect().then(setEmployees);
        }
      }, [isEditDialogOpen]);
      
      return (
        <>
          <button
            onClick={() => setIsEditDialogOpen(true)}
            className="text-left hover:underline focus:outline-none"
          >
            <div className="font-medium text-blue-600 dark:text-blue-400">{project.name}</div>
            {project.project_manager && (
              <div className="text-xs text-muted-foreground">
                PM: {getProjectManagerName(project.project_manager)}
              </div>
            )}
          </button>
          
          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <form action={async (formData) => {
                try {
                  await updateProject(formData);
                  setIsEditDialogOpen(false);
                  window.location.reload();
                } catch (error) {
                  console.error("Error updating project:", error);
                  alert(error instanceof Error ? error.message : "Failed to update project");
                }
              }}>
                <Input type="hidden" name="id" value={project.id} />
                <DialogHeader>
                  <DialogTitle>Edit Project</DialogTitle>
                  <DialogDescription>
                    Update the project details and health metrics.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="basic" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="sla">SLA</TabsTrigger>
                    <TabsTrigger value="health">Health</TabsTrigger>
                    <TabsTrigger value="links">Links</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={project.name} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project_manager_id">Project Manager</Label>
                        <Select name="project_manager_id" defaultValue={project.project_manager_id || 'none'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select PM" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No PM assigned</SelectItem>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sow_type">SOW Type</Label>
                        <Select name="sow_type" defaultValue={project.sow_type || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="paid_media">Paid Media</SelectItem>
                            <SelectItem value="content_creation">Content Creation</SelectItem>
                            <SelectItem value="social_listening">Social Listening</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthly_revenue">Monthly Revenue</Label>
                        <Input id="monthly_revenue" name="monthly_revenue" type="number" defaultValue={project.monthly_revenue || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="billable_cap">Billable Cap</Label>
                        <Input id="billable_cap" name="billable_cap" type="number" defaultValue={project.billable_cap || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="renewal_date">Renewal Date</Label>
                        <Input id="renewal_date" name="renewal_date" type="date" defaultValue={project.renewal_date ? new Date(project.renewal_date).toISOString().split('T')[0] : ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input id="start_date" name="start_date" type="date" defaultValue={project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input id="end_date" name="end_date" type="date" defaultValue={project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : ''} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" name="description" defaultValue={project.description || ''} />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="sla" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sla_target_type">SLA Target Type</Label>
                        <Input id="sla_target_type" name="sla_target_type" placeholder="e.g., Videos Delivered, ROAS" defaultValue={project.sla_target_type || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sla_target_value">SLA Target Value</Label>
                        <Input id="sla_target_value" name="sla_target_value" type="number" step="0.01" placeholder="e.g., 5, 98" defaultValue={project.sla_target_value || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_actual_value">Current Actual Value</Label>
                        <Input id="current_actual_value" name="current_actual_value" type="number" step="0.01" defaultValue={project.current_actual_value || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_sla_percentage">Current SLA %</Label>
                        <Input id="current_sla_percentage" name="current_sla_percentage" type="number" step="0.01" min="0" max="100" defaultValue={project.current_sla_percentage || ''} />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="health" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="health_status">Health Status</Label>
                        <Select name="health_status" defaultValue={project.health_status || 'green'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">Green (Stable)</SelectItem>
                            <SelectItem value="amber">Amber (At Risk)</SelectItem>
                            <SelectItem value="red">Red (Critical/Churn)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="primary_blocker">Primary Blocker</Label>
                        <Select name="primary_blocker" defaultValue={project.primary_blocker || 'none'}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blocker" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="client_approval">Client Approval</SelectItem>
                            <SelectItem value="creative_capacity">Creative Capacity</SelectItem>
                            <SelectItem value="tech_issue">Tech Issue</SelectItem>
                            <SelectItem value="budget_cap">Budget Cap</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_client_touch">Last Client Touch</Label>
                        <Input id="last_client_touch" name="last_client_touch" type="date" defaultValue={project.last_client_touch ? new Date(project.last_client_touch).toISOString().split('T')[0] : ''} />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="links" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="link_to_sow">Link to SOW (Contract PDF)</Label>
                        <Input id="link_to_sow" name="link_to_sow" type="url" placeholder="https://..." defaultValue={project.link_to_sow || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link_to_live_tracker">Link to Live Tracker</Label>
                        <Input id="link_to_live_tracker" name="link_to_live_tracker" type="url" placeholder="https://docs.google.com/..." defaultValue={project.link_to_live_tracker || ''} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="link_to_asset_folder">Link to Asset Folder</Label>
                        <Input id="link_to_asset_folder" name="link_to_asset_folder" type="url" placeholder="https://drive.google.com/..." defaultValue={project.link_to_asset_folder || ''} />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    accessorKey: "sow_type",
    header: "SOW Type",
    cell: ({ row }) => {
      const sowType = row.getValue("sow_type") as string | null;
      return sowType ? sowTypeLabels[sowType] || sowType : '-';
    },
  },
  {
    accessorKey: "current_sla_percentage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SLA %" />
    ),
    cell: ({ row }) => {
      const sla = row.getValue("current_sla_percentage") as number | null;
      if (sla === null) return '-';
      
      let colorClass = "text-green-600 dark:text-green-400";
      if (sla < 90) colorClass = "text-red-600 dark:text-red-400";
      else if (sla < 95) colorClass = "text-yellow-600 dark:text-yellow-400";
      
      return <span className={`font-semibold ${colorClass}`}>{sla}%</span>;
    },
  },
  {
    accessorKey: "health_status",
    header: "Health",
    cell: ({ row }) => {
      const status = row.getValue("health_status") as string | null;
      if (!status) return '-';
      return (
        <Badge className={healthStatusColors[status] || "bg-gray-100 text-gray-800"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "primary_blocker",
    header: "Blocker",
    cell: ({ row }) => {
      const blocker = row.getValue("primary_blocker") as string | null;
      if (!blocker || blocker === 'none') return '-';
      return (
        <span className="text-sm text-orange-600 dark:text-orange-400">
          {blockerLabels[blocker] || blocker}
        </span>
      );
    },
  },
  {
    accessorKey: "renewal_date",
    header: "Renewal",
    cell: ({ row }) => {
      const date = row.getValue("renewal_date") as string | null;
      if (!date) return '-';
      
      const renewalDate = new Date(date);
      const today = new Date();
      const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let colorClass = "";
      if (daysUntil <= 45 && daysUntil > 0) colorClass = "text-yellow-600 dark:text-yellow-400";
      else if (daysUntil <= 0) colorClass = "text-red-600 dark:text-red-400";
      
      return (
        <span className={colorClass}>
          {renewalDate.toLocaleDateString('id-ID')}
          {daysUntil <= 45 && daysUntil > 0 && <span className="text-xs ml-1">({daysUntil}d)</span>}
        </span>
      );
    },
  },
  {
    accessorKey: "monthly_revenue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Monthly Revenue" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue("monthly_revenue") as number | null;
      if (amount === null) return '-';
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusClass =
        status === 'active'
          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          : status === 'completed'
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original;
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

      return (
        <>
          <div className="flex items-center gap-2">
            <WeeklyCheckinDialog
              projectId={project.id}
              projectName={project.name}
              slaTargetValue={project.sla_target_value}
              slaTargetType={project.sla_target_type}
            />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsViewDialogOpen(true)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("Are you sure you want to delete this project?")) {
                    const formData = new FormData();
                    formData.append("id", project.id);
                    deleteProject(formData);
                  }
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{project.name}</DialogTitle>
                <DialogDescription>
                  {project.project_manager && `Project Manager: ${getProjectManagerName(project.project_manager)}`}
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="sla">SLA</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">SOW Type</Label>
                      <div>{project.sow_type ? sowTypeLabels[project.sow_type] : '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Status</Label>
                      <div className="capitalize">{project.status}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Start Date</Label>
                      <div>{project.start_date ? new Date(project.start_date).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">End Date</Label>
                      <div>{project.end_date ? new Date(project.end_date).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Monthly Revenue</Label>
                      <div>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(project.monthly_revenue || 0)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Billable Cap</Label>
                      <div>{project.billable_cap ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(project.billable_cap) : '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Renewal Date</Label>
                      <div>{project.renewal_date ? new Date(project.renewal_date).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                  </div>
                  {project.description && (
                    <div>
                      <Label className="text-muted-foreground text-xs">Description</Label>
                      <div className="text-sm">{project.description}</div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="sla" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">SLA Target Type</Label>
                      <div>{project.sla_target_type || '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">SLA Target Value</Label>
                      <div>{project.sla_target_value ?? '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Current Actual Value</Label>
                      <div>{project.current_actual_value ?? '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Current SLA %</Label>
                      <div className="font-semibold">
                        {project.current_sla_percentage !== null ? `${project.current_sla_percentage}%` : '-'}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="health" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground text-xs">Health Status</Label>
                      <div>
                        {project.health_status ? (
                          <Badge className={healthStatusColors[project.health_status]}>
                            {project.health_status.charAt(0).toUpperCase() + project.health_status.slice(1)}
                          </Badge>
                        ) : '-'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Primary Blocker</Label>
                      <div>{project.primary_blocker ? blockerLabels[project.primary_blocker] : '-'}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-xs">Last Client Touch</Label>
                      <div>
                        {project.last_client_touch ? (
                          <>
                            {new Date(project.last_client_touch).toLocaleDateString('id-ID')}
                            {(() => {
                              const days = Math.floor((new Date().getTime() - new Date(project.last_client_touch).getTime()) / (1000 * 60 * 60 * 24));
                              return days > 7 ? <span className="text-red-500 ml-2">({days} days ago)</span> : null;
                            })()}
                          </>
                        ) : '-'}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="links" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    {project.link_to_sow && (
                      <a href={project.link_to_sow} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <IconExternalLink className="h-4 w-4" /> Statement of Work (SOW)
                      </a>
                    )}
                    {project.link_to_live_tracker && (
                      <a href={project.link_to_live_tracker} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <IconExternalLink className="h-4 w-4" /> Live Tracker
                      </a>
                    )}
                    {project.link_to_asset_folder && (
                      <a href={project.link_to_asset_folder} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <IconExternalLink className="h-4 w-4" /> Asset Folder
                      </a>
                    )}
                    {!project.link_to_sow && !project.link_to_live_tracker && !project.link_to_asset_folder && (
                      <div className="text-muted-foreground">No links configured</div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];