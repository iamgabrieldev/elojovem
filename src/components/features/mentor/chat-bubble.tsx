"use client";

import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      <span
        className="h-2 w-2 rounded-full bg-slate-400"
        style={{ animation: "typing-dot 1.4s infinite 0ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-slate-400"
        style={{ animation: "typing-dot 1.4s infinite 200ms" }}
      />
      <span
        className="h-2 w-2 rounded-full bg-slate-400"
        style={{ animation: "typing-dot 1.4s infinite 400ms" }}
      />
    </div>
  );
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isEmpty = !content.trim();

  return (
    <div
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          role === "user"
            ? "bg-amber-600 text-white rounded-br-md"
            : "bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-md"
        )}
      >
        {role === "assistant" && isEmpty ? (
          <TypingDots />
        ) : (
          <span className="whitespace-pre-wrap">{content}</span>
        )}
        {role === "assistant" && isStreaming && !isEmpty && (
          <span className="inline-block w-1.5 h-4 bg-amber-500 ml-0.5 animate-pulse rounded-sm align-text-bottom" />
        )}
      </div>
    </div>
  );
}
