// src/lib/syncToVercel.ts
import fetch from "node-fetch";

/**
 * Push updated rates from Render DB to Vercel API
 * @param rates Example: { gold_24k_sale: 6150, silver_24k_sale: 75 }
 */
export async function pushRatesToVercel(rates: {
  gold_24k_sale: number;
  silver_24k_sale: number;
}) {
  try {
    const vercelApiUrl =
      process.env.VERCEL_API_URL || "https://your-vercel-app.vercel.app/api/rates";

    const response = await fetch(vercelApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VERCEL_SYNC_TOKEN}`, // secure token
      },
      body: JSON.stringify(rates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to sync rates: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Rates pushed to Vercel successfully:", data);

    return data;
  } catch (error) {
    console.error("❌ Sync to Vercel failed:", error);
    throw error;
  }
}
