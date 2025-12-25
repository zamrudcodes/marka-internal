"use server";

import { getBankBalance } from "@/lib/kledo";

export async function getLatestBalanceAction() {
    try {
        const balance = await getBankBalance();
        return { success: true, balance };
    } catch (error) {
        console.error("Failed to fetch balance:", error);
        return { success: false, error: "Failed to fetch balance" };
    }
}
