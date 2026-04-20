"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StrategyState = { error?: string };

export async function createStrategy(
  _prev: StrategyState,
  formData: FormData
): Promise<StrategyState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Prijaviti se moraš." };

  const title       = (formData.get("title")       as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const entry_rules = (formData.get("entry_rules") as string)?.trim();
  const exit_rules  = (formData.get("exit_rules")  as string)?.trim();
  const risk_mgmt   = (formData.get("risk_mgmt")   as string)?.trim();
  const category    = (formData.get("category")    as string) ?? "swing";
  const timeframe   = (formData.get("timeframe")   as string) ?? "1d";
  const asset_class = (formData.get("asset_class") as string) ?? "general";
  const tv_symbol   = (formData.get("tv_symbol")   as string)?.trim().toUpperCase() || null;

  if (!title || title.length < 5)              return { error: "Naslov mora imeti vsaj 5 znakov." };
  if (!description || description.length < 20) return { error: "Opis mora imeti vsaj 20 znakov." };

  // Image URLs uploaded client-side, passed as hidden inputs
  const imageUrls = (formData.getAll("images") as string[]).filter(
    (v) => typeof v === "string" && v.startsWith("https://")
  );

  const { data, error } = await supabase
    .from("strategies")
    .insert({
      user_id: user.id,
      title, description, entry_rules, exit_rules, risk_mgmt,
      category, timeframe, asset_class, tv_symbol,
      images: imageUrls.length > 0 ? imageUrls : null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/strategies");
  redirect(`/dashboard/strategies/${data.id}`);
}
