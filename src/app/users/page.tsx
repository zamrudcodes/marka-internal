"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { IconUserPlus, IconCopy, IconShieldLock } from "@tabler/icons-react";
import { getUsers, inviteUser, toggleUserStatus, updateUserRole, getAllFeatures, getUserFeatures, updateUserFeatures } from "../auth/actions";
import { getRoleBadgeColor, getRoleDisplayName, type UserRole, type FeatureKey, ROLE_DEFAULT_FEATURES } from "@/lib/auth/permissions";

interface User {
  id: string;
  user_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface Feature {
  key: string;
  name: string;
  description: string | null;
  parent_key: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  
  // Feature management state
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [userFeatures, setUserFeatures] = useState<FeatureKey[]>([]);
  const [isSavingFeatures, setIsSavingFeatures] = useState(false);

  useEffect(() => {
    loadUsers();
    loadFeatures();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data as User[]);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function loadFeatures() {
    try {
      const features = await getAllFeatures();
      setAllFeatures(features as Feature[]);
    } catch (error) {
      console.error("Error loading features:", error);
    }
  }

  async function handleInviteUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsInviting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await inviteUser(formData);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success && result.invitationLink) {
        setInvitationLink(result.invitationLink);
        toast.success("Invitation created successfully!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      toast.error("Failed to invite user");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleToggleStatus(userId: string) {
    try {
      const result = await toggleUserStatus(userId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User status updated");
        loadUsers();
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error("Failed to update user status");
    }
  }

  async function handleUpdateRole(userId: string, newRole: UserRole) {
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User role updated");
        loadUsers();
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  }

  async function handleManageAccess(user: User) {
    setSelectedUser(user);
    setIsFeatureDialogOpen(true);
    
    try {
      const features = await getUserFeatures(user.user_id);
      setUserFeatures(features);
    } catch (error) {
      console.error("Error loading user features:", error);
      toast.error("Failed to load user features");
    }
  }

  async function handleSaveFeatures() {
    if (!selectedUser) return;
    
    setIsSavingFeatures(true);
    try {
      const result = await updateUserFeatures(selectedUser.user_id, userFeatures);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("User access updated successfully");
        setIsFeatureDialogOpen(false);
        loadUsers();
      }
    } catch (error) {
      console.error("Error updating user features:", error);
      toast.error("Failed to update user access");
    } finally {
      setIsSavingFeatures(false);
    }
  }

  function handleFeatureToggle(featureKey: FeatureKey) {
    setUserFeatures(prev => {
      if (prev.includes(featureKey)) {
        return prev.filter(f => f !== featureKey);
      } else {
        return [...prev, featureKey];
      }
    });
  }

  function handleApplyRolePreset(role: UserRole) {
    setUserFeatures(ROLE_DEFAULT_FEATURES[role]);
    toast.success(`Applied ${getRoleDisplayName(role)} preset`);
  }

  // Group features by parent
  const parentFeatures = allFeatures.filter(f => !f.parent_key);
  const childFeaturesByParent = allFeatures.reduce((acc, f) => {
    if (f.parent_key) {
      if (!acc[f.parent_key]) acc[f.parent_key] = [];
      acc[f.parent_key].push(f);
    }
    return acc;
  }, {} as Record<string, Feature[]>);

  function copyInvitationLink() {
    if (invitationLink) {
      navigator.clipboard.writeText(invitationLink);
      toast.success("Invitation link copied to clipboard!");
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col h-full space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconUserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInviteUser}>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new user to join the system
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                    disabled={isInviting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required disabled={isInviting}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {invitationLink && (
                  <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Label className="text-green-900 dark:text-green-100">
                      Invitation Link
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={invitationLink}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyInvitationLink}
                      >
                        <IconCopy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Share this link with the user. It expires in 7 days.
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsInviteDialogOpen(false);
                    setInvitationLink(null);
                  }}
                  disabled={isInviting}
                >
                  Close
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? "Creating..." : "Create Invitation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {users.length} user{users.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleUpdateRole(user.user_id, value as UserRole)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageAccess(user)}
                        >
                          <IconShieldLock className="mr-1 h-4 w-4" />
                          Manage Access
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.user_id)}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Feature Access Management Dialog */}
      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Feature Access</DialogTitle>
            <DialogDescription>
              Control which features {selectedUser?.email} can access
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Role Preset Selector */}
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <Label>Quick Apply Role Preset</Label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRolePreset('admin')}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRolePreset('manager')}
                >
                  Manager
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRolePreset('operations')}
                >
                  Operations
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRolePreset('sales')}
                >
                  Sales
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleApplyRolePreset('viewer')}
                >
                  Viewer
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click a preset to quickly apply that role's default features
              </p>
            </div>

            {/* Feature Checkboxes */}
            <div className="space-y-3">
              <Label>Features</Label>
              {parentFeatures.map(feature => (
                <div key={feature.key} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={feature.key}
                      checked={userFeatures.includes(feature.key as FeatureKey)}
                      onCheckedChange={() => handleFeatureToggle(feature.key as FeatureKey)}
                    />
                    <label
                      htmlFor={feature.key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {feature.name}
                    </label>
                  </div>
                  
                  {/* Child features */}
                  {childFeaturesByParent[feature.key] && (
                    <div className="ml-6 space-y-2">
                      {childFeaturesByParent[feature.key].map(childFeature => (
                        <div key={childFeature.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={childFeature.key}
                            checked={userFeatures.includes(childFeature.key as FeatureKey)}
                            onCheckedChange={() => handleFeatureToggle(childFeature.key as FeatureKey)}
                            disabled={!userFeatures.includes(feature.key as FeatureKey)}
                          />
                          <label
                            htmlFor={childFeature.key}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {childFeature.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFeatureDialogOpen(false)}
              disabled={isSavingFeatures}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveFeatures}
              disabled={isSavingFeatures}
            >
              {isSavingFeatures ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}