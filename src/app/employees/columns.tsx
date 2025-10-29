"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toTitleCase, formatName } from "@/lib/utils/text-format";
import { useRouter } from "next/navigation";
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
import { IconDotsVertical, IconBriefcase, IconUserCircle, IconPhone, IconMessages, IconFileText, IconCheck, IconX } from "@tabler/icons-react";
import { BadgeCheck, UserRoundPen, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useState, useEffect } from "react";
import { updateEmployee } from "./actions";
import { getDepartments } from "../bonus-periods/actions";
import { toast } from "sonner";
import { Column } from "@tanstack/react-table";

// Simple sortable header component
function SortableHeader<TData, TValue>({
  column,
  title,
  isSorted,
  className = "",
}: {
  column: Column<TData, TValue>;
  title: string;
  isSorted: false | "asc" | "desc";
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 cursor-pointer select-none hover:text-foreground transition-colors ${className}`}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      <span>{title}</span>
      {isSorted && (
        <span className="ml-1">
          {isSorted === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      )}
    </div>
  );
}

export type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
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
      // Trigger parent reload to ensure data consistency
      onSave();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
      // Revert to original value on error
      setEditValue(value || "");
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
      className="cursor-pointer hover:bg-muted/50 py-1 rounded min-h-[32px] flex items-center"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {value || <span className="text-muted-foreground">Click to edit</span>}
    </div>
  );
}

// Editable currency cell component
function EditableCurrencyCell({
  value,
  employeeId,
  field,
  onSave,
}: {
  value: number;
  employeeId: string;
  field: string;
  onSave: (value: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append("id", employeeId);
    formData.append(field, editValue.toString());

    try {
      await updateEmployee(formData);
      toast.success("Updated successfully");
      setIsEditing(false);
      // Update local state after successful Supabase sync
      onSave(editValue);
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
      // Revert to original value on error
      setEditValue(value || 0);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || 0);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(Number(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="h-8 text-sm text-right"
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
      className="cursor-pointer hover:bg-muted/50 py-1 rounded min-h-[32px] flex items-center justify-end"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {formatCurrency(value) || <span className="text-muted-foreground">Click to edit</span>}
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
      // Trigger parent reload to ensure data consistency
      onSave();
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
      // Revert to original value on error
      setEditValue(value || "");
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
      className="cursor-pointer hover:bg-muted/50 py-1 rounded min-h-[32px] flex items-center"
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue || <span className="text-muted-foreground">Click to edit</span>}
    </div>
  );
}

export const columns: ColumnDef<Employee>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => (
      <SortableHeader column={column} title="ID" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="font-mono text-xs text-muted-foreground">
          {id.substring(0, 8)}...
        </div>
      );
    },
  },
  {
    id: "name",
    accessorKey: "first_name",
    header: ({ column }) => (
      <SortableHeader column={column} title="Name" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
    cell: ({ row }) => {
      const router = useRouter();
      const employee = row.original;
      
      // Get initials for avatar fallback
      const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

      return (
        <button
          onClick={() => router.push(`/employees/${employee.id}`)}
          className="flex items-center gap-3 text-left hover:underline cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar_url} alt={formatName(employee.first_name, employee.last_name)} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span>{formatName(row.original.first_name, row.original.last_name)}</span>
        </button>
      );
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <SortableHeader column={column} title="Email" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <SortableHeader column={column} title="Role" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
    cell: ({ row }) => {
      const [, forceUpdate] = useState({});
      return (
        <EditableCell
          value={row.original.role}
          employeeId={row.original.id}
          field="role"
          onSave={() => forceUpdate({})}
        />
      );
    },
  },
  {
    id: "department",
    accessorKey: "department_id",
    header: ({ column }) => (
      <SortableHeader column={column} title="Department" isSorted={column.getIsSorted()} />
    ),
    enableHiding: false,
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const deptA = rowA.original.departments?.name || "";
      const deptB = rowB.original.departments?.name || "";
      return deptA.localeCompare(deptB);
    },
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
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <SortableHeader column={column} title="Status" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
    cell: ({ row }) => {
      const status = row.original.status;
      const isActive = status === 'active';

      return (
        <Badge
          variant={isActive ? 'active' : 'secondary'}
          style={isActive ? { backgroundColor: '#3d78e6', color: 'white' } : undefined}
        >
          {isActive && <BadgeCheck className="h-3 w-3" />}
          <span>{toTitleCase(status)}</span>
        </Badge>
      );
    },
  },
  {
    id: "phone_number_visible",
    accessorKey: "phone_number",
    header: ({ column }) => (
      <SortableHeader column={column} title="Phone" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    id: "actions",
    header: "Actions",
    enableHiding: true,
    cell: ({ row }) => {
      const router = useRouter();
      const employee = row.original;
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

      // Trigger deactivation from parent component
      const handleDeactivate = () => {
        const event = new CustomEvent('deactivate-employee', { detail: employee });
        window.dispatchEvent(event);
      };

      const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${formatName(employee.first_name, employee.last_name)}? This action cannot be undone.`)) {
          const formData = new FormData();
          formData.append("id", employee.id);
          try {
            const { deleteEmployee } = await import("./actions");
            await deleteEmployee(formData);
            toast.success("Employee deleted successfully");
            window.location.reload();
          } catch (error) {
            console.error("Error deleting employee:", error);
            toast.error("Failed to delete employee");
          }
        }
      };
      
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/employees/${employee.id}`)}
            title="Edit employee"
          >
            <UserRoundPen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleDelete}
            title="Delete employee"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
  {
    id: "salary",
    accessorKey: "salary",
    header: ({ column }) => (
      <div className="flex justify-end">
        <SortableHeader column={column} title="Salary" isSorted={column.getIsSorted()} />
      </div>
    ),
    enableHiding: true,
    enableSorting: true,
    cell: ({ row, table }) => {
      const { updateData } = table.options.meta as any;
      return (
        <div className="text-right">
          <EditableCurrencyCell
            value={row.original.salary}
            employeeId={row.original.id}
            field="salary"
            onSave={(newValue) => {
              if (updateData) {
                updateData(row.index, 'salary', newValue);
              }
            }}
          />
        </div>
      );
    },
  },
  {
    id: "hire_date",
    accessorKey: "hire_date",
    header: ({ column }) => (
      <SortableHeader column={column} title="Hire Date" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    accessorKey: "lark_user",
    header: ({ column }) => (
      <SortableHeader column={column} title="Lark User" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Nickname" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Gender" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Phone" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Contract Status" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
    header: ({ column }) => (
      <SortableHeader column={column} title="Tenure (Months)" isSorted={column.getIsSorted()} />
    ),
    enableHiding: true,
    enableSorting: true,
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
];