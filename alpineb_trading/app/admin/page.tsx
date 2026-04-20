import { createClient } from "@/lib/supabase/server";

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: totalStrategies },
    { count: postsToday },
    { count: postsWeek },
    { count: strategiesToday },
    { count: strategiesWeek },
    { data: recentPosts },
    { data: recentStrategies },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("strategies").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("posts").select("id", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabase.from("strategies").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
    supabase.from("strategies").select("id", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
    supabase.from("posts").select("id, title, category, created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("strategies").select("id, title, category, asset_class, created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Skupaj uporabnikov", value: totalUsers ?? 0, accent: false },
    { label: "Skupaj objav",       value: totalPosts ?? 0, accent: false },
    { label: "Skupaj strategij",   value: totalStrategies ?? 0, accent: false },
    { label: "Objave danes",       value: postsToday ?? 0, accent: true },
    { label: "Objave ta teden",    value: postsWeek ?? 0, accent: true },
    { label: "Strategije danes",   value: strategiesToday ?? 0, accent: true },
    { label: "Strategije ta teden",value: strategiesWeek ?? 0, accent: true },
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m nazaj`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h nazaj`;
    return `${Math.floor(h / 24)}d nazaj`;
  }

  return (
    <div className="px-8 py-8">
      <h1 className="text-xl font-bold text-white mb-1">Statistike</h1>
      <p className="text-white/30 text-sm mb-8">Pregled aktivnosti platforme</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-3xl font-bold ${s.accent ? "text-[#00ff88]" : "text-white"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent posts */}
        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5">
          <h2 className="text-white/50 text-xs tracking-widest uppercase mb-4">Zadnje objave</h2>
          <div className="flex flex-col gap-2">
            {(recentPosts ?? []).length === 0 && <p className="text-white/20 text-sm">Ni objav.</p>}
            {(recentPosts ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#1a2e1a] last:border-0">
                <span className="text-white/80 text-sm truncate">{p.title}</span>
                <span className="text-white/30 text-xs shrink-0">{timeAgo(p.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent strategies */}
        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5">
          <h2 className="text-white/50 text-xs tracking-widest uppercase mb-4">Zadnje strategije</h2>
          <div className="flex flex-col gap-2">
            {(recentStrategies ?? []).length === 0 && <p className="text-white/20 text-sm">Ni strategij.</p>}
            {(recentStrategies ?? []).map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-2 py-2 border-b border-[#1a2e1a] last:border-0">
                <span className="text-white/80 text-sm truncate">{s.title}</span>
                <span className="text-white/30 text-xs shrink-0">{timeAgo(s.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
