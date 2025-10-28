import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { 
  calculateBonusesForPeriod, 
  recalculateEmployeeBonus 
} from "@/lib/calculations/bonus-formula";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bonusPeriodId, employeeId } = body;

    if (!bonusPeriodId) {
      return NextResponse.json(
        { error: "Bonus period ID is required" },
        { status: 400 }
      );
    }

    // If employeeId is provided, recalculate for specific employee
    // Otherwise, calculate for all employees in the period
    if (employeeId) {
      const result = await recalculateEmployeeBonus(bonusPeriodId, employeeId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Employee bonus recalculated successfully",
        result: result.result
      });
    } else {
      const result = await calculateBonusesForPeriod(bonusPeriodId);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Bonuses calculated successfully",
        results: result.results
      });
    }
  } catch (error) {
    console.error("Error in calculate-bonus API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const bonusPeriodId = searchParams.get("bonusPeriodId");

    if (!bonusPeriodId) {
      return NextResponse.json(
        { error: "Bonus period ID is required" },
        { status: 400 }
      );
    }

    // Fetch existing calculations
    const { data: calculations, error } = await supabase
      .from("bonus_calculations")
      .select(`
        *,
        employees (
          id,
          first_name,
          last_name,
          email,
          salary,
          department_id
        )
      `)
      .eq("bonus_period_id", bonusPeriodId)
      .order("bonus_amount", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get bonus period details
    const { data: bonusPeriod, error: periodError } = await supabase
      .from("bonus_periods")
      .select(`
        *,
        departments (
          id,
          name
        )
      `)
      .eq("id", bonusPeriodId)
      .single();

    if (periodError) {
      return NextResponse.json(
        { error: periodError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bonusPeriod,
      calculations: calculations || []
    });
  } catch (error) {
    console.error("Error fetching bonus calculations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}