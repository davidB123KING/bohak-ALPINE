import { createClient } from "@/lib/supabase/server";
import { adminDeletePost } from "@/app/actions/admin";
import DeleteButton from "@/app/admin/DeleteButton";

const CATEGORIES: Record<string, string> = {
  general: "Splošno", crypto: "Kripto", stocks: "Delnice",
  forex: "Forex", options: "Opcije", technical: "Teh. analiza",
};

export default async function AdminForumPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, category, created_at, user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, username, full_name").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="px-8 py-8">
      <h1 className="text-xl font-bold text-white mb-1">Forum</h1>
      <p className="text-white/30 text-sm mb-8">{posts?.length ?? 0} objav skupaj</p>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2e1a]">
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium">Naslov</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden md:table-cell">Avtor</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">Kategorija</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden lg:table-cell">Datum</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(posts ?? []).map((post) => {
              const profile = profileMap[post.user_id];
              const author = profile?.username ? `@${profile.username}` : (profile?.full_name ?? "—");
              const deleteAction = adminDeletePost.bind(null, post.id);
              return (
                <tr key={post.id} className="border-b border-[#1a2e1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white/90 text-sm truncate max-w-[200px] lg:max-w-[320px]">{post.title}</p>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs hidden md:table-cell">{author}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded">
                      {CATEGORIES[post.category] ?? post.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs hidden lg:table-cell">
                    {new Date(post.created_at).toLocaleDateString("sl-SI")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DeleteButton action={deleteAction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(posts ?? []).length === 0 && (
          <p className="text-white/20 text-sm text-center py-10">Ni objav.</p>
        )}
      </div>
    </div>
  );
}
