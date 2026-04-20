import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin",             label: "Statistike",  icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  { href: "/admin/users",       label: "Uporabniki", icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm10 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" },
  { href: "/admin/forum",       label: "Forum",      icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { href: "/admin/strategies",  label: "Strategije", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-[#060d13] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-[#1a2e1a] flex flex-col">
        <div className="px-5 py-5 border-b border-[#1a2e1a]">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-[#00ff88]/10 text-[#00ff88] text-xs font-bold rounded tracking-widest uppercase">Admin</span>
          </div>
          <p className="text-white/30 text-xs truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors text-sm group">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-2 py-4 border-t border-[#1a2e1a]">
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Nazaj na dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
