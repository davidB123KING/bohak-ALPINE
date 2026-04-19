import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { label: string; color: string; icon: string }> = {
  broker:      { label: "Broker",        color: "bg-blue-500/20 text-blue-400",       icon: "🏦" },
  tool:        { label: "Orodje",        color: "bg-[#00ff88]/20 text-[#00ff88]",     icon: "🔧" },
  calculator:  { label: "Kalkulator",    color: "bg-yellow-500/20 text-yellow-400",   icon: "🧮" },
  news:        { label: "Novice",        color: "bg-orange-500/20 text-orange-400",   icon: "📰" },
  chart:       { label: "Graf/analiza",  color: "bg-purple-500/20 text-purple-400",   icon: "📈" },
  education:   { label: "Izobraževanje", color: "bg-pink-500/20 text-pink-400",       icon: "📚" },
  other:       { label: "Drugo",         color: "bg-white/10 text-white/50",          icon: "🔗" },
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "pravkar";
  if (m < 60) return `pred ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `pred ${h} ur`;
  return `pred ${Math.floor(h / 24)} dnevi`;
}

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, description, url, category, created_at, user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((resources ?? []).map((r) => r.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  const grouped = Object.entries(CATEGORIES).map(([key, cat]) => ({
    key, cat,
    items: (resources ?? []).filter((r) => r.category === key),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Viri</h1>
          <p className="text-white/40 text-sm mt-1">Koristne povezave, orodja in viri skupnosti</p>
        </div>
        {user && (
          <Link href="/dashboard/resources/new"
            className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
            + Dodaj vir
          </Link>
        )}
      </div>

      {!resources || resources.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <p className="text-white/50 text-sm">Še ni virov. Deli koristne povezave!</p>
          {user && (
            <Link href="/dashboard/resources/new" className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
              Dodaj vir
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.map(({ key, cat, items }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{cat.icon}</span>
                <h2 className="text-white font-semibold text-sm tracking-widest uppercase">{cat.label}</h2>
                <span className="text-white/20 text-xs">({items.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((r) => {
                  const author = profileMap[r.user_id];
                  const authorName = author?.username ? `@${author.username}` : (author?.full_name ?? "");
                  const hostname = (() => { try { return new URL(r.url).hostname.replace("www.", ""); } catch { return r.url; } })();
                  return (
                    <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-4 hover:border-[#00ff88]/20 transition-colors group flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white font-semibold text-sm group-hover:text-[#00ff88] transition-colors line-clamp-1 flex-1">
                          {r.title}
                        </h3>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </div>
                      <p className="text-white/50 text-xs line-clamp-2">{r.description}</p>
                      <div className="flex items-center justify-between text-white/25 text-xs mt-1">
                        <span>{hostname}</span>
                        <span>{authorName} · {timeAgo(r.created_at)}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
