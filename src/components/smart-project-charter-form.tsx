"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Business Logic Constants
const SLA_FAST_VIDEO = 1; // days
const SLA_COMPLEX_VIDEO = 3; // days
const MIN_LEAD_TIME = 7; // days
const BUFFER_RATIO = 1.2; // 20% buffer

interface FeasibilityResult {
  status: 'green' | 'yellow' | 'red';
  productionDaysNeeded: number;
  daysAvailable: number;
  daysWithBuffer: number;
  leadTimeDays: number;
  message: string;
  buttonText: string;
  buttonDisabled: boolean;
  projectStatus: 'approved' | 'pending_ops_review';
}

interface FormData {
  projectName: string;
  clientName: string;
  tierFastCount: number;
  tierComplexCount: number;
  requestedStartDate: string;
  finalDeliveryDue: string;
  tentativeStudioShootWeek: string;
  budgetTotal: string;
}

export function SmartProjectCharterForm() {
  const [formData, setFormData] = useState<FormData>({
    projectName: "",
    clientName: "",
    tierFastCount: 0,
    tierComplexCount: 0,
    requestedStartDate: "",
    finalDeliveryDue: "",
    tentativeStudioShootWeek: "",
    budgetTotal: "",
  });

  const [feasibility, setFeasibility] = useState<FeasibilityResult>({
    status: 'green',
    productionDaysNeeded: 0,
    daysAvailable: 0,
    daysWithBuffer: 0,
    leadTimeDays: 0,
    message: "",
    buttonText: "Create Project",
    buttonDisabled: false,
    projectStatus: 'approved',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate feasibility whenever form data changes
  useEffect(() => {
    checkFeasibility();
  }, [
    formData.tierFastCount,
    formData.tierComplexCount,
    formData.requestedStartDate,
    formData.finalDeliveryDue,
  ]);

  function checkFeasibility() {
    // Calculate production days needed
    const productionDaysNeeded =
      formData.tierFastCount * SLA_FAST_VIDEO +
      formData.tierComplexCount * SLA_COMPLEX_VIDEO;

    // Calculate days available
    let daysAvailable = 0;
    let leadTimeDays = 0;
    
    if (formData.requestedStartDate && formData.finalDeliveryDue) {
      const startDate = new Date(formData.requestedStartDate);
      const endDate = new Date(formData.finalDeliveryDue);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      daysAvailable = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      leadTimeDays = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    const daysWithBuffer = productionDaysNeeded * BUFFER_RATIO;

    // Determine status
    let status: 'green' | 'yellow' | 'red' = 'green';
    let message = "Timeline is healthy. Ready to proceed!";
    let buttonText = "Create Project";
    let buttonDisabled = false;
    let projectStatus: 'approved' | 'pending_ops_review' = 'approved';

    // 🔴 RED: Impossible timeline
    if (productionDaysNeeded > daysAvailable) {
      status = 'red';
      const daysShort = productionDaysNeeded - daysAvailable;
      message = `⛔ Timeline impossible. You need at least ${productionDaysNeeded} days but only have ${daysAvailable} days. Short by ${daysShort} days.`;
      buttonText = "Submit";
      buttonDisabled = true;
      projectStatus = 'pending_ops_review';
    }
    // 🟡 YELLOW: Needs approval
    else if (daysAvailable < daysWithBuffer || leadTimeDays < MIN_LEAD_TIME) {
      status = 'yellow';
      const reasons = [];
      
      if (daysAvailable < daysWithBuffer) {
        const bufferDaysNeeded = Math.ceil(daysWithBuffer - daysAvailable);
        reasons.push(`timeline is tight (needs ${Math.ceil(daysWithBuffer)} days with buffer, has ${daysAvailable} days)`);
      }
      
      if (leadTimeDays < MIN_LEAD_TIME) {
        reasons.push(`start date is within ${MIN_LEAD_TIME}-day minimum lead time (${leadTimeDays} days from today)`);
      }
      
      message = `⚠️ Requires Operations approval: ${reasons.join(' and ')}.`;
      buttonText = "Request Ops Approval";
      buttonDisabled = false;
      projectStatus = 'pending_ops_review';
    }
    // 🟢 GREEN: All good
    else {
      status = 'green';
      message = `✅ Timeline is healthy with ${daysAvailable - productionDaysNeeded} days of buffer.`;
      buttonText = "Create Project";
      buttonDisabled = false;
      projectStatus = 'approved';
    }

    setFeasibility({
      status,
      productionDaysNeeded,
      daysAvailable,
      daysWithBuffer,
      leadTimeDays,
      message,
      buttonText,
      buttonDisabled,
      projectStatus,
    });
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.projectName || !formData.clientName) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.requestedStartDate || !formData.finalDeliveryDue) {
      toast.error("Please select start and delivery dates");
      return;
    }

    if (formData.tierComplexCount > 0 && !formData.tentativeStudioShootWeek) {
      toast.error("Studio shoot week is required for complex videos");
      return;
    }

    if (!formData.budgetTotal || parseFloat(formData.budgetTotal) <= 0) {
      toast.error("Please enter a valid budget");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/project-charters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...feasibility,
        }),
      });

      if (!response.ok) throw new Error('Failed to create project charter');

      toast.success(
        feasibility.projectStatus === 'approved'
          ? "Project charter created successfully!"
          : "Project charter submitted for Operations review"
      );

      // Reset form
      setFormData({
        projectName: "",
        clientName: "",
        tierFastCount: 0,
        tierComplexCount: 0,
        requestedStartDate: "",
        finalDeliveryDue: "",
        tentativeStudioShootWeek: "",
        budgetTotal: "",
      });
    } catch (error) {
      console.error("Error creating project charter:", error);
      toast.error("Failed to create project charter");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = () => {
    switch (feasibility.status) {
      case 'green':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">🟢 Green Light</Badge>;
      case 'yellow':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">🟡 Needs Approval</Badge>;
      case 'red':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">🔴 Blocked</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Smart Project Charter</CardTitle>
            <CardDescription>
              TikTok Video Package Scoping with Real-Time Feasibility Check
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Project Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  placeholder="e.g., Q1 TikTok Campaign"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="e.g., Acme Corp"
                  required
                />
              </div>
            </div>
          </div>

          {/* Video Package */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Video Package</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tierFastCount">
                  Fast Videos (1 day each)
                  <span className="text-xs text-muted-foreground ml-2">Simple talking head</span>
                </Label>
                <Input
                  id="tierFastCount"
                  type="number"
                  min="0"
                  value={formData.tierFastCount}
                  onChange={(e) => handleInputChange('tierFastCount', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tierComplexCount">
                  Complex Videos (3 days each)
                  <span className="text-xs text-muted-foreground ml-2">High-production studio</span>
                </Label>
                <Input
                  id="tierComplexCount"
                  type="number"
                  min="0"
                  value={formData.tierComplexCount}
                  onChange={(e) => handleInputChange('tierComplexCount', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Conditional Studio Shoot Week Field */}
            {formData.tierComplexCount > 0 && (
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Label htmlFor="tentativeStudioShootWeek" className="text-blue-900 dark:text-blue-100">
                  Tentative Studio Shoot Week *
                  <span className="text-xs ml-2">(Required for complex videos)</span>
                </Label>
                <Input
                  id="tentativeStudioShootWeek"
                  type="date"
                  value={formData.tentativeStudioShootWeek}
                  onChange={(e) => handleInputChange('tentativeStudioShootWeek', e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedStartDate">Requested Start Date *</Label>
                <Input
                  id="requestedStartDate"
                  type="date"
                  value={formData.requestedStartDate}
                  onChange={(e) => handleInputChange('requestedStartDate', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="finalDeliveryDue">Final Delivery Due *</Label>
                <Input
                  id="finalDeliveryDue"
                  type="date"
                  value={formData.finalDeliveryDue}
                  onChange={(e) => handleInputChange('finalDeliveryDue', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Budget</h3>
            <div className="space-y-2">
              <Label htmlFor="budgetTotal">Total Budget (IDR) *</Label>
              <Input
                id="budgetTotal"
                type="number"
                min="0"
                step="0.01"
                value={formData.budgetTotal}
                onChange={(e) => handleInputChange('budgetTotal', e.target.value)}
                placeholder="e.g., 50000000"
                required
              />
            </div>
          </div>

          {/* Feasibility Summary */}
          {(formData.requestedStartDate && formData.finalDeliveryDue) && (
            <div className={`p-4 rounded-lg border-2 ${
              feasibility.status === 'green' ? 'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700' :
              feasibility.status === 'yellow' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
              'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700'
            }`}>
              <h4 className="font-semibold mb-2">Feasibility Check</h4>
              <p className="text-sm mb-3">{feasibility.message}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Production Days:</span>
                  <div className="font-semibold">{feasibility.productionDaysNeeded} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Days Available:</span>
                  <div className="font-semibold">{feasibility.daysAvailable} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">With Buffer (20%):</span>
                  <div className="font-semibold">{Math.ceil(feasibility.daysWithBuffer)} days</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Lead Time:</span>
                  <div className="font-semibold">{feasibility.leadTimeDays} days</div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  projectName: "",
                  clientName: "",
                  tierFastCount: 0,
                  tierComplexCount: 0,
                  requestedStartDate: "",
                  finalDeliveryDue: "",
                  tentativeStudioShootWeek: "",
                  budgetTotal: "",
                });
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={feasibility.buttonDisabled || isSubmitting}
              className={
                feasibility.status === 'yellow'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : feasibility.status === 'red'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {isSubmitting ? "Submitting..." : feasibility.buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}