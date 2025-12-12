"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IconSearch, IconX, IconLayoutColumns, IconChevronDown } from "@tabler/icons-react";
import { getPayrollData, getDepartments } from "./actions";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function PayrollPage() {
  const [data, setData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [tableKey, setTableKey] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [payrollData, departmentsData] = await Promise.all([
        getPayrollData(),
        getDepartments(),
      ]);
      
      const enrichedPayrollData = payrollData.map((employee: any) => ({
        ...employee,
        departments: departmentsData.find((d: any) => d.id === employee.department_id),
      }));

      setData(enrichedPayrollData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let filtered = data.filter(
      (employee) => statusFilter === "all" || employee.status === statusFilter
    );
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((employee) => {
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const reverseName = `${employee.last_name} ${employee.first_name}`.toLowerCase();
        const empNo = employee.emp_no?.toLowerCase() || '';
        return fullName.includes(query) || reverseName.includes(query) || empNo.includes(query);
      });
    }
    
    return filtered;
  }, [data, statusFilter, searchQuery]);

  const table = useReactTable({
    data: filteredData,
    columns,
    enableRowSelection: true,
    getRowId: (row: any) => row.id,
    getCoreRowModel: getCoreRowModel(),
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
    initialState: {
      pagination: {
        pageSize: filteredData.length || 100,
      },
    },
  });

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
        </div>
        
        {/* Table skeleton */}
        <div className="flex-1 space-y-4">
          <div className="rounded-md border">
            {/* Table header */}
            <div className="border-b bg-muted/50 p-4">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            {/* Table rows */}
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border-b p-4">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
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
        <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <IconLayoutColumns className="w-4 h-4" />
                    <span className="hidden lg:inline">Customize Columns</span>
                    <span className="lg:hidden">Columns</span>
                    <IconChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      const columnLabel =
                        column.id === "name"
                          ? "Name"
                          : column.id === "emp_no"
                          ? "Emp.No."
                          : column.id === "department"
                          ? "Department"
                          : column.id === "status"
                          ? "Status"
                          : column.id === "basic_salary"
                          ? "Basic Salary"
                          : column.id === "total_income"
                          ? "Total Income"
                          : column.id === "total_deduction"
                          ? "Total Deduction"
                          : column.id === "take_home_pay"
                          ? "Take Home Pay"
                          : column.id;

                      const isVisible = column.getIsVisible();

                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={isVisible}
                          onCheckedChange={(value) => {
                            column.toggleVisibility(!!value);
                            setTableKey(k => k + 1);
                          }}
                          onSelect={(e) => {
                            e.preventDefault();
                          }}
                        >
                          {columnLabel}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <IconX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <TabsContent value={statusFilter} className="flex-1 overflow-hidden">
          <DataTable
            key={tableKey}
            columns={columns}
            data={filteredData}
            showPagination={false}
            initialColumnVisibility={columnVisibility}
            meta={{
              updateData: (rowIndex: number, columnId: string, value: any) => {
                setData(old =>
                  old.map((row, index) => {
                    if (index === rowIndex) {
                      return {
                        ...old[rowIndex]!,
                        [columnId]: value,
                      }
                    }
                    return row
                  })
                )
                loadData();
              },
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}