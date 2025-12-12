"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addProject, getProjects, getEmployeesForSelect } from "./actions";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconLayoutColumns, IconChevronDown } from "@tabler/icons-react";
import { toast } from "sonner";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("active");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, employeesData] = await Promise.all([
        getProjects(),
        getEmployeesForSelect()
      ]);
      setProjects(projectsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    try {
      await addProject(formData);
      toast.success("Project added successfully!");
      loadData();

      if ((e.nativeEvent as any).submitter.name === "save-and-add") {
        form.reset();
      } else {
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      alert(error instanceof Error ? error.message : "Failed to add project");
    }
  };

  const filteredProjects = useMemo(() =>
    projects.filter(
      (project) => statusFilter === "all" || project.status === statusFilter
    ), [projects, statusFilter]
  );

  const table = useReactTable({
    data: filteredProjects,
    columns,
    getRowId: (row: any) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        
        {/* Table skeleton */}
        <div className="flex-1 space-y-4">
          <div className="rounded-md border">
            {/* Table header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            {/* Table rows */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-b p-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="mr-2 h-4 w-4" />
                  Columns
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter(
                    (column) => column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Project</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <form onSubmit={handleAddProject}>
                  <DialogHeader>
                    <DialogTitle>Add Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to the system with health tracking.
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
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project_manager_id">Project Manager</Label>
                          <Select name="project_manager_id">
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
                          <Select name="sow_type">
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
                          <Input id="monthly_revenue" name="monthly_revenue" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billable_cap">Billable Cap</Label>
                          <Input id="billable_cap" name="billable_cap" type="number" placeholder="Max budget" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="renewal_date">Renewal Date</Label>
                          <Input id="renewal_date" name="renewal_date" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Start Date</Label>
                          <Input id="start_date" name="start_date" type="date" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date">End Date</Label>
                          <Input id="end_date" name="end_date" type="date" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="Project description..." />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sla" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sla_target_type">SLA Target Type</Label>
                          <Input id="sla_target_type" name="sla_target_type" placeholder="e.g., Videos Delivered, ROAS" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sla_target_value">SLA Target Value</Label>
                          <Input id="sla_target_value" name="sla_target_value" type="number" step="0.01" placeholder="e.g., 5, 98" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current_actual_value">Current Actual Value</Label>
                          <Input id="current_actual_value" name="current_actual_value" type="number" step="0.01" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current_sla_percentage">Current SLA %</Label>
                          <Input id="current_sla_percentage" name="current_sla_percentage" type="number" step="0.01" min="0" max="100" />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="health" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="health_status">Health Status</Label>
                          <Select name="health_status" defaultValue="green">
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
                          <Select name="primary_blocker" defaultValue="none">
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
                          <Input id="last_client_touch" name="last_client_touch" type="date" />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="links" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="link_to_sow">Link to SOW (Contract PDF)</Label>
                          <Input id="link_to_sow" name="link_to_sow" type="url" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link_to_live_tracker">Link to Live Tracker</Label>
                          <Input id="link_to_live_tracker" name="link_to_live_tracker" type="url" placeholder="https://docs.google.com/..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="link_to_asset_folder">Link to Asset Folder</Label>
                          <Input id="link_to_asset_folder" name="link_to_asset_folder" type="url" placeholder="https://drive.google.com/..." />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                    <Button type="submit" name="save-and-add">Save and Add New</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value={statusFilter} className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredProjects}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}