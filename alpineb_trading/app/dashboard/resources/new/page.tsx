"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createResource } from "@/app/actions/resources";
import type { ResourceState } from "@/app/actions/resources";

const initialState: ResourceState = {};

const CATEGORIES = [
  { value: "broker",     label: "🏦 Broker" },
  { value: "tool",       label: "🔧 Orodje" },
  { value: "calculator", label: "🧮 Kalkulator" },
  { value: "news",       label: "📰 Novice" },
  { value: "chart",      label: "📈 Graf / analiza" },
  { value: "education",  label: "📚 Izobraževanje" },
  { value: "other",      label: "🔗 Drugo" },
];

export default function NewResourcePage() {
  const [state, formAction, pending] = useActionState(createResource, initialState);

  return (
    <div className="px-6 py-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/resources" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">Dodaj vir</h1>
      </div>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
        {state.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="mb-4 px-4 py-3 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-sm">
            {state.success}{" "}
            <Link href="/dashboard/resources" className="underline font-medium">Nazaj na vire</Link>
          </div>
        )}

        {!state.success && (
          <form action={formAction} className="flex flex-col gap-5">
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                Ime vira <span className="text-[#00ff88]">*</span>
              </label>
              <input name="title" type="text" required
                placeholder="Npr. TradingView, Binance, Investopedia..."
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Kategorija</label>
              <select name="category" defaultValue="tool"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                URL <span className="text-[#00ff88]">*</span>
              </label>
              <input name="url" type="url" required
                placeholder="https://..."
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                Kratek opis <span className="text-[#00ff88]">*</span>
              </label>
              <textarea name="description" required rows={3}
                placeholder="Zakaj je ta vir koristen? Kaj ponuja?"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard/resources"
                className="flex-1 text-center border border-[#1a2e1a] text-white/50 hover:text-white py-3 rounded-lg text-sm transition-colors">
                Prekliči
              </Link>
              <button type="submit" disabled={pending}
                className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50">
                {pending ? "Dodajam..." : "Dodaj Vir"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
