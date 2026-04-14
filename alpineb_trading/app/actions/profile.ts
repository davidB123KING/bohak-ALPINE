"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  success?: string;
};

export async function updateProfile(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Niste prijavljeni." };

  const full_name = (formData.get("full_name") as string)?.trim();
  const username  = (formData.get("username")  as string)?.trim().toLowerCase();
  const bio       = (formData.get("bio")        as string)?.trim();
  const website   = (formData.get("website")    as string)?.trim();

  if (!full_name) return { error: "Ime in priimek sta obvezna." };

  if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username: 3–20 znakov, samo črke, številke in _" };
  }

  // Preveri če je username že zaseden (pri drugem userju)
  if (username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) return { error: "Ta username je že zaseden." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, username: username || null, bio: bio || null, website: website || null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // Posodobi tudi display name v auth metapodatkih
  await supabase.auth.updateUser({ data: { full_name } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return { success: "Profil uspešno shranjen!" };
}
