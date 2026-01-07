import { getAuthUrl } from "@/lib/kledo";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const url = await getAuthUrl();
        console.log("Redirecting to Kledo OAuth URL:", url);
        redirect(url);
    } catch (error: unknown) {
        // Next.js redirect() throws a special error - we need to re-throw it
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }
        console.error("Kledo signin error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
