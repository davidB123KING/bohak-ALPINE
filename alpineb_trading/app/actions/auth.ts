"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Vnesite email in geslo." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Napačen email ali geslo." };
    }
    if (error.message.includes("Email not confirmed")) {
      return { error: "Najprej potrdite email naslov." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: "Vsa polja so obvezna." };
  }

  if (password.length < 8) {
    return { error: "Geslo mora imeti vsaj 8 znakov." };
  }

  if (password !== confirmPassword) {
    return { error: "Gesli se ne ujemata." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Ta email je že registriran." };
    }
    return { error: error.message };
  }

  return {
    success:
      "Registracija uspešna! Preverite email in potrdite račun.",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
