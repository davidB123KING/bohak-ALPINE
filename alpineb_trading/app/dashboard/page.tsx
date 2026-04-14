import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, bio")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "Trader";

  return (
    <div className="px-6 py-8 max-w-4xl mx-auto">
      {/* Pozdrav */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Zdravo, <span className="text-[#00ff88]">{displayName}</span> 👋
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {profile?.username ? `@${profile.username}` : "Nastavi svoj profil"}
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Objave" value="0" icon="post" />
        <StatCard label="Sledilci" value="0" icon="users" />
        <StatCard label="Strategije" value="0" icon="chart" />
      </div>

      {/* CTA — dopolni profil */}
      {!profile?.username && (
        <div className="bg-[#0a1520] border border-[#00ff88]/20 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white font-medium text-sm">Dopolni svoj profil</p>
            <p className="text-white/40 text-xs mt-0.5">Dodaj username, bio in spletno stran</p>
          </div>
          <Link
            href="/dashboard/profile"
            className="bg-[#00ff88] text-black font-bold px-4 py-2 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors whitespace-nowrap"
          >
            Uredi Profil
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: "post" | "users" | "chart";
}) {
  const icons = {
    post: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    users: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    chart: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  };

  return (
    <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5 flex items-center gap-4">
      <div className="w-10 h-10 bg-[#00ff88]/10 rounded-lg flex items-center justify-center shrink-0">
        {icons[icon]}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-white/40 text-xs tracking-widest uppercase">{label}</div>
      </div>
    </div>
  );
}
