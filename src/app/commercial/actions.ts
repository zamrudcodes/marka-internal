"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface ProjectBriefFormData {
    project_name: string;
    submitter_email?: string;
    avatar: string;
    trigger: string;
    visual_proof: string;
    one_feature: string;
    ah_ha_moment?: string;
    offer: string;
    scarcity?: string;
    cta: string;
    product_link: string;
    asset_library: string;
    dos_and_donts?: string;
}

export async function createProjectBrief(formData: ProjectBriefFormData) {
    const supabase = await createClient();

    // Get current user (may be null for public submissions)
    const { data: { user } } = await supabase.auth.getUser();

    // Create project brief
    const { data: brief, error: briefError } = await supabase
        .from("project_briefs")
        .insert([{
            project_name: formData.project_name,
            submitted_by: user?.id || null,
            submitter_email: formData.submitter_email || null,
            status: "not_started",
        }])
        .select()
        .single();

    if (briefError || !brief) {
        console.error("Error creating brief:", briefError);
        return { error: "Failed to create project brief" };
    }

    // Create brief responses for each field
    const responses = [
        // Strategy section
        {
            brief_id: brief.id,
            field_name: "avatar",
            field_label: "The Avatar",
            field_value: formData.avatar,
            section: "strategy",
        },
        {
            brief_id: brief.id,
            field_name: "trigger",
            field_label: "The Trigger",
            field_value: formData.trigger,
            section: "strategy",
        },
        {
            brief_id: brief.id,
            field_name: "visual_proof",
            field_label: "The Visual Proof",
            field_value: formData.visual_proof,
            section: "strategy",
        },
        {
            brief_id: brief.id,
            field_name: "one_feature",
            field_label: "The One Feature",
            field_value: formData.one_feature,
            section: "strategy",
        },
        ...(formData.ah_ha_moment ? [{
            brief_id: brief.id,
            field_name: "ah_ha_moment",
            field_label: "The 'Ah-Ha' Moment",
            field_value: formData.ah_ha_moment,
            section: "strategy",
        }] : []),
        // Offer section
        {
            brief_id: brief.id,
            field_name: "offer",
            field_label: "The Offer",
            field_value: formData.offer,
            section: "offer",
        },
        ...(formData.scarcity ? [{
            brief_id: brief.id,
            field_name: "scarcity",
            field_label: "The Scarcity",
            field_value: formData.scarcity,
            section: "offer",
        }] : []),
        {
            brief_id: brief.id,
            field_name: "cta",
            field_label: "The CTA",
            field_value: formData.cta,
            section: "offer",
        },
        // Assets section
        {
            brief_id: brief.id,
            field_name: "product_link",
            field_label: "Product Link",
            field_value: formData.product_link,
            section: "assets",
        },
        {
            brief_id: brief.id,
            field_name: "asset_library",
            field_label: "Asset Library",
            field_value: formData.asset_library,
            section: "assets",
        },
        ...(formData.dos_and_donts ? [{
            brief_id: brief.id,
            field_name: "dos_and_donts",
            field_label: "Do's & Don'ts",
            field_value: formData.dos_and_donts,
            section: "assets",
        }] : []),
    ];

    const { error: responsesError } = await supabase
        .from("brief_responses")
        .insert(responses);

    if (responsesError) {
        console.error("Error creating responses:", responsesError);
        // Rollback by deleting the brief
        await supabase.from("project_briefs").delete().eq("id", brief.id);
        return { error: "Failed to save brief responses" };
    }

    revalidatePath("/commercial/project-briefs");
    return { success: true, briefId: brief.id };
}

export async function getProjectBriefs() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("project_briefs")
        .select("*")
        .order("submitted_at", { ascending: false });

    if (error) {
        console.error("Error fetching briefs:", error);
        return { error: "Failed to fetch project briefs" };
    }

    // Enrich briefs with user emails
    if (data && data.length > 0) {
        // Get unique user IDs
        const userIds = new Set<string>();
        data.forEach(brief => {
            if (brief.submitted_by) userIds.add(brief.submitted_by);
            if (brief.checked_by) userIds.add(brief.checked_by);
        });

        // Fetch user emails from auth.users using Supabase admin API
        const userEmails: Record<string, string> = {};
        for (const userId of userIds) {
            const { data: { user } } = await supabase.auth.admin.getUserById(userId);
            if (user?.email) {
                userEmails[userId] = user.email;
            }
        }

        // Add email fields to each brief
        const enrichedData = data.map(brief => ({
            ...brief,
            submitted_by_email: brief.submitted_by ? userEmails[brief.submitted_by] : null,
            checked_by_email: brief.checked_by ? userEmails[brief.checked_by] : null,
        }));

        return { data: enrichedData };
    }

    return { data };
}

export async function getBriefDetails(briefId: string) {
    const supabase = await createClient();

    const { data: brief, error: briefError } = await supabase
        .from("project_briefs")
        .select("*")
        .eq("id", briefId)
        .single();

    if (briefError || !brief) {
        return { error: "Brief not found" };
    }

    const { data: responses, error: responsesError } = await supabase
        .from("brief_responses")
        .select("*")
        .eq("brief_id", briefId)
        .order("created_at", { ascending: true });

    if (responsesError) {
        return { error: "Failed to fetch brief responses" };
    }

    return { brief, responses };
}

export interface BriefReviewData {
    briefId: string;
    responses: Array<{
        id: string;
        review_status: "passed" | "rejected";
        commentary?: string;
    }>;
}

export async function updateBriefReview(reviewData: BriefReviewData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "User not authenticated" };
    }

    // Update each response
    for (const response of reviewData.responses) {
        const { error } = await supabase
            .from("brief_responses")
            .update({
                review_status: response.review_status,
                commentary: response.commentary || null,
            })
            .eq("id", response.id);

        if (error) {
            console.error("Error updating response:", error);
            return { error: "Failed to update review" };
        }
    }

    // Determine overall status (rejected if any field is rejected)
    const hasRejected = reviewData.responses.some(r => r.review_status === "rejected");
    const overallStatus = hasRejected ? "rejected" : "passed";

    // Update brief status
    const { error: briefError } = await supabase
        .from("project_briefs")
        .update({
            status: overallStatus,
            checked_by: user.id,
            checked_at: new Date().toISOString(),
        })
        .eq("id", reviewData.briefId);

    if (briefError) {
        return { error: "Failed to update brief status" };
    }

    revalidatePath("/commercial/project-briefs");
    return { success: true, status: overallStatus };
}

export async function sendRejectionEmail(briefId: string) {
    // TODO: Implement email sending via Supabase Edge Functions or Resend
    // For now, just log
    console.log("TODO: Send rejection email for brief:", briefId);
    return { success: true, message: "Email notification feature coming soon" };
}

export async function deleteProjectBrief(briefId: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return { error: "User not authenticated" };
    }

    // Delete the brief (CASCADE will delete associated brief_responses)
    const { error } = await supabase
        .from("project_briefs")
        .delete()
        .eq("id", briefId);

    if (error) {
        console.error("Error deleting brief:", error);
        return { error: "Failed to delete project brief" };
    }

    revalidatePath("/commercial/project-briefs");
    return { success: true };
}
