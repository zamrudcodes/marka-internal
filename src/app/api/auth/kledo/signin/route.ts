import { getAuthUrl } from "@/lib/kledo";
import { redirect } from "next/navigation";

export async function GET() {
    const url = await getAuthUrl();
    redirect(url);
}
