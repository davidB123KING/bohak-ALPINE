"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type EducationState = { error?: string };

export async function createArticle(
  _prev: EducationState,
  formData: FormData
): Promise<EducationState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Prijaviti se moraš." };

  const title      = (formData.get("title")      as string)?.trim();
  const content    = (formData.get("content")    as string)?.trim();
  const category   = (formData.get("category")   as string) ?? "general";
  const difficulty = (formData.get("difficulty") as string) ?? "beginner";
  const read_time  = parseInt(formData.get("read_time") as string) || 5;

  if (!title || title.length < 5)    return { error: "Naslov mora imeti vsaj 5 znakov." };
  if (!content || content.length < 50) return { error: "Vsebina mora imeti vsaj 50 znakov." };

  const { data, error } = await supabase
    .from("education")
    .insert({ user_id: user.id, title, content, category, difficulty, read_time })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/education");
  redirect(`/dashboard/education/${data.id}`);
}
