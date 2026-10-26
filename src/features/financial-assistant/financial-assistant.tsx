"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  BookOpenText,
  LoaderCircle,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFinancialAssistant } from "@/features/financial-assistant/use-financial-assistant";

type FinancialAssistantProps = {
  calculatorId: string;
  calculatorName: string;
  getContext: () => string | null;
};

function getSuggestedQuestions(calculatorId: string) {
  if (calculatorId.includes("swp")) {
    return [
      "Explain my withdrawal projection",
      "What affects how long my corpus lasts?",
      "How does inflation affect withdrawals?",
    ];
  }

  if (calculatorId.includes("inflation")) {
    return [
      "Explain purchasing power",
      "How does inflation change this amount?",
      "What assumptions should I review?",
    ];
  }

  if (/sip|retirement|education|house|marriage|goal|car/i.test(calculatorId)) {
    return [
      "Explain my main result",
      "Why is the required SIP so high?",
      "What if I increase my SIP by 10%?",
    ];
  }

  return [
    "Explain my main result",
    "What assumptions should I review?",
    "How does inflation affect this projection?",
  ];
}

export function FinancialAssistant({
  calculatorId,
  calculatorName,
  getContext,
}: FinancialAssistantProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasOpenedRef = useRef(false);
  const { messages, pending, error, send, clear } =
    useFinancialAssistant(getContext);
  const suggestions = getSuggestedQuestions(calculatorId);

  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      inputRef.current?.focus();
    } else if (hasOpenedRef.current) {
      document.getElementById("financial-assistant-trigger")?.focus();
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function submitQuestion(question: string) {
    if (pending) return;
    setDraft("");
    await send(question);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(draft);
  }

  return (
    <>
      {open ? (
        <section
          aria-label={`WealthTogether AI assistant for ${calculatorName}`}
          className="border-border bg-background fixed inset-x-3 bottom-3 z-50 flex h-[min(42rem,calc(100dvh-1.5rem))] max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border shadow-[0_24px_80px_-24px_rgba(8,27,58,.45)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[min(42rem,calc(100dvh-3rem))] sm:w-[min(25rem,calc(100vw-3rem))]"
          id="financial-assistant-panel"
          role="dialog"
        >
          <header className="bg-navy text-white">
            <div className="flex items-center gap-3 px-4 py-4">
              <span className="bg-gold/15 text-gold grid size-10 shrink-0 place-items-center rounded-xl">
                <Sparkles aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold">WealthTogether AI</h2>
                <p className="mt-0.5 truncate text-xs text-white/70">
                  Here to explain your {calculatorName.toLowerCase()}
                </p>
              </div>
              {messages.length > 0 ? (
                <Button
                  aria-label="Clear conversation"
                  className="text-white/75 hover:bg-white/10 hover:text-white"
                  disabled={pending}
                  onClick={clear}
                  size="icon"
                  title="Clear conversation"
                  variant="ghost"
                >
                  <RotateCcw aria-hidden="true" className="size-4" />
                </Button>
              ) : null}
              <Button
                aria-label="Close financial assistant"
                className="text-white/75 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                size="icon"
                variant="ghost"
              >
                <X aria-hidden="true" className="size-5" />
              </Button>
            </div>
            <div className="border-t border-white/10 px-4 py-2.5">
              <p className="flex items-center gap-2 text-[11px] leading-4 text-white/75">
                <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
                Educational only — not personal financial advice.
              </p>
            </div>
          </header>

          <div
            aria-label="Conversation"
            aria-live="polite"
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            role="log"
          >
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="bg-secondary/70 text-foreground max-w-[92%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6">
                  <p>
                    Hi! I can explain the numbers in your {calculatorName} and
                    help you explore the assumptions behind them.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground px-1 text-[11px] font-semibold tracking-wide uppercase">
                    Try asking
                  </p>
                  {suggestions.map((question) => (
                    <button
                      className="border-border bg-card text-foreground hover:border-gold/60 hover:bg-secondary/50 focus-visible:ring-ring w-full rounded-xl border px-3 py-2.5 text-left text-xs leading-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                      key={question}
                      onClick={() => void submitQuestion(question)}
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  key={`${message.role}-${index}`}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "bg-navy max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-white"
                        : "bg-secondary/70 text-foreground max-w-[92%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6 whitespace-pre-wrap"
                    }
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}
            {pending ? (
              <div className="bg-secondary/70 text-muted-foreground flex max-w-[92%] items-center gap-2 rounded-2xl rounded-tl-md px-4 py-3 text-xs">
                <LoaderCircle
                  aria-hidden="true"
                  className="text-primary size-4 animate-spin"
                />
                Looking at your scenario…
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-border space-y-3 border-t px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
            {error ? (
              <p className="text-destructive text-xs leading-5" role="alert">
                {error}
              </p>
            ) : null}
            <form className="flex items-end gap-2" onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="financial-assistant-message">
                Ask a question about your calculator results
              </label>
              <textarea
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 max-h-28 min-h-11 flex-1 resize-y rounded-xl border px-3 py-2.5 text-sm leading-5 shadow-sm outline-none focus-visible:ring-2 disabled:opacity-60"
                disabled={pending}
                id="financial-assistant-message"
                maxLength={1200}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (draft.trim()) void submitQuestion(draft);
                  }
                }}
                placeholder="Ask about your results…"
                ref={inputRef}
                rows={1}
                value={draft}
              />
              <Button
                aria-label="Send question"
                className="size-11 shrink-0"
                disabled={pending || !draft.trim()}
                size="icon"
                type="submit"
                variant="gold"
              >
                {pending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Send aria-hidden="true" className="size-4" />
                )}
              </Button>
            </form>
            <p className="text-muted-foreground text-[10px] leading-4">
              Your question and calculator snapshot are sent to our AI provider
              to generate a reply. Don’t include personal or account details.
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="text-muted-foreground flex min-w-0 items-center gap-1.5 text-[10px] leading-4">
                <BookOpenText
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
                General education only
              </div>
              <Button
                asChild
                className="h-8 shrink-0 px-2.5 text-[11px]"
                size="sm"
                variant="outline"
              >
                <Link href="/consultation">
                  Book consultation
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      <Button
        aria-controls="financial-assistant-panel"
        aria-expanded={open}
        aria-label={
          open ? "Close AI financial assistant" : "Ask AI about your results"
        }
        className={`fixed right-4 bottom-4 z-50 h-12 rounded-full px-4 shadow-[0_12px_32px_-12px_rgba(8,27,58,.55)] sm:right-6 sm:bottom-6 ${open ? "hidden" : ""}`}
        id="financial-assistant-trigger"
        onClick={() => setOpen(true)}
        variant="gold"
      >
        <span className="bg-navy/10 grid size-7 place-items-center rounded-full">
          <Bot aria-hidden="true" className="text-navy size-4" />
        </span>
        <span>Ask AI</span>
        <MessageCircle aria-hidden="true" className="size-4" />
      </Button>
    </>
  );
}
