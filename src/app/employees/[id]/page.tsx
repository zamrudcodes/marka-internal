"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  IconArrowLeft, 
  IconUser, 
  IconBriefcase, 
  IconUserCircle, 
  IconPhone, 
  IconMessages, 
  IconFileText, 
  IconPencil, 
  IconCamera,
  IconChartBar,
  IconChecklist,
  IconSchool,
  IconHistory
} from "@tabler/icons-react";
import { getEmployeeById, uploadEmployeeAvatar } from "../actions";
import { toTitleCase, formatName } from "@/lib/utils/text-format";
import { formatCurrency } from "@/lib/utils/currency";
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
import { Checkbox } from "@/components/ui/checkbox";
import { updateEmployee } from "../actions";
import { getDepartments } from "../../bonus-periods/actions";
import { toast } from "sonner";
import { ImageCropper } from "@/components/image-cropper";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  
  const [employee, setEmployee] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [employeeData, deptsData] = await Promise.all([
        getEmployeeById(employeeId),
        getDepartments()
      ]);
      setEmployee(employeeData);
      setDepartments(deptsData);
    } catch (error) {
      console.error("Error loading employee:", error);
      toast.error("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", employeeId);
    
    try {
      await updateEmployee(formData);
      toast.success("Employee updated successfully!");
      setIsEditDialogOpen(false);
      loadData();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error("Failed to update employee");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedFile(file);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploadingAvatar(true);

    try {
      const croppedFile = new File(
        [croppedImageBlob],
        selectedFile?.name || 'avatar.jpg',
        { type: 'image/jpeg' }
      );

      const result = await uploadEmployeeAvatar(employeeId, croppedFile);
      if (result.success) {
        toast.success("Avatar updated successfully!");
        loadData();
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      setSelectedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropperOpen(false);
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Skeleton className="h-12 w-full mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-full" />
                    {j < 2 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Employee not found</p>
          <Button onClick={() => router.push("/employees")}>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const initials = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => router.push("/employees")}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <IconPencil className="w-4 h-4 mr-2" />
          Edit Employee
        </Button>
      </div>

      {/* Employee Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 cursor-pointer transition-opacity hover:opacity-80" onClick={handleAvatarClick}>
                <AvatarImage src={employee.avatar_url} alt={formatName(employee.first_name, employee.last_name)} />
                <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <IconCamera className="w-8 h-8 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={isUploadingAvatar}
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                {formatName(employee.first_name, employee.last_name)}
              </CardTitle>
              <CardDescription className="text-lg flex items-center gap-3 flex-wrap">
                {employee.preferred_nickname && (
                  <span className="text-base">"{toTitleCase(employee.preferred_nickname)}"</span>
                )}
                <Badge variant="outline" className="text-sm">{toTitleCase(employee.status)}</Badge>
                {employee.departments?.name && (
                  <span className="text-muted-foreground">{toTitleCase(employee.departments.name)}</span>
                )}
                {employee.role && (
                  <span className="text-muted-foreground">• {toTitleCase(employee.role)}</span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <IconUser className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="contract" className="flex items-center gap-2">
            <IconBriefcase className="w-4 h-4" />
            Contract
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <IconChartBar className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <IconSchool className="w-4 h-4" />
            Development
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <IconFileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <IconHistory className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUser className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{employee.phone_number || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{toTitleCase(employee.gender) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Employment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBriefcase className="w-5 h-5" />
                  Employment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{employee.departments?.name ? toTitleCase(employee.departments.name) : "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-medium">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}</p>
                </div>
                <Separator />
                <div>
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
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUserCircle className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Birth Date</p>
                  <p className="font-medium">{employee.birth_date ? new Date(employee.birth_date).toLocaleDateString() : "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-medium">{employee.age || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Marital Status</p>
                  <p className="font-medium">{toTitleCase(employee.marital_status) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconPhone className="w-5 h-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{employee.emergency_contact_phone || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Name & Relationship</p>
                  <p className="font-medium">{toTitleCase(employee.emergency_contact_name_relationship) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contract & Compensation Tab */}
        <TabsContent value="contract" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileText className="w-5 h-5" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Status</p>
                  <p className="font-medium">{toTitleCase(employee.contract_status) || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-medium">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">PKWT</p>
                  <p className="font-medium">{employee.pkwt || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">PKWT Synced</p>
                  <p className="font-medium">{employee.pkwt_synced ? "Yes" : "No"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Compensation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBriefcase className="w-5 h-5" />
                  Compensation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="font-medium text-lg">{formatCurrency(employee.salary)}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">PTKP Status</p>
                  <p className="font-medium">{employee.ptkp_status || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Banking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileText className="w-5 h-5" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">BCA Account Number</p>
                  <p className="font-medium">{employee.bca_account_number || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">BPJS TK ID</p>
                  <p className="font-medium">{employee.bpjs_tk_id || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Lark Integration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconMessages className="w-5 h-5" />
                  Lark Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Lark User ID</p>
                  <p className="font-medium">{toTitleCase(employee.lark_user) || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Lark Work Email</p>
                  <p className="font-medium">{employee.lark_work_email || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Lark Status</p>
                  <p className="font-medium">{toTitleCase(employee.lark_status) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance & Tasks Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChecklist className="w-5 h-5" />
                Performance & Tasks
              </CardTitle>
              <CardDescription>
                Task management and performance tracking features coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <IconChartBar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Performance Tracking</p>
                <p className="text-sm">This section will display employee tasks, goals, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Development & Skills Tab */}
        <TabsContent value="development" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSchool className="w-5 h-5" />
                Development & Skills
              </CardTitle>
              <CardDescription>
                Skills matrix and training history coming soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <IconSchool className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Skills & Development</p>
                <p className="text-sm">This section will display employee skills, training history, and development plans</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileText className="w-5 h-5" />
                  Identity Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">KTP Photo</p>
                  <p className="font-medium">{employee.ktp_photo_url ? "Available" : "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">NPWP Photo</p>
                  <p className="font-medium">{employee.npwp_photo_url ? "Available" : "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Kartu Keluarga Number</p>
                  <p className="font-medium">{employee.kartu_keluarga_number || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconFileText className="w-5 h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Birthplace</p>
                  <p className="font-medium">{toTitleCase(employee.birthplace) || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Current Address</p>
                  <p className="font-medium">{toTitleCase(employee.current_address) || "N/A"}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Instagram Handle</p>
                  <p className="font-medium">{employee.instagram_handle || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconHistory className="w-5 h-5" />
                Employee History
              </CardTitle>
              <CardDescription>
                Timeline of important events and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <IconHistory className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">History Timeline</p>
                <p className="text-sm">This section will display a chronological log of employee events and changes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleUpdateEmployee}>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
              <DialogDescription>
                Update the details for {employee.first_name} {employee.last_name}
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
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" name="first_name" defaultValue={employee.first_name} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" name="last_name" defaultValue={employee.last_name} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_nickname">Preferred Nickname</Label>
                    <Input id="preferred_nickname" name="preferred_nickname" defaultValue={employee.preferred_nickname || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={employee.email} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" defaultValue={employee.role || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input id="phone_number" name="phone_number" defaultValue={employee.phone_number || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select name="gender" defaultValue={employee.gender || ''}>
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
                    <Label htmlFor="department_id">Department</Label>
                    <Select name="department_id" defaultValue={employee.department_id || ''}>
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
                    <Input id="salary" name="salary" type="number" step="1000" defaultValue={employee.salary || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hire_date">Hire Date</Label>
                    <Input id="hire_date" name="hire_date" type="date" defaultValue={employee.hire_date ? new Date(employee.hire_date).toISOString().split('T')[0] : ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract_status">Contract Status</Label>
                    <Select name="contract_status" defaultValue={employee.contract_status || ''}>
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
                    <Input id="pkwt" name="pkwt" defaultValue={employee.pkwt || ''} className="max-w-md" />
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
                    <Input id="birth_date" name="birth_date" type="date" defaultValue={employee.birth_date ? new Date(employee.birth_date).toISOString().split('T')[0] : ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" name="age" type="number" defaultValue={employee.age || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthplace">Birthplace</Label>
                    <Input id="birthplace" name="birthplace" defaultValue={employee.birthplace || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">Marital Status</Label>
                    <Select name="marital_status" defaultValue={employee.marital_status || ''}>
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
                    <Select name="ptkp_status" defaultValue={employee.ptkp_status || ''}>
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
                    <Input id="current_address" name="current_address" defaultValue={employee.current_address || ''} className="max-w-full" />
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
                    <Input id="emergency_contact_phone" name="emergency_contact_phone" defaultValue={employee.emergency_contact_phone || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name_relationship">Contact Name & Relationship</Label>
                    <Input id="emergency_contact_name_relationship" name="emergency_contact_name_relationship" defaultValue={employee.emergency_contact_name_relationship || ''} placeholder="e.g., John Doe (Spouse)" className="max-w-md" />
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
                    <Input id="lark_user" name="lark_user" defaultValue={employee.lark_user || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lark_work_email">Lark Work Email</Label>
                    <Input id="lark_work_email" name="lark_work_email" type="email" defaultValue={employee.lark_work_email || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lark_status">Lark Status</Label>
                    <Input id="lark_status" name="lark_status" defaultValue={employee.lark_status || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram_handle">Instagram Handle</Label>
                    <Input id="instagram_handle" name="instagram_handle" defaultValue={employee.instagram_handle || ''} placeholder="@username" className="max-w-md" />
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
                    <Input id="ktp_photo_url" name="ktp_photo_url" defaultValue={employee.ktp_photo_url || ''} placeholder="https://..." className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="npwp_photo_url">NPWP Photo URL</Label>
                    <Input id="npwp_photo_url" name="npwp_photo_url" defaultValue={employee.npwp_photo_url || ''} placeholder="https://..." className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar_url">Avatar URL</Label>
                    <Input id="avatar_url" name="avatar_url" defaultValue={employee.avatar_url || ''} placeholder="https://..." className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kartu_keluarga_number">Kartu Keluarga Number</Label>
                    <Input id="kartu_keluarga_number" name="kartu_keluarga_number" defaultValue={employee.kartu_keluarga_number || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bca_account_number">BCA Account Number</Label>
                    <Input id="bca_account_number" name="bca_account_number" defaultValue={employee.bca_account_number || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpjs_tk_id">BPJS TK ID</Label>
                    <Input id="bpjs_tk_id" name="bpjs_tk_id" defaultValue={employee.bpjs_tk_id || ''} className="max-w-md" />
                  </div>
                  <div className="space-y-2 flex items-center gap-2">
                    <Checkbox id="pkwt_synced" name="pkwt_synced" defaultChecked={employee.pkwt_synced} />
                    <Label htmlFor="pkwt_synced" className="cursor-pointer">PKWT Synced</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isOpen={isCropperOpen}
        />
      )}
      </div>
    </div>
  );
}