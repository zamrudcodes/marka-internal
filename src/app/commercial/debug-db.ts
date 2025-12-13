"use server";

import { createClient } from "@/utils/supabase/server";

export async function testDatabaseAccess() {
    const supabase = await createClient();

    console.log("=== Testing Database Access ===");

    // Test 1: Check auth status
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Current user:", user?.id || "Not authenticated");

    // Test 2: Try to select from project_briefs
    const { data: briefs, error: selectError } = await supabase
        .from("project_briefs")
        .select("*")
        .limit(5);

    console.log("Select result:", {
        count: briefs?.length || 0,
        error: selectError?.message || null,
        data: briefs
    });

    // Test 3: Try a simple insert
    const { data: testBrief, error: insertError } = await supabase
        .from("project_briefs")
        .insert([{
            project_name: "Debug Test Brief",
            submitter_email: "debug@test.com",
            submitted_by: user?.id || null,
            status: "not_started"
        }])
        .select()
        .single();

    console.log("Insert result:", {
        success: !!testBrief,
        error: insertError?.message || null,
        id: testBrief?.id
    });

    return {
        user: user?.id || null,
        selectError: selectError?.message || null,
        insertError: insertError?.message || null,
        briefCount: briefs?.length || 0,
        testBriefId: testBrief?.id || null
    };
}
