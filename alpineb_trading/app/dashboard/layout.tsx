import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "Trader";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#060d13] text-white flex flex-col">
      {/* Topbar */}
      <nav className="border-b border-[#1a2e1a] px-6 py-3 flex items-center justify-between sticky top-0 z-20 bg-[#060d13]/95 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#00ff88] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">A</span>
          </div>
          <span className="font-bold text-white text-sm tracking-widest uppercase hidden sm:block">
            ALPINEB
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span className="hidden sm:block">Pregled</span>
          </Link>
        </div>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center">
              <span className="text-[#00ff88] text-xs font-bold">{initials}</span>
            </div>
            <span className="text-white/70 text-sm hidden sm:block">{displayName}</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="border border-[#1a2e1a] text-white/40 hover:text-white hover:border-[#00ff88]/30 px-3 py-1.5 rounded text-xs tracking-widest uppercase transition-colors"
            >
              Odjava
            </button>
          </form>
        </div>
      </nav>

      {/* Sidebar + content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-[#1a2e1a] px-3 py-6 gap-1">
          <NavItem href="/dashboard" icon="grid" label="Pregled" />
          <NavItem href="/dashboard/profile" icon="user" label="Moj Profil" />
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: "grid" | "user";
  label: string;
}) {
  const icons = {
    grid: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
    user: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm transition-colors"
    >
      {icons[icon]}
      {label}
    </Link>
  );
}
