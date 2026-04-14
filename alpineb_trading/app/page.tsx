"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const tickerItems = [
  { symbol: "BTC/USD", price: "67,834.50", change: "+2.4%", positive: true },
  { symbol: "ETH/USD", price: "3,512.80", change: "+1.8%", positive: true },
  { symbol: "SPX", price: "5,248.30", change: "+0.6%", positive: true },
  { symbol: "AAPL", price: "192.45", change: "+1.2%", positive: true },
  { symbol: "TSLA", price: "268.50", change: "-0.8%", positive: false },
  { symbol: "GOLD", price: "2,345.60", change: "+0.3%", positive: true },
  { symbol: "EUR/USD", price: "1.0842", change: "-0.2%", positive: false },
  { symbol: "NVDA", price: "875.20", change: "+3.1%", positive: true },
  { symbol: "OIL", price: "78.45", change: "-1.1%", positive: false },
  { symbol: "BNB/USD", price: "412.30", change: "+0.9%", positive: true },
  { symbol: "SOL/USD", price: "148.60", change: "+5.2%", positive: true },
  { symbol: "AMZN", price: "184.20", change: "+0.7%", positive: true },
];

function TickerItem({ item }: { item: (typeof tickerItems)[number] }) {
  return (
    <span className="inline-flex items-center gap-2 px-6 text-sm font-medium whitespace-nowrap">
      <span className="text-white/70">{item.symbol}</span>
      <span className="text-white">{item.price}</span>
      <span className={item.positive ? "text-[#00ff88]" : "text-red-400"}>
        {item.change}
      </span>
    </span>
  );
}

export default function Home() {
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name ?? user.email ?? "Trader";
        const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
        setUser({ name, initials });
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#060d13] text-white flex flex-col relative overflow-hidden">

      {/* Background candlestick chart SVG */}
      <div className="absolute inset-0 opacity-15 pointer-events-none select-none">
        <svg
          viewBox="0 0 1440 800"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Grid lines */}
          {[100, 200, 300, 400, 500, 600, 700].map((y) => (
            <line key={y} x1="0" y1={y} x2="1440" y2={y} stroke="#1a3a2a" strokeWidth="1" />
          ))}
          {[0, 120, 240, 360, 480, 600, 720, 840, 960, 1080, 1200, 1320, 1440].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="800" stroke="#1a3a2a" strokeWidth="1" />
          ))}
          {/* Candlesticks */}
          {[
            { x: 80,  lo: 580, hi: 300, open: 520, close: 360 },
            { x: 160, lo: 340, hi: 180, open: 340, close: 200 },
            { x: 240, lo: 210, hi: 120, open: 210, close: 140 },
            { x: 320, lo: 150, hi: 80,  open: 150, close: 100 },
            { x: 400, lo: 110, hi: 200, open: 120, close: 200 },
            { x: 480, lo: 180, hi: 300, open: 190, close: 290 },
            { x: 560, lo: 260, hi: 160, open: 260, close: 180 },
            { x: 640, lo: 170, hi: 90,  open: 170, close: 105 },
            { x: 720, lo: 100, hi: 210, open: 110, close: 200 },
            { x: 800, lo: 190, hi: 290, open: 200, close: 270 },
            { x: 880, lo: 260, hi: 160, open: 260, close: 180 },
            { x: 960, lo: 170, hi: 90,  open: 168, close: 100 },
            { x: 1040, lo: 95, hi: 200, open: 100, close: 185 },
            { x: 1120, lo: 180, hi: 80, open: 180, close: 90  },
            { x: 1200, lo: 85,  hi: 180, open: 90, close: 165 },
            { x: 1280, lo: 155, hi: 55,  open: 155, close: 70  },
            { x: 1360, lo: 60,  hi: 150, open: 65, close: 140  },
          ].map((c, i) => {
            const bullish = c.close < c.open;
            const color = bullish ? "#00ff88" : "#ff4444";
            const bodyTop = Math.min(c.open, c.close);
            const bodyH = Math.abs(c.open - c.close);
            return (
              <g key={i}>
                <line x1={c.x} y1={c.lo} x2={c.x} y2={c.hi} stroke={color} strokeWidth="2" />
                <rect x={c.x - 10} y={bodyTop} width={20} height={Math.max(bodyH, 2)} fill={color} />
              </g>
            );
          })}
          {/* Trend line */}
          <polyline
            points="80,450 160,290 240,200 320,150 400,190 480,290 560,230 640,155 720,190 800,270 880,220 960,145 1040,185 1120,110 1200,155 1280,90 1360,130"
            fill="none"
            stroke="#00ff88"
            strokeWidth="1.5"
            strokeDasharray="6 3"
            opacity="0.5"
          />
        </svg>
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d13]/60 via-transparent to-[#060d13]/80" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#00ff88] rounded-sm flex items-center justify-center">
            <span className="text-black font-black text-xs leading-none">A</span>
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-widest uppercase">ALPINEB</span>
            <div className="text-[#00ff88] text-[8px] tracking-[0.3em] uppercase">Pro Traders League</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <Link href="/forum" className="hover:text-white transition-colors">Forum</Link>
          <a href="#" className="hover:text-white transition-colors">Strategies</a>
          <a href="#" className="hover:text-white transition-colors">Education</a>
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            <span>Resources</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {user ? (
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
              <span className="text-[#00ff88] text-xs font-bold">{user.initials}</span>
            </div>
            <span className="text-white/70 text-sm hidden sm:block">{user.name}</span>
          </Link>
        ) : (
          <Link
            href="/auth/register"
            className="border border-[#00ff88] text-[#00ff88] px-5 py-2 rounded text-sm font-semibold hover:bg-[#00ff88] hover:text-black transition-all duration-200"
          >
            Sign Up
          </Link>
        )}
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-8 pb-24">
        <p className="text-white/50 text-xs tracking-[0.4em] uppercase mb-4">
          Welcome to the Tradjimo
        </p>

        <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-6 glow-text">
          ALPINEB TRADING
        </h1>

        <p className="text-white/70 text-lg mb-10">
          Join the{" "}
          <span className="text-[#00ff88] font-bold">#1 Trading Forum</span>{" "}
          &amp; Community
        </p>

        <div className="flex items-center gap-4 mb-20">
          <button className="bg-[#00ff88] text-black font-bold px-8 py-3 rounded text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors shadow-[0_0_20px_#00ff8844]">
            Join the Community
          </button>
          <button className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
            Learn More
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-16">
          <div className="text-center">
            <div className="text-3xl font-black text-white">50K+</div>
            <div className="text-white/40 text-xs tracking-widest uppercase mt-1">Members</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl font-black text-white">1.2K</div>
            <div className="text-white/40 text-xs tracking-widest uppercase mt-1">Daily Posts</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl font-black text-white">98%</div>
            <div className="text-white/40 text-xs tracking-widest uppercase mt-1">Satisfaction</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 opacity-30">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white/50 animate-pulse" />
        </div>
      </main>

      {/* Ticker tape */}
      <div className="relative z-10 bg-[#070f17] border-t border-[#1a2e1a] py-2 overflow-hidden">
        <div className="ticker-track flex">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <TickerItem key={i} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
