import { createClient } from "@/lib/supabase/server";
import { adminDeleteProfile } from "@/app/actions/admin";
import DeleteButton from "@/app/admin/DeleteButton";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="px-8 py-8">
      <h1 className="text-xl font-bold text-white mb-1">Uporabniki</h1>
      <p className="text-white/30 text-sm mb-8">{users?.length ?? 0} registriranih uporabnikov</p>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2e1a]">
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium">Uporabnik</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">Datum</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium">Vloga</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u) => {
              const deleteAction = adminDeleteProfile.bind(null, u.id);
              return (
                <tr key={u.id} className="border-b border-[#1a2e1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1a2e1a] flex items-center justify-center overflow-hidden shrink-0">
                        {u.avatar_url
                          ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                          : <span className="text-[#00ff88] text-xs font-bold">{(u.username ?? u.full_name ?? "?")[0].toUpperCase()}</span>
                        }
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{u.full_name ?? "—"}</p>
                        <p className="text-white/30 text-xs">{u.username ? `@${u.username}` : "brez usernamea"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs hidden sm:table-cell">
                    {new Date(u.created_at).toLocaleDateString("sl-SI")}
                  </td>
                  <td className="px-5 py-4">
                    {u.is_admin
                      ? <span className="px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] text-xs rounded font-bold">Admin</span>
                      : <span className="text-white/25 text-xs">Uporabnik</span>
                    }
                  </td>
                  <td className="px-5 py-4 text-right">
                    {!u.is_admin && (
                      <DeleteButton action={deleteAction} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(users ?? []).length === 0 && (
          <p className="text-white/20 text-sm text-center py-10">Ni uporabnikov.</p>
        )}
      </div>
    </div>
  );
}
