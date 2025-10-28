"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toTitleCase, formatName } from "@/lib/utils/text-format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconDotsVertical, IconUser, IconBriefcase, IconUserCircle, IconPhone, IconMessages, IconFileText, IconCheck, IconX } from "@tabler/icons-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useState, useEffect } from "react";
import { updateEmployee } from "./actions";
import { getDepartments } from "../bonus-periods/actions";
import { toast } from "sonner";

export type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_id: string;
  departments?: {
    id: string;
    name: string;
  };
  salary: number;
  hire_date: string;
  status: "active" | "inactive" | "archived";
  avatar_url?: string;
  lark_user?: string;
  preferred_nickname?: string;
  lark_work_email?: string;
  gender?: string;
  contract_status?: string;
  tenure_months?: number;
  marital_status?: string;
  ptkp_status?: string;
  instagram_handle?: string;
  ktp_photo_url?: string;
  npwp_photo_url?: string;
  kartu_keluarga_number?: string;
  bca_account_number?: string;
  birth_date?: string;
  age?: number;
  birthplace?: string;
  current_address?: string;
  emergency_contact_phone?: string;
  emergency_contact_name_relationship?: string;
  phone_number?: string;
  lark_status?: string;
  pkwt?: string;
  pkwt_synced?: boolean;
  bpjs_tk_id?: string;
};

// Editable cell component for text fields
function EditableCell({
  value,
  employeeId,
  field,
  onSave,
  type = "text"
}: {
  value: any;
  employeeId: string;
  field: string;
  onSave: () => void;
  type?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("id", employeeId);
    formData.append(field, editValue);

    try {
      await updateEmployee(formData);
      toast.success("Updated successfully");
      setIsEditing(false);
      onSave();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="h-8 text-sm"
          autoFocus
          disabled={isSaving}
        />
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <IconCheck className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <IconX className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded min-h-[32px] flex items-center"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground">Click to edit</span>}
    </div>
  );
}

// Editable select cell for dropdowns
function EditableSelectCell({
  value,
  employeeId,
  field,
  options,
  onSave,
  formatDisplay
}: {
  value: any;
  employeeId: string;
  field: string;
  options: { value: string; label: string }[];
  onSave: () => void;
  formatDisplay?: (val: any) => string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (newValue: string) => {
    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("id", employeeId);
    formData.append(field, newValue);

    try {
      await updateEmployee(formData);
      toast.success("Updated successfully");
      setIsEditing(false);
      onSave();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Select
          value={editValue}
          onValueChange={(val) => {
            setEditValue(val);
            handleSave(val);
          }}
          disabled={isSaving}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
        >
          <IconX className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const displayValue = formatDisplay ? formatDisplay(value) : value;
  return (
    <div
      className="cursor-pointer hover:bg-muted/50 px-2 py-1 rounded min-h-[32px] flex items-center"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue || <span className="text-muted-foreground">Click to edit</span>}
    </div>
  );
}

export const columns: ColumnDef<Employee>[] = [
  {
    id: "name",
    accessorKey: "first_name",
    header: "Name",
    enableHiding: true,
    cell: ({ row }) => {
      const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
      const employee = row.original;
      
      // Get initials for avatar fallback
      const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

      return (
        <>
          <button
            onClick={() => setIsViewDialogOpen(true)}
            className="flex items-center gap-3 text-left hover:underline cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={employee.avatar_url} alt={formatName(employee.first_name, employee.last_name)} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span>{formatName(row.original.first_name, row.original.last_name)}</span>
          </button>

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Employee Details</DialogTitle>
                <DialogDescription>
                  Viewing details for {employee.first_name} {employee.last_name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-8 py-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconUser className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{formatName(employee.first_name, employee.last_name)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Preferred Nickname</p>
                      <p className="font-medium">{toTitleCase(employee.preferred_nickname) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone Number</p>
                      <p className="font-medium">{employee.phone_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{toTitleCase(employee.gender) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline">{toTitleCase(employee.status)}</Badge>
                    </div>
                  </div>
                </div>

                {/* Employment Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconBriefcase className="w-5 h-5" />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium">{toTitleCase(employee.departments?.name) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">{formatCurrency(employee.salary)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Hire Date</p>
                      <p className="font-medium">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Contract Status</p>
                      <p className="font-medium">{toTitleCase(employee.contract_status) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tenure</p>
                      <p className="font-medium">
                        {employee.tenure_months ? (() => {
                          const years = Math.floor(employee.tenure_months / 12);
                          const months = employee.tenure_months % 12;
                          if (years > 0 && months > 0) {
                            return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
                          } else if (years > 0) {
                            return `${years} year${years > 1 ? 's' : ''}`;
                          } else {
                            return `${months} month${months > 1 ? 's' : ''}`;
                          }
                        })() : "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PKWT</p>
                      <p className="font-medium">{employee.pkwt || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">PKWT Synced</p>
                      <p className="font-medium">{employee.pkwt_synced ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconUserCircle className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Birth Date</p>
                      <p className="font-medium">{employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{employee.age || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Birthplace</p>
                      <p className="font-medium">{toTitleCase(employee.birthplace) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Marital Status</p>
                      <p className="font-medium">{toTitleCase(employee.marital_status) || "N/A"}</p>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-sm text-muted-foreground">Current Address</p>
                      <p className="font-medium">{toTitleCase(employee.current_address) || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconPhone className="w-5 h-5" />
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{employee.emergency_contact_phone || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Name & Relationship</p>
                      <p className="font-medium">{toTitleCase(employee.emergency_contact_name_relationship) || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Lark Integration */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconMessages className="w-5 h-5" />
                    Lark Integration
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lark User ID</p>
                      <p className="font-medium">{toTitleCase(employee.lark_user) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lark Work Email</p>
                      <p className="font-medium">{employee.lark_work_email || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Lark Status</p>
                      <p className="font-medium">{toTitleCase(employee.lark_status) || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Instagram Handle</p>
                      <p className="font-medium">{employee.instagram_handle || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Documents & Banking */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                    <IconFileText className="w-5 h-5" />
                    Documents & Banking
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">KTP Photo</p>
                      <p className="font-medium">{employee.ktp_photo_url ? "Available" : "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">NPWP Photo</p>
                      <p className="font-medium">{employee.npwp_photo_url ? "Available" : "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avatar</p>
                      <p className="font-medium">{employee.avatar_url ? "Available" : "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Kartu Keluarga Number</p>
                      <p className="font-medium">{employee.kartu_keluarga_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">BCA Account Number</p>
                      <p className="font-medium">{employee.bca_account_number || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">BPJS TK ID</p>
                      <p className="font-medium">{employee.bpjs_tk_id || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: "Email",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <EditableCell
          value={row.original.email}
          employeeId={row.original.id}
          field="email"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    id: "department",
    accessorKey: "department_id",
    header: "Department",
    enableHiding: true,
    cell: ({ row }) => {
      const [departments, setDepartments] = useState<any[]>([]);
      const [, forceUpdate] = useState({});

      useEffect(() => {
        getDepartments().then(setDepartments);
      }, []);

      const options = departments.map(d => ({ value: d.id, label: d.name }));

      return (
        <EditableSelectCell
          value={row.original.department_id}
          employeeId={row.original.id}
          field="department_id"
          options={options}
          onSave={() => forceUpdate({})}
          formatDisplay={() => toTitleCase(row.original.departments?.name) || "N/A"}
        />
      );
    },
  },
  {
    id: "salary",
    accessorKey: "salary",
    header: () => <div className="text-right">Salary</div>,
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <div className="text-right">
          <EditableCell
            value={row.original.salary}
            employeeId={row.original.id}
            field="salary"
            type="number"
            onSave={() => forceUpdate({})}
          />
        </div>
      );
    },
  },
  {
    id: "hire_date",
    accessorKey: "hire_date",
    header: "Hire Date",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      const hireDate = row.original.hire_date;
      const displayDate = hireDate ? new Date(hireDate).toLocaleDateString() : "";
      
      return (
        <EditableCell
          value={hireDate ? new Date(hireDate).toISOString().split('T')[0] : ""}
          employeeId={row.original.id}
          field="hire_date"
          type="date"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      const options = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ];

      return (
        <EditableSelectCell
          value={row.original.status}
          employeeId={row.original.id}
          field="status"
          options={options}
          onSave={() => forceUpdate({})}
          formatDisplay={(val) => toTitleCase(val)}
        />
      );
    },
  },
  {
    accessorKey: "lark_user",
    header: "Lark User",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <EditableCell
          value={row.original.lark_user}
          employeeId={row.original.id}
          field="lark_user"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    accessorKey: "preferred_nickname",
    header: "Nickname",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <EditableCell
          value={row.original.preferred_nickname}
          employeeId={row.original.id}
          field="preferred_nickname"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    accessorKey: "gender",
    header: "Gender",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      const options = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" }
      ];

      return (
        <EditableSelectCell
          value={row.original.gender}
          employeeId={row.original.id}
          field="gender"
          options={options}
          onSave={() => forceUpdate({})}
          formatDisplay={(val) => toTitleCase(val)}
        />
      );
    },
  },
  {
    accessorKey: "phone_number",
    header: "Phone",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <EditableCell
          value={row.original.phone_number}
          employeeId={row.original.id}
          field="phone_number"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    accessorKey: "contract_status",
    header: "Contract Status",
    enableHiding: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      const options = [
        { value: "permanent", label: "Permanent" },
        { value: "contract", label: "Contract" },
        { value: "probation", label: "Probation" }
      ];

      return (
        <EditableSelectCell
          value={row.original.contract_status}
          employeeId={row.original.id}
          field="contract_status"
          options={options}
          onSave={() => forceUpdate({})}
          formatDisplay={(val) => toTitleCase(val)}
        />
      );
    },
  },
  {
    accessorKey: "tenure_months",
    header: "Tenure (Months)",
    enableHiding: true,
    cell: ({ row }) => {
      const tenureMonths = row.original.tenure_months;
      if (!tenureMonths) return <div>N/A</div>;
      
      const years = Math.floor(tenureMonths / 12);
      const months = tenureMonths % 12;
      
      if (years > 0 && months > 0) {
        return <div>{years}y {months}m</div>;
      } else if (years > 0) {
        return <div>{years}y</div>;
      } else {
        return <div>{months}m</div>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const employee = row.original;

      // Trigger deactivation from parent component
      const handleDeactivate = () => {
        const event = new CustomEvent('deactivate-employee', { detail: employee });
        window.dispatchEvent(event);
      };
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">More options</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {employee.status === 'active' && (
              <>
                <DropdownMenuItem onClick={handleDeactivate} className="text-orange-600">
                  Deactivate Employee
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(employee.id)}
            >
              Copy employee ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];