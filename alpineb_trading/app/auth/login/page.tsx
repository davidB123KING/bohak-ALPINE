"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import type { AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen bg-[#060d13] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#1a3a2a 1px, transparent 1px), linear-gradient(90deg, #1a3a2a 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00ff88]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-[#00ff88] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs">A</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-widest uppercase">ALPINEB</span>
            <div className="text-[#00ff88] text-[8px] tracking-[0.3em] uppercase">Pro Traders League</div>
          </div>
        </Link>

        {/* Card */}
        <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Prijava</h1>
          <p className="text-white/40 text-sm mb-6">Dobrodošli nazaj v skupnost</p>

          {/* Error */}
          {state.error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label className="text-white/60 text-xs tracking-widest uppercase mb-2 block">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="vas@email.com"
                required
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs tracking-widest uppercase mb-2 block">
                Geslo
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-xs text-white/40 hover:text-[#00ff88] transition-colors">
                Pozabljeno geslo?
              </Link>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_#00ff8822] mt-2"
            >
              {pending ? "Prijavljam..." : "Prijava"}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Še nimaš računa?{" "}
            <Link href="/auth/register" className="text-[#00ff88] hover:underline font-medium">
              Registracija
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
