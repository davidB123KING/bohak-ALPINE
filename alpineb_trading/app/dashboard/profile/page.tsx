"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { createClient } from "@/lib/supabase/client";
import type { ProfileState } from "@/app/actions/profile";

const initialState: ProfileState = {};

type Profile = {
  full_name: string | null;
  username: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-20 h-20 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30 flex items-center justify-center">
      <span className="text-[#00ff88] text-2xl font-bold">{initials || "?"}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, username, bio, website, avatar_url, created_at")
        .eq("id", user.id)
        .single();

      setProfile(data ?? {
        full_name: user.user_metadata?.full_name ?? "",
        username: null, bio: null, website: null, avatar_url: null, created_at: null,
      });
      setLoading(false);
    }
    load();
  }, []);

  // Posodobi lokalni profil ko je shranjevanje uspešno
  useEffect(() => {
    if (state.success) {
      async function reload() {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("profiles")
          .select("full_name, username, bio, website, avatar_url, created_at")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      reload();
    }
  }, [state.success]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name ?? email;
  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("sl-SI", { year: "numeric", month: "long" })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <AvatarPlaceholder name={displayName} />
        <div>
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
          <p className="text-white/40 text-sm">{email}</p>
          {joinDate && <p className="text-white/30 text-xs mt-1">Član od {joinDate}</p>}
        </div>
      </div>

      {/* Card */}
      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-6 text-sm tracking-widest uppercase">
          Uredi Profil
        </h2>

        {state.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 px-4 py-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-sm">
            {state.success}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          {/* Ime */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Ime in Priimek <span className="text-[#00ff88]">*</span>
            </label>
            <input
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ""}
              placeholder="Janez Novak"
              required
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">@</span>
              <input
                name="username"
                type="text"
                defaultValue={profile?.username ?? ""}
                placeholder="janeznovak"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg pl-8 pr-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <p className="text-white/25 text-xs mt-1">3–20 znakov, samo črke, številke in _</p>
          </div>

          {/* Bio */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={profile?.bio ?? ""}
              placeholder="Kratko o sebi, trading stil, izkušnje..."
              rows={3}
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          {/* Website */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Spletna stran
            </label>
            <input
              name="website"
              type="url"
              defaultValue={profile?.website ?? ""}
              placeholder="https://..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Email <span className="text-white/25 normal-case tracking-normal">(ni mogoče spremeniti)</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full bg-[#060d13]/50 border border-[#1a2e1a]/50 rounded-lg px-4 py-3 text-white/30 text-sm cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_#00ff8822] mt-2"
          >
            {pending ? "Shranjujem..." : "Shrani Profil"}
          </button>
        </form>
      </div>
    </div>
  );
}
