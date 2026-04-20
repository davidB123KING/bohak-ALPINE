"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    TradingView: { widget: new (config: Record<string, unknown>) => void };
  }
}

const DEFAULT_SYMBOLS: Record<string, string> = {
  general: "NASDAQ:SPY",
  crypto:  "BINANCE:BTCUSDT",
  stocks:  "NASDAQ:AAPL",
  forex:   "FX:EURUSD",
  options: "CBOE:SPX",
  futures: "CME:ES1!",
};

const TV_INTERVALS: Record<string, string> = {
  "1m": "1", "5m": "5", "15m": "15", "30m": "30",
  "1h": "60", "4h": "240", "1d": "D", "1w": "W",
};

export default function TradingViewChart({
  assetClass,
  timeframe,
  tvSymbol,
}: {
  assetClass: string;
  timeframe: string;
  tvSymbol?: string | null;
}) {
  const containerId = useRef(`tv_${Math.random().toString(36).slice(2, 9)}`);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = containerId.current;
    const symbol = tvSymbol || DEFAULT_SYMBOLS[assetClass] || "NASDAQ:SPY";
    const interval = TV_INTERVALS[timeframe] ?? "D";

    function init() {
      if (!window.TradingView || !document.getElementById(id)) return;
      new window.TradingView.widget({
        container_id:        id,
        autosize:            true,
        symbol,
        interval,
        timezone:            "Europe/Ljubljana",
        theme:               "dark",
        style:               "1",
        locale:              "sl",
        backgroundColor:     "#060d13",
        gridColor:           "rgba(0,255,136,0.04)",
        toolbar_bg:          "#0a1520",
        enable_publishing:   false,
        allow_symbol_change: true,
        withdateranges:      true,
        hide_side_toolbar:   false,
        save_image:          false,
      });
    }

    if (window.TradingView) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#060d13] border border-[#1a2e1a] rounded-xl overflow-hidden">
      <div
        id={containerId.current}
        ref={containerRef}
        style={{ height: 520 }}
      />
    </div>
  );
}
