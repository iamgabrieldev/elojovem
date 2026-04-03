"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/features/mentor/chat-bubble";
import { ChatInput } from "@/components/features/mentor/chat-input";

type Role = "user" | "assistant";

export interface MentorMessage {
  id: string;
  role: Role;
  content: string;
}

interface MentorChatProps {
  initialMessages: MentorMessage[];
}

function createTempId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}`;
}

export function MentorChat({ initialMessages }: MentorChatProps) {
  const [messages, setMessages] = useState<MentorMessage[]>(initialMessages);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(text: string) {
    const userMsgId = createTempId("user");
    const assistantMsgId = createTempId("assistant");

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: text },
      { id: assistantMsgId, role: "assistant", content: "" },
    ]);
    setStreamingId(assistantMsgId);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) {
        const errorData = await res.json().catch(() => null);
        const errorText =
          errorData?.error ||
          `Erro ${res.status}. Tente novamente em instantes.`;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: errorText } : m
          )
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }

      reader.releaseLock();
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  m.content ||
                  "Erro de conexão. Verifique sua internet e tente novamente.",
              }
            : m
        )
      );
    } finally {
      setStreamingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      <div className="flex flex-col gap-3">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            isStreaming={msg.id === streamingId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={streamingId !== null} />
    </div>
  );
}
