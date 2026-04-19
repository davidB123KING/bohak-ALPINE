import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

const STRATEGY_CATEGORIES: Record<string, { label: string; color: string }> = {
  scalping:    { label: "Scalping",     color: "bg-red-500/20 text-red-400" },
  daytrading:  { label: "Day trading",  color: "bg-orange-500/20 text-orange-400" },
  swing:       { label: "Swing",        color: "bg-blue-500/20 text-blue-400" },
  positional:  { label: "Pozicijsko",   color: "bg-purple-500/20 text-purple-400" },
  algorithmic: { label: "Algoritmično", color: "bg-[#00ff88]/20 text-[#00ff88]" },
  other:       { label: "Drugo",        color: "bg-white/10 text-white/50" },
};

const POST_CATEGORIES: Record<string, { label: string; color: string }> = {
  general:   { label: "Splošno",          color: "bg-white/10 text-white/60" },
  crypto:    { label: "Kripto",           color: "bg-orange-500/20 text-orange-400" },
  stocks:    { label: "Delnice",          color: "bg-blue-500/20 text-blue-400" },
  forex:     { label: "Forex",            color: "bg-purple-500/20 text-purple-400" },
  options:   { label: "Opcije",           color: "bg-pink-500/20 text-pink-400" },
  technical: { label: "Tehnična analiza", color: "bg-[#00ff88]/20 text-[#00ff88]" },
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "pravkar";
  if (m < 60) return `pred ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `pred ${h} ur`;
  return `pred ${Math.floor(h / 24)} dnevi`;
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // Poišči profil po username
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, username, bio, website, avatar_url, created_at")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Fetch strategije, objave in odgovori vzporedno
  const [{ data: strategies }, { data: posts }, { count: replyCount }] = await Promise.all([
    supabase
      .from("strategies")
      .select("id, title, description, category, timeframe, asset_class, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("posts")
      .select("id, title, category, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("replies")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
  ]);

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("sl-SI", { year: "numeric", month: "long" })
    : null;

  const initials = (profile.full_name ?? profile.username ?? "?")
    .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-[#060d13] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#1a2e1a] px-6 py-4 flex items-center gap-4 max-w-4xl mx-auto">
        <Link href="/strategies" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#00ff88] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-[10px]">A</span>
          </div>
          <span className="font-bold text-white text-sm tracking-widest uppercase hidden sm:block">ALPINEB</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profil header */}
        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name ?? username}
                  width={72}
                  height={72}
                  className="w-18 h-18 rounded-full object-cover border-2 border-[#00ff88]/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 border-2 border-[#00ff88]/30 flex items-center justify-center">
                  <span className="text-[#00ff88] text-xl font-bold">{initials}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white">{profile.full_name ?? `@${username}`}</h1>
              {profile.username && (
                <p className="text-[#00ff88] text-sm mt-0.5">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-white/60 text-sm mt-2 leading-relaxed">{profile.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {joinDate && (
                  <span className="text-white/25 text-xs flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Član od {joinDate}
                  </span>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="text-white/30 text-xs hover:text-[#00ff88] transition-colors flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                    {(() => { try { return new URL(profile.website).hostname.replace("www.", ""); } catch { return profile.website; } })()}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#1a2e1a]">
            {[
              { label: "Strategije", value: strategies?.length ?? 0 },
              { label: "Objave",     value: posts?.length ?? 0 },
              { label: "Odgovori",   value: replyCount ?? 0 },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-white/30 text-xs tracking-widest uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategije */}
        <section className="mb-8">
          <h2 className="text-white font-semibold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            Strategije
            <span className="text-white/20 font-normal normal-case tracking-normal">({strategies?.length ?? 0})</span>
          </h2>

          {!strategies || strategies.length === 0 ? (
            <p className="text-white/25 text-sm py-4">Še ni objavljenih strategij.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {strategies.map((s) => {
                const cat = STRATEGY_CATEGORIES[s.category] ?? STRATEGY_CATEGORIES.other;
                return (
                  <Link key={s.id} href={`/dashboard/strategies/${s.id}`}
                    className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl px-4 py-3 hover:border-[#00ff88]/20 transition-colors group flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                      </div>
                      <p className="text-white text-sm font-medium group-hover:text-[#00ff88] transition-colors line-clamp-1">{s.title}</p>
                      <p className="text-white/30 text-xs mt-0.5">{timeAgo(s.created_at)}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/20 group-hover:text-[#00ff88] transition-colors">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Forum objave */}
        <section>
          <h2 className="text-white font-semibold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Forum objave
            <span className="text-white/20 font-normal normal-case tracking-normal">({posts?.length ?? 0})</span>
          </h2>

          {!posts || posts.length === 0 ? (
            <p className="text-white/25 text-sm py-4">Še ni forum objav.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {posts.map((p) => {
                const cat = POST_CATEGORIES[p.category] ?? POST_CATEGORIES.general;
                return (
                  <Link key={p.id} href={`/forum/${p.id}`}
                    className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl px-4 py-3 hover:border-[#00ff88]/20 transition-colors group flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                      </div>
                      <p className="text-white text-sm font-medium group-hover:text-[#00ff88] transition-colors line-clamp-1">{p.title}</p>
                      <p className="text-white/30 text-xs mt-0.5">{timeAgo(p.created_at)}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/20 group-hover:text-[#00ff88] transition-colors">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
