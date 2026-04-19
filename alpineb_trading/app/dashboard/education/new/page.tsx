"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createArticle } from "@/app/actions/education";
import type { EducationState } from "@/app/actions/education";

const initialState: EducationState = {};

const CATEGORIES = [
  { value: "general",    label: "Splošno" },
  { value: "technical",  label: "Tehnična analiza" },
  { value: "psychology", label: "Psihologija" },
  { value: "risk",       label: "Risk management" },
  { value: "crypto",     label: "Kripto" },
  { value: "stocks",     label: "Delnice" },
  { value: "forex",      label: "Forex" },
];

const DIFFICULTIES = [
  { value: "beginner",     label: "Začetnik" },
  { value: "intermediate", label: "Vmesni" },
  { value: "advanced",     label: "Napredno" },
];

export default function NewArticlePage() {
  const [state, formAction, pending] = useActionState(createArticle, initialState);

  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/education" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-white">Nov članek</h1>
      </div>

      <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
        {state.error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {state.error}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Naslov <span className="text-[#00ff88]">*</span>
            </label>
            <input name="title" type="text" required
              placeholder="Npr. Kako brati candlestick vzorce"
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Kategorija</label>
              <select name="category" defaultValue="general"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Nivo</label>
              <select name="difficulty" defaultValue="beginner"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors">
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">Čas branja (min)</label>
              <input name="read_time" type="number" defaultValue="5" min="1" max="120"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Vsebina <span className="text-[#00ff88]">*</span>
            </label>
            <textarea name="content" required rows={12}
              placeholder="Napiši članek tukaj. Razloži koncept, dodaj primere, nasvete..."
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/education"
              className="flex-1 text-center border border-[#1a2e1a] text-white/50 hover:text-white py-3 rounded-lg text-sm transition-colors">
              Prekliči
            </Link>
            <button type="submit" disabled={pending}
              className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50">
              {pending ? "Objavljam..." : "Objavi Članek"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
