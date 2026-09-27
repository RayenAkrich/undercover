"use client";

import { useState } from "react";

const COMMAND = "npm install @undercover/sdk";

export default function CopyCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
    } catch {
      // Clipboard unavailable (permissions) — still show feedback.
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy command"
      className="text-text-dim transition-colors hover:text-text-light"
    >
      <span className="material-symbols-outlined text-[18px]">
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}
