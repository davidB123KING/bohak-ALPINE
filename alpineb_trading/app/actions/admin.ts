"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neprijavljen");
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Ni dovoljenja");
  return supabase;
}

export async function adminDeletePost(postId: string) {
  const supabase = await requireAdmin();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/admin/forum");
}

export async function adminDeleteStrategy(strategyId: string) {
  const supabase = await requireAdmin();
  await supabase.from("strategies").delete().eq("id", strategyId);
  revalidatePath("/admin/strategies");
}

export async function adminDeleteProfile(profileId: string) {
  const supabase = await requireAdmin();
  await supabase.from("profiles").delete().eq("id", profileId);
  revalidatePath("/admin/users");
}
