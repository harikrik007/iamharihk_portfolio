"use client";

import { useRef, useState } from "react";

// Copies the address and confirms with a toast that screen readers announce.
export function CopyEmail({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setMessage("Copied ✓");
    } catch {
      setMessage(`Couldn't copy. It's ${email}`);
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(""), 2200);
  };

  return (
    <>
      <button type="button" onClick={copy} className="btn btn-ghost" aria-label={`Copy ${email}`}>
        Copy email
      </button>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-cyan/40 bg-ink/90 px-4 py-2 font-mono text-xs tracking-[0.08em] text-cyan backdrop-blur-md transition-opacity duration-200 ${
          message ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </div>
    </>
  );
}
