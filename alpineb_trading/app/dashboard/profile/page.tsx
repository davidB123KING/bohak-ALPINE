"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
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

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={80}
        height={80}
        className="w-20 h-20 rounded-full object-cover border-2 border-[#00ff88]/30"
      />
    );
  }
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabaseRef = useRef(createClient());

  async function loadProfile() {
    const supabase = supabaseRef.current;
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

  useEffect(() => { loadProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.success) loadProfile();
  }, [state.success]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Slika mora biti manjša od 2 MB.");
      return;
    }
    setUploadError(null);
    setUploading(true);
    const supabase = supabaseRef.current;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setUploadError("Napaka pri nalaganju: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateErr) {
      setUploadError("Napaka pri shranjevanju URL-ja: " + updateErr.message);
    } else {
      setProfile((prev) => prev ? { ...prev, avatar_url: publicUrl } : prev);
    }
    setUploading(false);
  }

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
        <div className="relative group">
          <Avatar name={displayName} url={profile?.avatar_url ?? null} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{displayName}</h1>
          <p className="text-white/40 text-sm">{email}</p>
          {joinDate && <p className="text-white/30 text-xs mt-1">Član od {joinDate}</p>}
          {uploading && <p className="text-[#00ff88] text-xs mt-1">Nalagam sliko...</p>}
          {uploadError && <p className="text-red-400 text-xs mt-1">{uploadError}</p>}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-white/30 text-xs mt-1 hover:text-[#00ff88] transition-colors"
          >
            Spremeni profilno sliko
          </button>
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
