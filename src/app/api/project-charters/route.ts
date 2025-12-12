import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Extract form data
    const {
      projectName,
      clientName,
      tierFastCount,
      tierComplexCount,
      requestedStartDate,
      finalDeliveryDue,
      tentativeStudioShootWeek,
      budgetTotal,
      productionDaysNeeded,
      daysAvailable,
      status,
      projectStatus,
    } = body;

    // Insert into database
    const { data, error } = await supabase
      .from("project_charters")
      .insert([
        {
          project_name: projectName,
          client_name: clientName,
          tier_fast_count: tierFastCount,
          tier_complex_count: tierComplexCount,
          requested_start_date: requestedStartDate,
          final_delivery_due: finalDeliveryDue,
          tentative_studio_shoot_week: tentativeStudioShootWeek || null,
          budget_total: parseFloat(budgetTotal),
          production_days_needed: productionDaysNeeded,
          days_available: daysAvailable,
          feasibility_status: status,
          project_status: projectStatus,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating project charter:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error in project charter API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("project_charters")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching project charters:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error in project charter API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}