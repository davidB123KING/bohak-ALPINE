import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StrategyImages from "./StrategyImages";
import TradingViewChart from "./TradingViewChart";

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
  "1m":"1min","5m":"5min","15m":"15min","30m":"30min",
  "1h":"1h","4h":"4h","1d":"Dnevni","1w":"Tedenski",
};

export default async function StrategyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: strategy } = await supabase
    .from("strategies")
    .select("*")
    .eq("id", id)
    .single();

  if (!strategy) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username")
    .eq("id", strategy.user_id)
    .single();

  const authorName = profile?.username ? `@${profile.username}` : (profile?.full_name ?? "Neznani trader");
  const cat = CATEGORIES[strategy.category] ?? CATEGORIES.other;
  const joinDate = new Date(strategy.created_at).toLocaleDateString("sl-SI", { year: "numeric", month: "long", day: "numeric" });

  function Section({ title, content }: { title: string; content: string | null }) {
    if (!content) return null;
    return (
      <div className="bg-[#060d13] border border-[#1a2e1a] rounded-xl p-5">
        <h3 className="text-white/50 text-xs tracking-widest uppercase mb-3">{title}</h3>
        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/strategies" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <span className="text-white/40 text-sm">Strategije</span>
      </div>

      {/* Header */}
      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.color}`}>{cat.label}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">{ASSETS[strategy.asset_class] ?? strategy.asset_class}</span>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-white/40">{TIMEFRAMES[strategy.timeframe] ?? strategy.timeframe}</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">{strategy.title}</h1>
        <p className="text-white/60 text-sm leading-relaxed">{strategy.description}</p>
        <p className="text-white/30 text-xs mt-4">{authorName} · {joinDate}</p>
      </div>

      {/* TradingView graf */}
      <div className="mb-4">
        <TradingViewChart assetClass={strategy.asset_class} timeframe={strategy.timeframe} tvSymbol={strategy.tv_symbol} />
      </div>

      <div className="flex flex-col gap-3">
        <StrategyImages images={strategy.images ?? []} />
        <Section title="Vstopna pravila" content={strategy.entry_rules} />
        <Section title="Izstopna pravila" content={strategy.exit_rules} />
        <Section title="Risk Management" content={strategy.risk_mgmt} />
      </div>

      {user && strategy.user_id === user.id && (
        <p className="text-white/20 text-xs text-center mt-6">To je vaša strategija</p>
      )}
    </div>
  );
}
