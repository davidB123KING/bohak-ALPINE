import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const CATEGORIES: Record<string, { label: string; color: string }> = {
  general:    { label: "Splošno",          color: "bg-white/10 text-white/50" },
  technical:  { label: "Tehnična analiza", color: "bg-[#00ff88]/20 text-[#00ff88]" },
  psychology: { label: "Psihologija",      color: "bg-purple-500/20 text-purple-400" },
  risk:       { label: "Risk management",  color: "bg-red-500/20 text-red-400" },
  crypto:     { label: "Kripto",           color: "bg-orange-500/20 text-orange-400" },
  stocks:     { label: "Delnice",          color: "bg-blue-500/20 text-blue-400" },
  forex:      { label: "Forex",            color: "bg-pink-500/20 text-pink-400" },
};

const DIFFICULTY: Record<string, { label: string; color: string }> = {
  beginner:     { label: "Začetnik",  color: "text-green-400" },
  intermediate: { label: "Vmesni",    color: "text-yellow-400" },
  advanced:     { label: "Napredno", color: "text-red-400" },
};

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("education")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", article.user_id)
    .single();

  const authorName = profile?.username ? `@${profile.username}` : (profile?.full_name ?? "Neznani trader");
  const cat = CATEGORIES[article.category] ?? CATEGORIES.general;
  const diff = DIFFICULTY[article.difficulty] ?? DIFFICULTY.beginner;
  const pubDate = new Date(article.created_at).toLocaleDateString("sl-SI", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/education" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <span className="text-white/40 text-sm">Izobraževanje</span>
      </div>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
          <span className={`text-xs font-medium ${diff.color}`}>{diff.label}</span>
          <span className="flex items-center gap-1 text-white/30 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {article.read_time} min branja
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{article.title}</h1>
        <p className="text-white/30 text-xs">{authorName} · {pubDate}</p>
      </div>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{article.content}</p>
      </div>
    </div>
  );
}
