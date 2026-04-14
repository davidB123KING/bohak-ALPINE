import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ReplyForm from "./ReplyForm";

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

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center shrink-0">
      <span className="text-[#00ff88] text-xs font-bold">{initials}</span>
    </div>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch post
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id, title, content, category, created_at, user_id")
    .eq("id", id)
    .single();

  if (postError || !post) notFound();

  // Fetch author profile separately (avoid FK join issues)
  const { data: authorProfile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", post.user_id)
    .maybeSingle();

  // Fetch replies
  const { data: replies } = await supabase
    .from("replies")
    .select("id, content, created_at, user_id")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  // Fetch reply authors
  const replyUserIds = [...new Set((replies ?? []).map((r) => r.user_id))];
  const { data: replyProfiles } = replyUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", replyUserIds)
    : { data: [] };

  const profileMap = Object.fromEntries((replyProfiles ?? []).map((p) => [p.id, p]));

  const cat = CATEGORIES[post.category] ?? CATEGORIES.general;
  const authorName = authorProfile?.full_name ?? "Neznani trader";

  return (
    <div className="min-h-screen bg-[#060d13] text-white">
      {/* Navbar */}
      <nav className="border-b border-[#1a2e1a] px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto">
        <Link href="/forum" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <Link href="/forum" className="text-white/40 hover:text-white text-sm transition-colors">Forum</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Post */}
        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>
              {cat.label}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
          <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[#1a2e1a]">
            <Avatar name={authorName} />
            <div>
              <p className="text-white text-sm font-medium">{authorName}</p>
              <p className="text-white/30 text-xs">{timeAgo(post.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <h2 className="text-white/60 text-xs tracking-widest uppercase mb-4">
          {replies?.length ?? 0} {replies?.length === 1 ? "Odgovor" : "Odgovori"}
        </h2>

        {replies && replies.length > 0 && (
          <div className="flex flex-col gap-3 mb-6">
            {replies.map((reply) => {
              const rp = profileMap[reply.user_id];
              const rpName = rp?.full_name ?? "Neznani trader";
              return (
                <div key={reply.id} className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar name={rpName} />
                    <div>
                      <p className="text-white text-sm font-medium">{rpName}</p>
                      <p className="text-white/30 text-xs">{timeAgo(reply.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Reply form */}
        {user ? (
          <ReplyForm postId={id} />
        ) : (
          <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5 text-center">
            <p className="text-white/40 text-sm mb-3">Prijavi se za odgovor</p>
            <Link
              href="/auth/login"
              className="inline-block bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors"
            >
              Prijava
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
