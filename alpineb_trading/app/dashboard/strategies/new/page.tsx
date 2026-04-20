"use client";

import { useActionState, useState, useCallback } from "react";
import Link from "next/link";
import { createStrategy } from "@/app/actions/strategies";
import type { StrategyState } from "@/app/actions/strategies";
import { createClient } from "@/lib/supabase/client";

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

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

type UploadedImage = { url: string; preview: string };

export default function NewStrategyPage() {
  const [state, formAction, pending] = useActionState(createStrategy, initialState);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) return;

    const toUpload = Array.from(fileList).slice(0, remaining);
    setUploadError(null);

    for (const file of toUpload) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Dovoljene so samo slike (JPG, PNG, WebP, GIF).");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("Vsaka slika mora biti manjša od 5 MB.");
        return;
      }
    }

    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploadError("Nisi prijavljen."); setUploading(false); return; }

    const uploaded: UploadedImage[] = [];
    for (const file of toUpload) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("strategy-images")
        .upload(path, file, { contentType: file.type });

      if (error) {
        setUploadError(`Napaka pri nalaganju: ${error.message}`);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("strategy-images")
        .getPublicUrl(path);

      uploaded.push({ url: publicUrl, preview: URL.createObjectURL(file) });
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function removeImage(index: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true); }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

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
        {(state.error || uploadError) && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {state.error ?? uploadError}
          </div>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          {/* Hidden URL inputs — server action reads these */}
          {images.map((img, i) => (
            <input key={i} type="hidden" name="images" value={img.url} />
          ))}

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

          {/* TradingView simbol */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              TradingView simbol
              <span className="text-white/30 normal-case tracking-normal text-xs ml-1">(neobvezno)</span>
            </label>
            <input
              name="tv_symbol" type="text"
              placeholder="Npr. BTCUSDT, AAPL, EURUSD, BINANCE:ETHUSDT"
              className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
            />
            <p className="text-white/25 text-xs mt-1.5">
              Vpiši simbol točno kot na TradingView (npr. <span className="text-white/40">BTCUSDT</span> ali <span className="text-white/40">NASDAQ:AAPL</span>)
            </p>
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

          {/* Slike */}
          <div>
            <label className="text-white/50 text-xs tracking-widest uppercase mb-2 block">
              Slike
              <span className="text-white/30 normal-case tracking-normal text-xs ml-1">
                (neobvezno · največ 5 · max 5 MB vsaka)
              </span>
            </label>

            {images.length < MAX_IMAGES && (
              <label
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg px-4 py-6 cursor-pointer transition-colors ${
                  dragging
                    ? "border-[#00ff88]/70 bg-[#00ff88]/5"
                    : uploading
                    ? "border-[#1a2e1a] bg-[#060d13] opacity-60 pointer-events-none"
                    : "border-[#1a2e1a] hover:border-[#00ff88]/30 bg-[#060d13]"
                }`}
              >
                {uploading ? (
                  <svg className="animate-spin text-[#00ff88]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <path d="M21 15l-5-5L5 21"/>
                  </svg>
                )}
                <p className="text-white/40 text-sm">
                  {uploading ? "Nalagam..." : <>Povleci slike sem ali <span className="text-[#00ff88]">izberi datoteke</span></>}
                </p>
                <p className="text-white/20 text-xs">{images.length}/{MAX_IMAGES} slik</p>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => uploadFiles(e.target.files)}
                />
              </label>
            )}

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-[#1a2e1a]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Link href="/dashboard/strategies"
              className="flex-1 text-center border border-[#1a2e1a] text-white/50 hover:text-white py-3 rounded-lg text-sm transition-colors">
              Prekliči
            </Link>
            <button type="submit" disabled={pending || uploading}
              className="flex-1 bg-[#00ff88] text-black font-bold py-3 rounded-lg text-sm tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50">
              {pending ? "Shranjujem..." : "Objavi Strategijo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
