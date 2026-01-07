"use server";

import { getBankBalance, getBankBalanceWithTrend, type BankBalanceData } from "@/lib/kledo";

export async function getLatestBalanceAction() {
    try {
        const balance = await getBankBalance();
        return { success: true, balance };
    } catch (error) {
        console.error("Failed to fetch balance:", error);
        return { success: false, error: "Failed to fetch balance" };
    }
}

export async function getBalanceWithTrendAction(date?: string): Promise<{
    success: boolean;
    data?: BankBalanceData;
    error?: string;
}> {
    try {
        const data = await getBankBalanceWithTrend(date);
        if (data === null) {
            return { success: false, error: "Not connected to Kledo" };
        }
        return { success: true, data };
    } catch (error) {
        console.error("Failed to fetch balance with trend:", error);
        return { success: false, error: "Failed to fetch balance" };
    }
}
