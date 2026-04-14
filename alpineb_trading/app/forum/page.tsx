import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general:   { label: "Splošno",          color: "bg-white/10 text-white/60" },
  crypto:    { label: "Kripto",           color: "bg-orange-500/20 text-orange-400" },
  stocks:    { label: "Delnice",          color: "bg-blue-500/20 text-blue-400" },
  forex:     { label: "Forex",            color: "bg-purple-500/20 text-purple-400" },
  options:   { label: "Opcije",           color: "bg-pink-500/20 text-pink-400" },
  technical: { label: "Tehnična analiza", color: "bg-[#00ff88]/20 text-[#00ff88]" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "pravkar";
  if (m < 60) return `pred ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `pred ${h} ur`;
  return `pred ${Math.floor(h / 24)} dnevi`;
}

export default async function ForumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch posts + reply counts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, category, created_at, user_id")
    .order("created_at", { ascending: false });

  // Fetch reply counts per post
  const { data: replyCounts } = await supabase
    .from("replies")
    .select("post_id");

  const countMap: Record<string, number> = {};
  (replyCounts ?? []).forEach((r) => {
    countMap[r.post_id] = (countMap[r.post_id] ?? 0) + 1;
  });

  // Fetch author profiles
  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

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
          {user ? (
            <Link href="/dashboard" className="text-white/60 hover:text-white text-sm transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="text-white/60 hover:text-white text-sm transition-colors">
              Prijava
            </Link>
          )}
          {user && (
            <Link
              href="/forum/new"
              className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors"
            >
              + Novo vprašanje
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Forum</h1>
          <p className="text-white/40 text-sm mt-1">Vprašaj skupnost, deli znanje</p>
        </div>

        {/* Category badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <span key={key} className={`px-3 py-1 rounded-full text-xs font-medium ${cat.color}`}>
              {cat.label}
            </span>
          ))}
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-white/50 text-sm">Še ni objav. Bodi prvi!</p>
            {user && (
              <Link href="/forum/new" className="inline-block mt-4 bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors">
                Postavi vprašanje
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => {
              const cat = CATEGORIES[post.category] ?? CATEGORIES.general;
              const authorName = profileMap[post.user_id]?.full_name ?? "Neznani trader";
              const replyCount = countMap[post.id] ?? 0;

              return (
                <Link
                  key={post.id}
                  href={`/forum/${post.id}`}
                  className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:border-[#00ff88]/20 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>
                        {cat.label}
                      </span>
                    </div>
                    <h2 className="text-white font-semibold text-sm group-hover:text-[#00ff88] transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-white/30 text-xs mt-1.5">
                      {authorName} · {timeAgo(post.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/30 text-xs shrink-0 mt-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    {replyCount}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
