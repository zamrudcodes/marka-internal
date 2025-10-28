"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { IconTrash, IconDownload, IconUserOff, IconSearch, IconX } from "@tabler/icons-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { addEmployee, getEmployees, updateEmployee, deleteEmployee, bulkImportEmployees, deactivateEmployee, exportEmployees } from "./actions";
import { getDepartments } from "../bonus-periods/actions";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { IconLayoutColumns, IconChevronDown, IconUser, IconBriefcase, IconUserCircle, IconPhone, IconMessages, IconFileText } from "@tabler/icons-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  // Column visibility will be managed by react-table's internal state.
  // Avoid duplicating visibility in React state to prevent sync issues.
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Force re-render key when visibility changes
  const [tableKey, setTableKey] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);

  // Debug: log when rowSelection changes and how many are selected
  useEffect(() => {
    try {
      console.log("[Employees] rowSelection changed", {
        keys: Object.keys(rowSelection),
        count: Object.keys(rowSelection).length,
        statusFilter,
      });
    } catch {}
  }, [rowSelection, statusFilter]);

  // Derive a stable selected count from the table to drive toolbar visibility
  useEffect(() => {
    const count = table.getFilteredSelectedRowModel().rows.length;
    setSelectedCount(count);
    try {
      console.log("[Employees] derived selectedCount", {
        count,
        statusFilter,
      });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, statusFilter, columnFilters, sorting]);

  useEffect(() => {
    loadData();

    // Listen for deactivation events from the columns component
    const handleDeactivateEvent = (event: any) => {
      setDeactivatingEmployee(event.detail);
      setIsDeactivateDialogOpen(true);
    };

    window.addEventListener('deactivate-employee', handleDeactivateEvent);
    return () => {
      window.removeEventListener('deactivate-employee', handleDeactivateEvent);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeesData, deptsData] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);
      setEmployees(employeesData);
      setDepartments(deptsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;
    
    try {
      await addEmployee(formData);
      toast.success("Employee added successfully!");
      loadData();

      if ((e.nativeEvent as any).submitter.name === "save-and-add") {
        form.reset();
      } else {
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Failed to add employee");
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateEmployee(formData);
      setEditingEmployee(null);
      loadData();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Failed to update employee");
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      const formData = new FormData();
      formData.append("id", id);
      
      try {
        await deleteEmployee(formData);
        loadData();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Failed to delete employee");
      }
    }
  };

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedCount = selectedRows.length;
    
    if (selectedCount === 0) {
      toast.error("No employees selected");
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedCount} employee(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete each selected employee
      for (const row of selectedRows) {
        const formData = new FormData();
        formData.append("id", row.original.id);
        await deleteEmployee(formData);
      }
      
      toast.success(`Successfully deleted ${selectedCount} employee(s)`);
      setRowSelection({});
      loadData();
    } catch (error) {
      console.error("Error bulk deleting employees:", error);
      toast.error("Failed to delete some employees");
    }
  };

  const handleDeactivateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", deactivatingEmployee.id);
    
    try {
      await deactivateEmployee(formData);
      toast.success("Employee deactivated successfully");
      setIsDeactivateDialogOpen(false);
      setDeactivatingEmployee(null);
      loadData();
    } catch (error) {
      console.error("Error deactivating employee:", error);
      toast.error("Failed to deactivate employee");
    }
  };

  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      toast.info(`Preparing ${format.toUpperCase()} export...`);
      const data = await exportEmployees(format);
      
      // Transform data for export
      const exportData = data.map((emp: any) => ({
        'First Name': emp.first_name,
        'Last Name': emp.last_name,
        'Email': emp.email,
        'Department': emp.departments?.name || 'N/A',
        'Salary': emp.salary,
        'Hire Date': emp.hire_date,
        'Status': emp.status,
        'Phone': emp.phone_number || '',
        'Gender': emp.gender || '',
        'Contract Status': emp.contract_status || '',
        'Tenure (Months)': emp.tenure_months || '',
        'Marital Status': emp.marital_status || '',
        'Birth Date': emp.birth_date || '',
        'Age': emp.age || '',
        'Birthplace': emp.birthplace || '',
        'Current Address': emp.current_address || '',
        'Emergency Contact': emp.emergency_contact_phone || '',
        'Emergency Contact Name': emp.emergency_contact_name_relationship || '',
      }));

      if (format === 'csv') {
        // Convert to CSV
        const ws = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Convert to XLSX
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
        XLSX.writeFile(wb, `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      }
      
      toast.success(`Successfully exported ${exportData.length} employees to ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting employees:", error);
      toast.error("Failed to export employees");
    }
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(
      (employee) => statusFilter === "all" || employee.status === statusFilter
    );
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((employee) => {
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        const reverseName = `${employee.last_name} ${employee.first_name}`.toLowerCase();
        return fullName.includes(query) || reverseName.includes(query);
      });
    }
    
    return filtered;
  }, [employees, statusFilter, searchQuery]);

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    enableRowSelection: true,
    getRowId: (row: any) => row.id,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: (updater) => {
      // Handle both function and direct value updates
      setColumnVisibility(updater);
    },
    onRowSelectionChange: (updater) => {
      setRowSelection((prev: any) => {
        const next =
          typeof updater === "function" ? (updater as any)(prev) : updater;
        try {
          console.log("[Employees] onRowSelectionChange", {
            prevKeys: Object.keys(prev || {}),
            nextKeys: Object.keys((next as any) || {}),
            nextCount: Object.keys((next as any) || {}).length,
          });
        } catch {}
        return next as any;
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: filteredEmployees.length || 100, // Show all rows
      },
    },
  });


  const handleColumnToggle = useCallback((columnId: string, value: boolean) => {
    // Use flushSync to force React to apply state updates synchronously
    // This ensures the table re-renders immediately when visibility changes
    flushSync(() => {
      setColumnVisibility((prev) => {
        const newVisibility = {
          ...prev,
          [columnId]: value
        };
        // Force table re-render by incrementing key
        setTableKey(k => k + 1);
        return newVisibility;
      });
    });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
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
                  <IconDownload className="w-4 h-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                  Export as XLSX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <IconTrash className="w-4 h-4" />
                Delete ({selectedCount})
              </Button>
            )}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <IconChevronDown />
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
                        : column.id === "email"
                        ? "Email"
                        : column.id === "department"
                        ? "Department"
                        : column.id === "salary"
                        ? "Salary"
                        : column.id === "hire_date"
                        ? "Hire Date"
                        : column.id === "status"
                        ? "Status"
                        : column.id;

                    // Use the table instance to read current visibility so checkbox reflects live state
                    const colInstance = table.getColumn(column.id);
                    const isVisible = colInstance ? colInstance.getIsVisible() : column.getIsVisible();

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={isVisible}
                        onCheckedChange={(value) => {
                          handleColumnToggle(column.id, !!value);
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
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Bulk Import</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Import Employees</DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Upload a CSV or XLSX file to bulk import employee data.</p>
                      <div className="space-y-1">
                        <p className="font-medium">Supported formats:</p>
                        <ul className="list-disc list-inside text-xs space-y-0.5">
                          <li>Standard template (30 columns)</li>
                          <li>HR Base format (auto-detected)</li>
                        </ul>
                      </div>
                      <div className="flex gap-3">
                        <a href="/employee_import_template.csv" download className="text-blue-500 underline text-xs">Download CSV Template</a>
                        <a href="/employee_import_template.xlsx" download className="text-blue-500 underline text-xs">Download XLSX Template</a>
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <form action={async (formData) => {
                  try {
                    const result = await bulkImportEmployees(formData);
                    if (result.success) {
                      toast.success("Bulk import successful!");
                      loadData();
                    } else {
                      toast.error(`Bulk import failed: ${result.message}`, {
                        duration: Infinity,
                        closeButton: true,
                      });
                    }
                  } catch (error: any) {
                    toast.error(`Bulk import failed: ${error.message}`, {
                      duration: Infinity,
                      closeButton: true,
                    });
                  } finally {
                    setIsImportDialogOpen(false);
                  }
                }}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="file" className="text-right">
                        File
                      </Label>
                      <Input id="file" name="file" type="file" accept=".csv,.xlsx,.xls" className="col-span-3" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Import</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Employee</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleAddEmployee}>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                      Enter the details for the new employee. Fields marked with * are required.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-8 py-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconUser className="w-5 h-5" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                          <Input id="first_name" name="first_name" required className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                          <Input id="last_name" name="last_name" required className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferred_nickname">Preferred Nickname</Label>
                          <Input id="preferred_nickname" name="preferred_nickname" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <Input id="email" name="email" type="email" required className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <Input id="phone_number" name="phone_number" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender">Gender</Label>
                          <Select name="gender">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Employment Details */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconBriefcase className="w-5 h-5" />
                        Employment Details
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="department_id">Department <span className="text-red-500">*</span></Label>
                          <Select name="department_id" required>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Salary (IDR)</Label>
                          <Input id="salary" name="salary" type="number" step="1000" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hire_date">Hire Date <span className="text-red-500">*</span></Label>
                          <Input id="hire_date" name="hire_date" type="date" required className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contract_status">Contract Status</Label>
                          <Select name="contract_status">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="permanent">Permanent</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="probation">Probation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pkwt">PKWT</Label>
                          <Input id="pkwt" name="pkwt" className="max-w-md" />
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconUserCircle className="w-5 h-5" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birth_date">Birth Date</Label>
                          <Input id="birth_date" name="birth_date" type="date" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input id="age" name="age" type="number" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthplace">Birthplace</Label>
                          <Input id="birthplace" name="birthplace" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="marital_status">Marital Status</Label>
                          <Select name="marital_status">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ptkp_status">PTKP Status</Label>
                          <Select name="ptkp_status">
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select PTKP status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TK/0">TK/0</SelectItem>
                              <SelectItem value="K/0">K/0</SelectItem>
                              <SelectItem value="K/1">K/1</SelectItem>
                              <SelectItem value="K/2">K/2</SelectItem>
                              <SelectItem value="K/3">K/3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="current_address">Current Address</Label>
                          <Input id="current_address" name="current_address" className="max-w-full" />
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconPhone className="w-5 h-5" />
                        Emergency Contact
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                          <Input id="emergency_contact_phone" name="emergency_contact_phone" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emergency_contact_name_relationship">Contact Name & Relationship</Label>
                          <Input id="emergency_contact_name_relationship" name="emergency_contact_name_relationship" placeholder="e.g., John Doe (Spouse)" className="max-w-md" />
                        </div>
                      </div>
                    </div>

                    {/* Lark Integration */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconMessages className="w-5 h-5" />
                        Lark Integration
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lark_user">Lark User ID</Label>
                          <Input id="lark_user" name="lark_user" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lark_work_email">Lark Work Email</Label>
                          <Input id="lark_work_email" name="lark_work_email" type="email" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lark_status">Lark Status</Label>
                          <Input id="lark_status" name="lark_status" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instagram_handle">Instagram Handle</Label>
                          <Input id="instagram_handle" name="instagram_handle" placeholder="@username" className="max-w-md" />
                        </div>
                      </div>
                    </div>

                    {/* Documents & Banking */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                        <IconFileText className="w-5 h-5" />
                        Documents & Banking
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ktp_photo_url">KTP Photo URL</Label>
                          <Input id="ktp_photo_url" name="ktp_photo_url" placeholder="https://..." className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="npwp_photo_url">NPWP Photo URL</Label>
                          <Input id="npwp_photo_url" name="npwp_photo_url" placeholder="https://..." className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="avatar_url">Avatar URL</Label>
                          <Input id="avatar_url" name="avatar_url" placeholder="https://..." className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kartu_keluarga_number">Kartu Keluarga Number</Label>
                          <Input id="kartu_keluarga_number" name="kartu_keluarga_number" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bca_account_number">BCA Account Number</Label>
                          <Input id="bca_account_number" name="bca_account_number" className="max-w-md" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bpjs_tk_id">BPJS TK ID</Label>
                          <Input id="bpjs_tk_id" name="bpjs_tk_id" className="max-w-md" />
                        </div>
                        <div className="space-y-2 flex items-center gap-2">
                          <Checkbox id="pkwt_synced" name="pkwt_synced" />
                          <Label htmlFor="pkwt_synced" className="cursor-pointer">PKWT Synced</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Employee</Button>
                    <Button type="submit" name="save-and-add">Save and Add New</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search employees by name..."
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
            data={filteredEmployees}
            showPagination={false}
          />
        </TabsContent>
      </Tabs>

      {/* Deactivate Employee Dialog */}
      <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
        <DialogContent>
          <form onSubmit={handleDeactivateEmployee}>
            <DialogHeader>
              <DialogTitle>Deactivate Employee</DialogTitle>
              <DialogDescription>
                Mark {deactivatingEmployee?.first_name} {deactivatingEmployee?.last_name} as inactive. This will exclude them from future payroll runs.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="termination_date" className="text-right">
                  Termination Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="termination_date"
                  name="termination_date"
                  type="date"
                  required
                  className="col-span-3"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                  Reason
                </Label>
                <Input
                  id="reason"
                  name="reason"
                  placeholder="e.g., Resignation, Retirement, etc."
                  className="col-span-3"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsDeactivateDialogOpen(false);
                setDeactivatingEmployee(null);
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                <IconUserOff className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}