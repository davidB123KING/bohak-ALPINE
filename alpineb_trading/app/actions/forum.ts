"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ForumState = {
  error?: string;
};

export async function createPost(
  _prevState: ForumState,
  formData: FormData
): Promise<ForumState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Prijaviti se moraš za objavo." };

  const title    = (formData.get("title")    as string)?.trim();
  const content  = (formData.get("content")  as string)?.trim();
  const category = (formData.get("category") as string) ?? "general";

  if (!title)   return { error: "Naslov je obvezen." };
  if (!content) return { error: "Vsebina je obvezna." };
  if (title.length < 5)  return { error: "Naslov mora imeti vsaj 5 znakov." };
  if (content.length < 10) return { error: "Vsebina mora imeti vsaj 10 znakov." };

  const { data, error } = await supabase
    .from("posts")
    .insert({ user_id: user.id, title, content, category })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/forum");
  redirect(`/forum/${data.id}`);
}

export async function createReply(
  _prevState: ForumState,
  formData: FormData
): Promise<ForumState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Prijaviti se moraš za odgovor." };

  const post_id = formData.get("post_id") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!content) return { error: "Odgovor ne sme biti prazen." };
  if (content.length < 3) return { error: "Odgovor mora imeti vsaj 3 znake." };

  const { error } = await supabase
    .from("replies")
    .insert({ post_id, user_id: user.id, content });

  if (error) return { error: error.message };

  revalidatePath(`/forum/${post_id}`);
  return {};
}
