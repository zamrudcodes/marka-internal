"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Mail } from "lucide-react";
import { getProjectBriefs, deleteProjectBrief } from "@/app/commercial/actions";
import { BriefDetailModal } from "@/components/commercial/brief-detail-modal";
import { toast } from "sonner";

interface ProjectBrief {
    id: string;
    project_name: string;
    submitted_at: string;
    status: "not_started" | "passed" | "rejected";
    submitted_by: string | null;
    submitter_email: string | null;
    checked_by: string | null;
    submitted_by_email: string | null;
    checked_by_email: string | null;
}

export default function ProjectBriefsPage() {
    const router = useRouter();
    const [briefs, setBriefs] = React.useState<ProjectBrief[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedBriefId, setSelectedBriefId] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [briefToDelete, setBriefToDelete] = React.useState<string | null>(null);
    const [noEmailDialogOpen, setNoEmailDialogOpen] = React.useState(false);

    React.useEffect(() => {
        loadBriefs();
    }, []);

    async function loadBriefs() {
        setLoading(true);
        const result = await getProjectBriefs();
        if (result.error) {
            toast.error(result.error);
        } else if (result.data) {
            setBriefs(result.data as ProjectBrief[]);
        }
        setLoading(false);
    }

    function getStatusBadge(status: string) {
        switch (status) {
            case "passed":
                return <Badge className="bg-green-600">Passed</Badge>;
            case "rejected":
                return <Badge className="bg-red-600">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Not Started</Badge>;
        }
    }

    function handleNotify(brief: ProjectBrief) {
        const email = brief.submitter_email || brief.submitted_by_email;

        if (!email) {
            setNoEmailDialogOpen(true);
            return;
        }

        // TODO: Implement email notification
        toast.info("Email notification feature coming soon");
    }

    function confirmDelete(briefId: string) {
        setBriefToDelete(briefId);
        setDeleteDialogOpen(true);
    }

    async function handleDelete() {
        if (!briefToDelete) return;

        const result = await deleteProjectBrief(briefToDelete);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Brief deleted successfully");
            loadBriefs(); // Refresh the list
        }

        setDeleteDialogOpen(false);
        setBriefToDelete(null);
    }

    function getSubmitterDisplay(brief: ProjectBrief) {
        // For public submissions, show the submitter_email
        if (brief.submitter_email) {
            return brief.submitter_email;
        }
        // For authenticated users, show the email fetched from auth.users
        return brief.submitted_by_email || "Unknown";
    }

    function getCheckerDisplay(brief: ProjectBrief) {
        return brief.checked_by_email || "-";
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Project Briefs</h2>
                <Button onClick={() => router.push("/commercial/new-project-intake")}>
                    New Intake
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Brief ID</TableHead>
                            <TableHead>Project Name</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Submitted Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Checked By</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : briefs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center">
                                    No briefs found. Create your first brief!
                                </TableCell>
                            </TableRow>
                        ) : (
                            briefs.map((brief) => (
                                <TableRow key={brief.id}>
                                    <TableCell className="font-mono text-xs">
                                        {brief.id.split("-")[0]}
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => setSelectedBriefId(brief.id)}
                                            className="text-blue-600 hover:underline font-medium">
                                            {brief.project_name}
                                        </button>
                                    </TableCell>
                                    <TableCell>{getSubmitterDisplay(brief)}</TableCell>
                                    <TableCell>
                                        {format(new Date(brief.submitted_at), "MM-dd-yyyy")}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(brief.status)}</TableCell>
                                    <TableCell>{getCheckerDisplay(brief)}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleNotify(brief)}
                                                title="Send email"
                                            >
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => confirmDelete(brief.id)}
                                                title="Delete brief"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedBriefId && (
                <BriefDetailModal
                    briefId={selectedBriefId}
                    onClose={() => {
                        setSelectedBriefId(null);
                        loadBriefs(); // Refresh list when modal closes
                    }}
                />
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project Brief?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the project brief and all associated responses.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={noEmailDialogOpen} onOpenChange={setNoEmailDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>No Email Found</DialogTitle>
                        <DialogDescription>
                            This brief doesn't have an associated email address. Unable to send notification.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setNoEmailDialogOpen(false)}>
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
