import { createClient } from "@/utils/supabase/server";

const KLEDO_BASE_URL = "https://pt-marka-digital-indonesia.api.kledo.com";
const KLEDO_API_URL = `${KLEDO_BASE_URL}/api/v1`;
const CLIENT_ID = process.env.KLEDO_CLIENT_ID;
const CLIENT_SECRET = process.env.KLEDO_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/kledo/callback`;

export interface KledoToken {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export async function getAuthUrl() {
    if (!CLIENT_ID || !REDIRECT_URI) {
        throw new Error("Missing Kledo credentials");
    }
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
    });
    return `${KLEDO_API_URL}/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<KledoToken> {
    const response = await fetch(`${KLEDO_API_URL}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            code,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Kledo token exchange error:", error);
        throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    return response.json();
}

export async function storeTokens(tokens: KledoToken) {
    const supabase = await createClient();
    // Assuming we just keep one row for the integration for now (system-wide)
    // We'll delete old ones and insert new, or update. 
    // Since we don't have a unique constraint on a "user_id" (it's system wide), we can just fetch the first one to update or insert new.

    // For simplicity, let's treat it as a singleton row.
    const { data: existing } = await supabase.from("kledo_integrations").select("id").limit(1).single();

    const expiresAt = Date.now() + tokens.expires_in * 1000;

    let error;
    if (existing) {
        ({ error } = await supabase.from("kledo_integrations").update({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt,
            updated_at: new Date().toISOString(),
        }).eq("id", existing.id));
    } else {
        ({ error } = await supabase.from("kledo_integrations").insert({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: expiresAt,
        }));
    }

    if (error) {
        console.error("Error storing Kledo tokens:", error);
        throw new Error("Failed to store tokens");
    }
}

async function getValidAccessToken() {
    const supabase = await createClient();
    const { data, error } = await supabase.from("kledo_integrations").select("*").limit(1).single();

    if (error || !data) {
        return null;
    }

    // Check if expired (buffer of 5 minutes)
    if (Date.now() > Number(data.expires_at) - 5 * 60 * 1000) {
        return await refreshAccessToken(data.refresh_token, data.id);
    }

    return data.access_token;
}

async function refreshAccessToken(refreshToken: string, rowId: string) {
    const response = await fetch(`${KLEDO_API_URL}/oauth/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "refresh_token",
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        console.error("Kledo token refresh failed:", await response.text());
        return null;
    }

    const tokens: KledoToken = await response.json();
    const expiresAt = Date.now() + tokens.expires_in * 1000;

    // Update DB
    const supabase = await createClient();
    await supabase.from("kledo_integrations").update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
    }).eq("id", rowId);

    return tokens.access_token;
}

export async function getBankBalance() {
    const token = await getValidAccessToken();
    if (!token) {
        return null;
    }

    const response = await fetch(`${KLEDO_API_URL}/finance/accounts`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.error("Failed to fetch bank accounts:", await response.text());
        return null; // Handle error appropriately in UI
    }

    const data = await response.json();
    // Assuming the response structure based on common accounting APIs, but user provided docs link.
    // I made a best guess. I will need to refine if I can see the structure.
    // Usually it returns a list of accounts. Sum them up or pick the main one.
    // For now, let's assuming "data.data" is an array of accounts.

    if (data && data.data && Array.isArray(data.data)) {
        // Sum of all generic bank accounts? Or just return the first one?
        // Let's sum all accounts with type 'Bank'.
        const accounts = data.data;
        // This is a guess on property names. 'balance' is standard.
        const totalBalance = accounts.reduce((sum: number, acc: any) => sum + (Number(acc.balance) || 0), 0);
        return totalBalance;
    }

    return 0;
}
