import { exchangeCodeForToken, storeTokens } from "@/lib/kledo";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.json({ error }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const tokens = await exchangeCodeForToken(code);
        await storeTokens(tokens);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }

    redirect("/dashboard");
}
