import { createClient } from "@/lib/supabase/server";
import { adminDeleteStrategy } from "@/app/actions/admin";
import DeleteButton from "@/app/admin/DeleteButton";

const CATEGORIES: Record<string, string> = {
  scalping: "Scalping", daytrading: "Day trading", swing: "Swing",
  positional: "Pozicijsko", algorithmic: "Algoritmično", other: "Drugo",
};

const ASSETS: Record<string, string> = {
  general: "Splošno", crypto: "Kripto", stocks: "Delnice",
  forex: "Forex", options: "Opcije", futures: "Terminke",
};

export default async function AdminStrategiesPage() {
  const supabase = await createClient();

  const { data: strategies } = await supabase
    .from("strategies")
    .select("id, title, category, asset_class, created_at, user_id")
    .order("created_at", { ascending: false });

  const userIds = [...new Set((strategies ?? []).map((s) => s.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, username, full_name").in("id", userIds)
    : { data: [] };

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="px-8 py-8">
      <h1 className="text-xl font-bold text-white mb-1">Strategije</h1>
      <p className="text-white/30 text-sm mb-8">{strategies?.length ?? 0} strategij skupaj</p>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a2e1a]">
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium">Naslov</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden md:table-cell">Avtor</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden sm:table-cell">Tip</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden lg:table-cell">Trg</th>
              <th className="text-left px-5 py-3 text-white/30 text-xs uppercase tracking-widest font-medium hidden lg:table-cell">Datum</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(strategies ?? []).map((s) => {
              const profile = profileMap[s.user_id];
              const author = profile?.username ? `@${profile.username}` : (profile?.full_name ?? "—");
              const deleteAction = adminDeleteStrategy.bind(null, s.id);
              return (
                <tr key={s.id} className="border-b border-[#1a2e1a] last:border-0 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-white/90 text-sm truncate max-w-[180px] lg:max-w-[280px]">{s.title}</p>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs hidden md:table-cell">{author}</td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded">
                      {CATEGORIES[s.category] ?? s.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded">
                      {ASSETS[s.asset_class] ?? s.asset_class}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs hidden lg:table-cell">
                    {new Date(s.created_at).toLocaleDateString("sl-SI")}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DeleteButton action={deleteAction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(strategies ?? []).length === 0 && (
          <p className="text-white/20 text-sm text-center py-10">Ni strategij.</p>
        )}
      </div>
    </div>
  );
}
