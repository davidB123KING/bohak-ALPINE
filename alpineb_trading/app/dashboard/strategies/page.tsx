import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  scalping:   { label: "Scalping",        color: "bg-red-500/20 text-red-400" },
  daytrading: { label: "Day trading",     color: "bg-orange-500/20 text-orange-400" },
  swing:      { label: "Swing",           color: "bg-blue-500/20 text-blue-400" },
  positional: { label: "Pozicijsko",      color: "bg-purple-500/20 text-purple-400" },
  algorithmic:{ label: "Algoritmično",    color: "bg-[#00ff88]/20 text-[#00ff88]" },
  other:      { label: "Drugo",           color: "bg-white/10 text-white/50" },
};

const ASSETS: Record<string, string> = {
  general: "Splošno", crypto: "Kripto", stocks: "Delnice",
  forex: "Forex", options: "Opcije", futures: "Terminke",
};

const TIMEFRAMES: Record<string, string> = {
  "1m":"1m","5m":"5m","15m":"15m","30m":"30m",
  "1h":"1h","4h":"4h","1d":"1D","1w":"1T",
};

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1)  return "pravkar";
  if (m < 60) return `pred ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `pred ${h} ur`;
  return `pred ${Math.floor(h / 24)} dnevi`;
}

export default async function StrategiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: strategies } = await supabase
    .from("strategies")
    .select("id, title, description, category, timeframe, asset_class, created_at, user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((strategies ?? []).map((s) => s.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Strategije</h1>
          <p className="text-white/40 text-sm mt-1">Trading strategije skupnosti</p>
        </div>
        {user && (
          <Link
            href="/dashboard/strategies/new"
            className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors"
          >
            + Dodaj strategijo
          </Link>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(CATEGORIES).map(([k, v]) => (
          <span key={k} className={`px-3 py-1 rounded-full text-xs font-medium ${v.color}`}>
            {v.label}
          </span>
        ))}
      </div>

      {!strategies || strategies.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
              <polyline points="16 7 22 7 22 13"/>
            </svg>
          </div>
          <p className="text-white/50 text-sm">Še ni strategij. Bodi prvi!</p>
          {user && (
            <Link href="/dashboard/strategies/new" className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
              Dodaj svojo strategijo
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {strategies.map((s) => {
            const cat = CATEGORIES[s.category] ?? CATEGORIES.other;
            const author = profileMap[s.user_id];
            const authorName = author?.username ? `@${author.username}` : (author?.full_name ?? "Neznani trader");
            return (
              <Link
                key={s.id}
                href={`/dashboard/strategies/${s.id}`}
                className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl px-5 py-4 hover:border-[#00ff88]/20 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">
                        {ASSETS[s.asset_class] ?? s.asset_class}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">
                        {TIMEFRAMES[s.timeframe] ?? s.timeframe}
                      </span>
                    </div>
                    <h2 className="text-white font-semibold text-sm group-hover:text-[#00ff88] transition-colors line-clamp-1">
                      {s.title}
                    </h2>
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{s.description}</p>
                    <p className="text-white/25 text-xs mt-2">{authorName} · {timeAgo(s.created_at)}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
