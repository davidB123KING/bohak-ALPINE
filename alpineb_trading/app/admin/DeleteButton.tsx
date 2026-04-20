"use client";

import { useState, useTransition } from "react";

export default function DeleteButton({ action, label = "Izbriši" }: { action: () => Promise<void>; label?: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="px-3 py-1.5 text-xs text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => startTransition(async () => { await action(); setConfirm(false); })}
        disabled={pending}
        className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
      >
        {pending ? "..." : "Potrdi"}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="px-3 py-1.5 text-xs text-white/30 hover:text-white transition-colors"
      >
        Ne
      </button>
    </div>
  );
}
