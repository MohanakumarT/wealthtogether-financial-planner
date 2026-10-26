"use client";

import { useCallback, useState } from "react";

export type FinancialAssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantRequest = {
  context: string;
  messages: FinancialAssistantMessage[];
};

export function useFinancialAssistant(getContext: () => string | null) {
  const [messages, setMessages] = useState<FinancialAssistantMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (rawMessage: string) => {
      const content = rawMessage.trim();
      if (!content || pending) return false;

      const context = getContext();
      if (!context) {
        setError("Check your calculator inputs, then ask me again.");
        return false;
      }

      const userMessage: FinancialAssistantMessage = {
        role: "user",
        content,
      };
      const nextMessages = [...messages, userMessage].slice(-10);
      setMessages(nextMessages);
      setPending(true);
      setError(null);

      const request: AssistantRequest = {
        context,
        messages: nextMessages,
      };

      try {
        const response = await fetch("/api/financial-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        const body = (await response.json()) as {
          answer?: unknown;
          error?: unknown;
        };

        if (!response.ok || typeof body.answer !== "string") {
          setError(
            typeof body.error === "string"
              ? body.error
              : "I couldn’t answer just now. Please try again.",
          );
          return false;
        }

        setMessages((current) => [
          ...current.slice(-9),
          { role: "assistant", content: body.answer as string },
        ]);
        return true;
      } catch {
        setError("I couldn’t connect just now. Please try again.");
        return false;
      } finally {
        setPending(false);
      }
    },
    [getContext, messages, pending],
  );

  const clear = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, pending, error, send, clear };
}
