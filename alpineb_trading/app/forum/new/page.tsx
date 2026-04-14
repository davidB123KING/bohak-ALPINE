"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createPost } from "@/app/actions/forum";
import type { ForumState } from "@/app/actions/forum";

const initialState: ForumState = {};

const CATEGORIES = [
  { value: "general",   label: "Splošno" },
  { value: "crypto",    label: "Kripto" },
  { value: "stocks",    label: "Delnice" },
  { value: "forex",     label: "Forex" },
  { value: "options",   label: "Opcije" },
  { value: "technical", label: "Tehnična analiza" },
];

export default function NewPostPage() {
  const [state, formAction, pending] = useActionState(createPost, initialState);

  return (
    <div className="min-h-screen bg-[#060d13] text-white">
      <nav className="border-b border-[#1a2e1a] px-6 py-4 flex items-center gap-4 max-w-3xl mx-auto">
        <Link href="/forum" className="text-white/40 hover:text-white transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        <span className="text-white/60 text-sm">Novo vprašanje</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Postavi vprašanje</h1>

        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-6">
          {state.error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-5">
            {/* Kategorija */}
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                Kategorija
              </label>
              <select
                name="category"
                defaultValue="general"
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Naslov */}
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                Naslov <span className="text-[#00ff88]">*</span>
              </label>
              <input
                name="title"
                type="text"
                placeholder="Npr. Kako analizirate BTC support levels?"
                required
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            {/* Vsebina */}
            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
                Vsebina <span className="text-[#00ff88]">*</span>
              </label>
              <textarea
                name="content"
                placeholder="Opiši vprašanje čim bolj podrobno..."
                required
                rows={8}
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/forum"
                className="flex-1 text-center border border-[#1a2e1a] text-white/50 hover:text-white py-3 rounded-lg text-sm transition-colors"
              >
                Prekliči
              </Link>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending ? "Objavljam..." : "Objavi"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
