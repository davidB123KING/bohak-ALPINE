"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResourceState = { error?: string; success?: string };

export async function createResource(
  _prev: ResourceState,
  formData: FormData
): Promise<ResourceState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Prijaviti se moraš." };

  const title       = (formData.get("title")       as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const url         = (formData.get("url")         as string)?.trim();
  const category    = (formData.get("category")    as string) ?? "tool";

  if (!title || title.length < 3)      return { error: "Naslov mora imeti vsaj 3 znake." };
  if (!description || description.length < 10) return { error: "Opis mora imeti vsaj 10 znakov." };
  if (!url) return { error: "URL je obvezen." };

  try { new URL(url); } catch { return { error: "Vnesite veljaven URL (npr. https://...)." }; }

  const { error } = await supabase
    .from("resources")
    .insert({ user_id: user.id, title, description, url, category });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/resources");
  return { success: "Vir uspešno dodan!" };
}
