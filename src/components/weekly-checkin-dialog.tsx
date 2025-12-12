"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { addWeeklyUpdate } from "@/app/projects/actions";
import { toast } from "sonner";
import { IconCalendarWeek } from "@tabler/icons-react";

interface WeeklyCheckinDialogProps {
  projectId: string;
  projectName: string;
  slaTargetValue?: number | null;
  slaTargetType?: string | null;
}

export function WeeklyCheckinDialog({
  projectId,
  projectName,
  slaTargetValue,
  slaTargetType,
}: WeeklyCheckinDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current week's Friday as default report date
  const getDefaultReportDate = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    return friday.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await addWeeklyUpdate(formData);
      toast.success("Weekly check-in submitted successfully!");
      setIsOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting weekly check-in:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit check-in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconCalendarWeek className="mr-2 h-4 w-4" />
          Weekly Check-in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <input type="hidden" name="project_id" value={projectId} />
          <DialogHeader>
            <DialogTitle>Weekly Check-in</DialogTitle>
            <DialogDescription>
              Log this week's progress for <strong>{projectName}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="report_date">Week Ending Date</Label>
              <Input
                id="report_date"
                name="report_date"
                type="date"
                defaultValue={getDefaultReportDate()}
                required
              />
              <p className="text-xs text-muted-foreground">
                Typically the Friday of the week you're reporting
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="actual_value">
                  Actual Value
                  {slaTargetType && <span className="text-xs text-muted-foreground ml-1">({slaTargetType})</span>}
                </Label>
                <Input
                  id="actual_value"
                  name="actual_value"
                  type="number"
                  step="0.01"
                  placeholder={slaTargetValue ? `Target: ${slaTargetValue}` : "Enter value"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sla_percentage">SLA %</Label>
                <Input
                  id="sla_percentage"
                  name="sla_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g., 95"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="health_status">Health Status</Label>
                <Select name="health_status" defaultValue="green" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="green">🟢 Green (Stable)</SelectItem>
                    <SelectItem value="amber">🟡 Amber (At Risk)</SelectItem>
                    <SelectItem value="red">🔴 Red (Critical)</SelectItem>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="What went well? What challenges did you face? Any context for the team..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Check-in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}