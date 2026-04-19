import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import StrategySearch from "./StrategySearch";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  scalping:    { label: "Scalping",     color: "bg-red-500/20 text-red-400" },
  daytrading:  { label: "Day trading",  color: "bg-orange-500/20 text-orange-400" },
  swing:       { label: "Swing",        color: "bg-blue-500/20 text-blue-400" },
  positional:  { label: "Pozicijsko",   color: "bg-purple-500/20 text-purple-400" },
  algorithmic: { label: "Algoritmično", color: "bg-[#00ff88]/20 text-[#00ff88]" },
  other:       { label: "Drugo",        color: "bg-white/10 text-white/50" },
};

const ASSETS: Record<string, string> = {
  general:"Splošno", crypto:"Kripto", stocks:"Delnice",
  forex:"Forex", options:"Opcije", futures:"Terminke",
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

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Poišči profile ki ustrezajo iskanju
  let filteredUserIds: string[] | null = null;
  let matchedProfiles: { id: string; full_name: string | null; username: string | null; bio: string | null }[] = [];

  if (query) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, username, bio")
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`);

    matchedProfiles = profiles ?? [];
    filteredUserIds = matchedProfiles.map((p) => p.id);
  }

  // Fetch strategije
  let strategiesQuery = supabase
    .from("strategies")
    .select("id, title, description, category, timeframe, asset_class, created_at, user_id")
    .order("created_at", { ascending: false });

  if (filteredUserIds !== null) {
    if (filteredUserIds.length === 0) {
      // Ni ujemajočih profilov
      return (
        <StrategiesLayout user={!!user} query={query}>
          <ProfileResults profiles={[]} query={query} />
          <EmptyState query={query} />
        </StrategiesLayout>
      );
    }
    strategiesQuery = strategiesQuery.in("user_id", filteredUserIds);
  }

  const { data: strategies } = await strategiesQuery;

  // Fetch avtorje
  const userIds = [...new Set((strategies ?? []).map((s) => s.user_id))];
  const { data: allProfiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", userIds)
    : { data: [] };
  const profileMap = Object.fromEntries((allProfiles ?? []).map((p) => [p.id, p]));

  return (
    <StrategiesLayout user={!!user} query={query}>
      {query && <ProfileResults profiles={matchedProfiles} query={query} />}

      {!strategies || strategies.length === 0 ? (
        <EmptyState query={query} loggedIn={!!user} />
      ) : (
        <div className="flex flex-col gap-3">
          {strategies.map((s) => {
            const cat = CATEGORIES[s.category] ?? CATEGORIES.other;
            const author = profileMap[s.user_id];
            const authorDisplay = author?.username ? `@${author.username}` : (author?.full_name ?? "Neznani trader");
            const authorSlug = author?.username ?? null;

            return (
              <div key={s.id} className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl px-5 py-4 hover:border-[#00ff88]/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">{ASSETS[s.asset_class] ?? s.asset_class}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">{TIMEFRAMES[s.timeframe] ?? s.timeframe}</span>
                    </div>
                    <Link href={`/dashboard/strategies/${s.id}`} className="group">
                      <h2 className="text-white font-semibold text-sm group-hover:text-[#00ff88] transition-colors line-clamp-1">
                        {s.title}
                      </h2>
                    </Link>
                    <p className="text-white/40 text-xs mt-1 line-clamp-2">{s.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {authorSlug ? (
                        <Link href={`/profile/${authorSlug}`} className="text-white/30 text-xs hover:text-[#00ff88] transition-colors">
                          {authorDisplay}
                        </Link>
                      ) : (
                        <span className="text-white/25 text-xs">{authorDisplay}</span>
                      )}
                      <span className="text-white/15 text-xs">·</span>
                      <span className="text-white/25 text-xs">{timeAgo(s.created_at)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/strategies/${s.id}`} className="text-white/20 hover:text-[#00ff88] transition-colors shrink-0 mt-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StrategiesLayout>
  );
}

function StrategiesLayout({
  children,
  user,
  query,
}: {
  children: React.ReactNode;
  user: boolean;
  query: string;
}) {
  return (
    <div className="min-h-screen bg-[#060d13] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#1a2e1a] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00ff88] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">A</span>
          </div>
          <span className="font-bold text-white text-sm tracking-widest uppercase hidden sm:block">ALPINEB</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/forum" className="text-white/50 hover:text-white text-sm transition-colors">Forum</Link>
          {user ? (
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">Dashboard</Link>
          ) : (
            <Link href="/auth/login" className="text-white/60 hover:text-white text-sm transition-colors">Prijava</Link>
          )}
          {user && (
            <Link href="/dashboard/strategies/new"
              className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
              + Dodaj
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Strategije skupnosti</h1>
          <p className="text-white/40 text-sm mt-1">Odkrijte in delite trading strategije</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Suspense>
            <StrategySearch defaultValue={query} />
          </Suspense>
        </div>

        {children}
      </div>
    </div>
  );
}

function ProfileResults({
  profiles,
  query,
}: {
  profiles: { id: string; full_name: string | null; username: string | null; bio: string | null }[];
  query: string;
}) {
  if (profiles.length === 0) return null;
  return (
    <div className="mb-6">
      <p className="text-white/30 text-xs tracking-widest uppercase mb-3">
        Ujemajoči profili ({profiles.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {profiles.map((p) => {
          const display = p.username ? `@${p.username}` : (p.full_name ?? "?");
          const slug = p.username;
          if (!slug) return null;
          return (
            <Link key={p.id} href={`/profile/${slug}`}
              className="flex items-center gap-2 bg-[#0a1520] border border-[#1a2e1a] hover:border-[#00ff88]/30 rounded-xl px-4 py-2.5 transition-colors group">
              <div className="w-7 h-7 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center shrink-0">
                <span className="text-[#00ff88] text-xs font-bold">
                  {(p.full_name ?? p.username ?? "?")[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-sm font-medium group-hover:text-[#00ff88] transition-colors">{display}</p>
                {p.bio && <p className="text-white/30 text-xs line-clamp-1 max-w-[180px]">{p.bio}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({ query, loggedIn }: { query?: string; loggedIn?: boolean }) {
  return (
    <div className="text-center py-20">
      <div className="w-14 h-14 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
          <polyline points="16 7 22 7 22 13"/>
        </svg>
      </div>
      {query ? (
        <p className="text-white/50 text-sm">Ni strategij za &ldquo;{query}&rdquo;</p>
      ) : (
        <>
          <p className="text-white/50 text-sm">Še ni strategij. Bodi prvi!</p>
          {loggedIn && (
            <Link href="/dashboard/strategies/new" className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
              Dodaj svojo strategijo
            </Link>
          )}
        </>
      )}
    </div>
  );
}
