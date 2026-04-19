"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createStrategy } from "@/app/actions/strategies";
import type { StrategyState } from "@/app/actions/strategies";

const initialState: StrategyState = {};

const CATEGORIES = [
  { value: "scalping",    label: "Scalping" },
  { value: "daytrading",  label: "Day trading" },
  { value: "swing",       label: "Swing trading" },
  { value: "positional",  label: "Pozicijsko" },
  { value: "algorithmic", label: "Algoritmično" },
  { value: "other",       label: "Drugo" },
];

const ASSETS = [
  { value: "general", label: "Splošno" },
  { value: "crypto",  label: "Kripto" },
  { value: "stocks",  label: "Delnice" },
  { value: "forex",   label: "Forex" },
  { value: "options", label: "Opcije" },
  { value: "futures", label: "Terminke" },
];

const TIMEFRAMES = [
  { value: "1m", label: "1 minuta" },
  { value: "5m", label: "5 minut" },
  { value: "15m", label: "15 minut" },
  { value: "30m", label: "30 minut" },
  { value: "1h", label: "1 ura" },
  { value: "4h", label: "4 ure" },
  { value: "1d", label: "Dnevni" },
  { value: "1w", label: "Tedenski" },
];

export default function NewStrategyPage() {
  const [state, formAction, pending] = useActionState(createStrategy, initialState);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/strategies" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">Nova strategija</h1>
      </div>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
        {state.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          {/* Naslov */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Ime strategije <span className="text-[#00ff88]">*</span>
            </label>
            <input
              name="title" type="text" required
              placeholder="Npr. BTC Breakout Swing Strategy"
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          {/* Vrsta / asset / timeframe */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Tip</label>
              <select name="category" defaultValue="swing"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Trg</label>
              <select name="asset_class" defaultValue="general"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {ASSETS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Timeframe</label>
              <select name="timeframe" defaultValue="1d"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {TIMEFRAMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Opis */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Kratek opis <span className="text-[#00ff88]">*</span>
            </label>
            <textarea name="description" required rows={3}
              placeholder="Na kratko opiši strategijo, kdaj jo uporabljaš in zakaj deluje..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          {/* Entry */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Vstopna pravila</label>
            <textarea name="entry_rules" rows={3}
              placeholder="Npr. Čakam na breakout nad prejšnji high z volumnom 2x povprečjem..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          {/* Exit */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Izstopna pravila</label>
            <textarea name="exit_rules" rows={3}
              placeholder="Npr. Stop loss pod breakout candle, take profit na 2R ali ob zaprtju pod EMA..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          {/* Risk */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Risk management</label>
            <textarea name="risk_mgmt" rows={2}
              placeholder="Npr. Max 1% portfelja na trade, RR vsaj 1:2..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/strategies"
              className="flex-1 text-center border border-[#1a2e1a] text-white/50 hover:text-white py-3 rounded-lg text-sm transition-colors">
              Prekliči
            </Link>
            <button type="submit" disabled={pending}
              className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50">
              {pending ? "Shranjujem..." : "Objavi Strategijo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
