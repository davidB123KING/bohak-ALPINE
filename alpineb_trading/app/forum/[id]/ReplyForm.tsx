"use client";

import { useActionState, useRef, useEffect } from "react";
import { createReply } from "@/app/actions/forum";
import type { ForumState } from "@/app/actions/forum";

const initialState: ForumState = {};

export default function ReplyForm({ postId }: { postId: string }) {
  const [state, formAction, pending] = useActionState(createReply, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Počisti formo po uspešnem odgovoru
  useEffect(() => {
    if (!state.error && !pending && formRef.current) {
      formRef.current.reset();
    }
  }, [state, pending]);

  return (
    <div className="bg-[#0a1520] border border-[#1a2e1a] rounded-xl p-5">
      <h3 className="text-white/60 text-xs tracking-widest uppercase mb-4">Tvoj odgovor</h3>

      {state.error && (
        <div className="mb-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <input type="hidden" name="post_id" value={postId} />
        <textarea
          name="content"
          placeholder="Napiši odgovor..."
          required
          rows={4}
          className="w-full bg-[#060d13] border border-[#1a2e1a] rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none mb-3"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-[#00ff88] text-black font-bold px-6 py-2.5 rounded-lg text-xs tracking-widest uppercase hover:bg-[#00e87a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Pošiljam..." : "Odgovori"}
        </button>
      </form>
    </div>
  );
}
