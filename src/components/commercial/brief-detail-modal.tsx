"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getBriefDetails, updateBriefReview, type BriefReviewData } from "@/app/commercial/actions";
import { toast } from "sonner";

interface BriefResponse {
    id: string;
    field_name: string;
    field_label: string;
    field_value: string;
    section: string;
    review_status: "not_started" | "passed" | "rejected";
    commentary: string | null;
}

interface BriefDetailModalProps {
    briefId: string;
    onClose: () => void;
}

const REJECTION_CRITERIA: Record<string, string> = {
    avatar: "Must be specific (not 'everyone'), include demographic details",
    trigger: "Must describe a specific pain point or frustrating moment",
    visual_proof: "Must be a clear before/after or demonstration description",
    one_feature: "Must be singular, not a list of features",
    ah_ha_moment: "Should challenge common assumptions (optional)",
    offer: "Must include specific discount/value proposition",
    scarcity: "Should create urgency (optional)",
    cta: "Must be clear, actionable instruction",
    product_link: "Must be valid URL to product page",
    asset_library: "Must be valid URL to Google Drive/Dropbox",
    dos_and_donts: "Clear compliance guidelines (optional)",
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
    avatar: "Targeting. You cannot write a specific hook for a general audience.",
    trigger: "Agitation. This fuels the 'Hook' script. We need a pain point to agitate.",
    visual_proof: "Demonstration. TikTok is visual. We need to know what to show, not just say.",
    one_feature: "Focus. A 30s video cannot sell 5 features.",
    ah_ha_moment: "Pattern Interrupt. Allows the Strategist to write a 'contrarian' hook.",
    offer: "Incentive. 'Inspiration to buy' usually requires a friction reducer.",
    scarcity: "Urgency. Drives the click-through rate (CTR).",
    cta: "Clarity. The Editor needs to know exactly what text to put on the final screen.",
    product_link: "Context. Allows Strategist to verify claims and Editor to see the landing page vibe.",
    asset_library: "Inventory. Link to raw footage/photos.",
    dos_and_donts: "Compliance. Prevents expensive rework due to legal/brand violations.",
};

export function BriefDetailModal({ briefId, onClose }: BriefDetailModalProps) {
    const [loading, setLoading] = React.useState(true);
    const [responses, setResponses] = React.useState<BriefResponse[]>([]);
    const [briefInfo, setBriefInfo] = React.useState<any>(null);
    const [localStatuses, setLocalStatuses] = React.useState<Record<string, "passed" | "rejected">>({});
    const [commentaries, setCommentaries] = React.useState<Record<string, string>>({});
    const [showCommentary, setShowCommentary] = React.useState<Record<string, boolean>>({});
    const [submitting, setSubmitting] = React.useState(false);

    React.useEffect(() => {
        loadBriefDetails();
    }, [briefId]);

    async function loadBriefDetails() {
        setLoading(true);
        const result = await getBriefDetails(briefId);

        if (result.error) {
            toast.error(result.error);
            onClose();
        } else {
            setBriefInfo(result.brief);
            setResponses(result.responses || []);

            // Initialize local state from existing data
            const statuses: Record<string, "passed" | "rejected"> = {};
            const comments: Record<string, string> = {};

            result.responses?.forEach((r: BriefResponse) => {
                if (r.review_status !== "not_started") {
                    statuses[r.id] = r.review_status as "passed" | "rejected";
                }
                if (r.commentary) {
                    comments[r.id] = r.commentary;
                }
            });

            setLocalStatuses(statuses);
            setCommentaries(comments);
        }

        setLoading(false);
    }

    function handleStatusChange(responseId: string, status: "passed" | "rejected") {
        setLocalStatuses(prev => ({ ...prev, [responseId]: status }));

        // Auto-show commentary field if rejected
        if (status === "rejected") {
            setShowCommentary(prev => ({ ...prev, [responseId]: true }));
        }
    }

    function toggleCommentary(responseId: string) {
        setShowCommentary(prev => ({ ...prev, [responseId]: !prev[responseId] }));
    }

    async function handleSubmit() {
        // Validate all fields have a status
        const allReviewed = responses.every(r => localStatuses[r.id]);
        if (!allReviewed) {
            toast.error("Please review all fields before submitting");
            return;
        }

        // Validate rejected items have commentary
        const rejectedWithoutComment = responses.some(
            r => localStatuses[r.id] === "rejected" && !commentaries[r.id]?.trim()
        );

        if (rejectedWithoutComment) {
            toast.error("Please provide commentary for all rejected items");
            return;
        }

        setSubmitting(true);

        const reviewData: BriefReviewData = {
            briefId,
            responses: responses.map(r => ({
                id: r.id,
                review_status: localStatuses[r.id],
                commentary: commentaries[r.id] || undefined,
            })),
        };

        const result = await updateBriefReview(reviewData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Brief ${result.status}!`);
            onClose();
        }

        setSubmitting(false);
    }

    if (loading) {
        return (
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="!max-w-[95vw] max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-center p-8">Loading...</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={true} onOpenChange={submitting ? undefined : onClose}>
            <DialogContent className="!max-w-[95vw] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Review Brief: {briefInfo?.project_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Submitted by: {briefInfo?.submitter_email || briefInfo?.submitted_by || "Unknown"}
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Field</TableHead>
                                <TableHead className="w-[300px]">User Response</TableHead>
                                <TableHead className="w-[250px]">Rejection Criteria</TableHead>
                                <TableHead className="w-[200px]">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {responses.map((response) => (
                                <React.Fragment key={response.id}>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{response.field_label}</span>
                                                {FIELD_DESCRIPTIONS[response.field_name] && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent side="right" className="max-w-xs">
                                                            <p>{FIELD_DESCRIPTIONS[response.field_name]}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-h-24 overflow-y-auto text-sm">
                                                {response.field_value}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {REJECTION_CRITERIA[response.field_name] || "Review for quality"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant={localStatuses[response.id] === "passed" ? "default" : "outline"}
                                                    className={localStatuses[response.id] === "passed" ? "bg-green-600 hover:bg-green-700" : ""}
                                                    onClick={() => handleStatusChange(response.id, "passed")}
                                                >
                                                    Pass
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant={localStatuses[response.id] === "rejected" ? "default" : "outline"}
                                                    className={localStatuses[response.id] === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
                                                    onClick={() => handleStatusChange(response.id, "rejected")}
                                                >
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => toggleCommentary(response.id)}
                                                    title={showCommentary[response.id] ? "Hide Commentary" : "Add Commentary"}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {showCommentary[response.id] && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="bg-muted/50">
                                                <Textarea
                                                    placeholder="Add commentary (required for rejected items)..."
                                                    value={commentaries[response.id] || ""}
                                                    onChange={(e) =>
                                                        setCommentaries(prev => ({ ...prev, [response.id]: e.target.value }))
                                                    }
                                                    rows={3}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Review"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
