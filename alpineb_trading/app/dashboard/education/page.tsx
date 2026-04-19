import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general:   { label: "Splošno",         color: "bg-white/10 text-white/50" },
  technical: { label: "Tehnična analiza",color: "bg-[#00ff88]/20 text-[#00ff88]" },
  psychology:{ label: "Psihologija",     color: "bg-purple-500/20 text-purple-400" },
  risk:      { label: "Risk management", color: "bg-red-500/20 text-red-400" },
  crypto:    { label: "Kripto",          color: "bg-orange-500/20 text-orange-400" },
  stocks:    { label: "Delnice",         color: "bg-blue-500/20 text-blue-400" },
  forex:     { label: "Forex",           color: "bg-pink-500/20 text-pink-400" },
};

const DIFFICULTY: Record<string, { label: string; color: string }> = {
  beginner:     { label: "Začetnik",    color: "text-green-400" },
  intermediate: { label: "Vmesni",      color: "text-yellow-400" },
  advanced:     { label: "Napredno",    color: "text-red-400" },
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "pravkar";
  if (m < 60) return `pred ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `pred ${h} ur`;
  return `pred ${Math.floor(h / 24)} dnevi`;
}

export default async function EducationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: articles } = await supabase
    .from("education")
    .select("id, title, category, difficulty, read_time, created_at, user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((articles ?? []).map((a) => a.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Izobraževanje</h1>
          <p className="text-white/40 text-sm mt-1">Vodiči, nasveti in znanje skupnosti</p>
        </div>
        {user && (
          <Link href="/dashboard/education/new"
            className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
            + Dodaj članek
          </Link>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <span key={k} className={`px-3 py-1 rounded-full text-xs font-medium ${v.color}`}>{v.label}</span>
        ))}
      </div>

      {!articles || articles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <p className="text-white/50 text-sm">Še ni člankov. Deli svoje znanje!</p>
          {user && (
            <Link href="/dashboard/education/new" className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
              Napiši članek
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((a) => {
            const cat = CATEGORIES[a.category] ?? CATEGORIES.general;
            const diff = DIFFICULTY[a.difficulty] ?? DIFFICULTY.beginner;
            const author = profileMap[a.user_id];
            const authorName = author?.username ? `@${author.username}` : (author?.full_name ?? "Neznani trader");
            return (
              <Link key={a.id} href={`/dashboard/education/${a.id}`}
                className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5 hover:border-[#00ff88]/20 transition-colors group flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                  <span className={`text-xs font-medium ${diff.color}`}>{diff.label}</span>
                </div>
                <h2 className="text-white font-semibold text-sm group-hover:text-[#00ff88] transition-colors line-clamp-2 flex-1">
                  {a.title}
                </h2>
                <div className="flex items-center justify-between text-white/30 text-xs">
                  <span>{authorName}</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {a.read_time} min
                    </span>
                    <span>{timeAgo(a.created_at)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
