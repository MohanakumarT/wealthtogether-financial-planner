"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  MoreHorizontal,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFamilyFinance } from "@/features/family/use-family-finance";
import { usePortfolio } from "@/features/portfolio/use-portfolio";
import {
  buildPlanningSnapshot,
  buildShareablePlanningSnapshot,
  buildScenarioComparison,
  formatCompactMoney,
  formatMoney,
  suggestedQuestions,
  type ScenarioResult,
} from "@/features/financial-assistant/planning-model";
import type { UserProfile } from "@/lib/auth/types";

type Conversation = {
  id: string;
  title: string;
  last_message_preview: string;
  last_message_at: string | null;
  updated_at: string;
};
type ChatMessage = {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const result = (await response.json().catch(() => null)) as
    (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(result?.error ?? "The request could not be completed.");
  }
  if (!result) throw new Error("The server returned an unreadable response.");
  return result;
}

const numberField =
  "border-input bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/25 h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-2";

export function AssistantWorkspace({
  userId,
  profile,
}: {
  userId: string;
  profile: UserProfile;
}) {
  const family = useFamilyFinance(userId);
  const portfolio = usePortfolio(userId);
  const snapshot = useMemo(
    () => buildPlanningSnapshot(profile, family.data, portfolio.holdings),
    [profile, family.data, portfolio.holdings],
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [includeData, setIncludeData] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [horizon, setHorizon] = useState(10);
  const [annualReturn, setAnnualReturn] = useState(8);
  const [inflation, setInflation] = useState(6);
  const [goalId, setGoalId] = useState("");
  const listEndRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const selectedGoal = useMemo(
    () =>
      snapshot.goals.find((goal) => goal.id === goalId) ??
      snapshot.retirementGoal ??
      snapshot.goals[0] ??
      null,
    [goalId, snapshot.goals, snapshot.retirementGoal],
  );
  const scenarios = useMemo(
    () =>
      buildScenarioComparison(
        snapshot,
        selectedGoal,
        horizon,
        annualReturn,
        inflation,
      ),
    [snapshot, selectedGoal, horizon, annualReturn, inflation],
  );
  const selectedGoalTargetDate = selectedGoal?.targetDate;

  useEffect(() => {
    if (!selectedGoalTargetDate) return;
    const [year, month, day] = selectedGoalTargetDate.split("-").map(Number);
    const targetDate = new Date(year, month - 1, day);
    const years = Math.ceil(
      (targetDate.getTime() - Date.now()) / (365.2425 * 24 * 60 * 60 * 1000),
    );
    setHorizon(Math.max(1, Math.min(50, years)));
  }, [selectedGoalTargetDate]);

  const loadConversations = useCallback(async () => {
    const result = await api<{ conversations: Conversation[] }>(
      "/api/financial-assistant/conversations",
    );
    setConversations(result.conversations);
    return result.conversations;
  }, []);

  const createConversation = useCallback(async () => {
    const result = await api<{ conversation: Conversation }>(
      "/api/financial-assistant/conversations",
      { method: "POST", body: JSON.stringify({ title: "New conversation" }) },
    );
    setConversations((current) => [
      result.conversation,
      ...current.filter((item) => item.id !== result.conversation.id),
    ]);
    setConversationId(result.conversation.id);
    setMessages([]);
    setError("");
    return result.conversation.id;
  }, []);

  const startConversation = useCallback(async () => {
    setError("");
    try {
      await createConversation();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "A new conversation could not be created.",
      );
    }
  }, [createConversation]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setLoadingConversations(true);
    void loadConversations()
      .then(async (items) => {
        if (items.length) setConversationId(items[0].id);
        else await createConversation();
      })
      .catch((reason: unknown) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Chat history could not be loaded.",
        ),
      )
      .finally(() => setLoadingConversations(false));
  }, [createConversation, loadConversations]);

  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    setLoadingMessages(true);
    setError("");
    void api<{ messages: ChatMessage[] }>(
      `/api/financial-assistant/conversations/${conversationId}`,
    )
      .then((result) => {
        if (active) setMessages(result.messages);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "This conversation could not be opened.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingMessages(false);
      });
    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  function openConversation(id: string) {
    if (pending || id === conversationId) return;
    setMessages([]);
    setConversationId(id);
  }

  async function deleteConversation(item: Conversation) {
    if (pending || !window.confirm(`Delete “${item.title}” and its messages?`))
      return;
    setError("");
    try {
      await api(`/api/financial-assistant/conversations/${item.id}`, {
        method: "DELETE",
      });
      const remaining = await loadConversations();
      if (item.id === conversationId) {
        setMessages([]);
        if (remaining.length) setConversationId(remaining[0].id);
        else await createConversation();
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "This conversation could not be deleted.",
      );
    }
  }

  async function sendMessage(rawMessage: string) {
    const text = rawMessage.trim();
    if (!text || pending || !conversationId) return;
    setDraft("");
    setPending(true);
    setError("");
    const optimistic: ChatMessage = {
      id: `draft-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((current) => [...current, optimistic]);
    const context = includeData
      ? JSON.stringify({
          sharing:
            "The client opted in to include this planning snapshot for educational analysis.",
          planningSnapshot: buildShareablePlanningSnapshot(snapshot),
          scenarioAssumptions: {
            horizonYears: horizon,
            expectedAnnualReturnPercent: annualReturn,
            inflationPercent: inflation,
            selectedGoal: selectedGoal
              ? {
                  type: selectedGoal.type,
                  targetAmountEntered: selectedGoal.targetAmount,
                }
              : null,
            comparisons: scenarios,
            comparisonNote:
              "Sensitivity illustrations only. The scenario treats the tracked portfolio and recorded monthly SIP as available for the selected goal; actual goal allocation may differ.",
          },
        })
      : JSON.stringify({
          sharing: false,
          note: "No personal planning snapshot was supplied.",
        });

    try {
      const result = await api<{ answer: string }>("/api/financial-assistant", {
        method: "POST",
        body: JSON.stringify({ conversationId, context, message: text }),
      });
      setMessages((current) => [
        ...current.filter((item) => item.id !== optimistic.id),
        optimistic,
        {
          id: `answer-${Date.now()}`,
          role: "assistant",
          content: result.answer,
        },
      ]);
      void loadConversations().catch(() =>
        setError(
          "The reply was saved, but the conversation list did not refresh.",
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "I couldn’t connect just now. Please try again.",
      );
      const current = await api<{ messages: ChatMessage[] }>(
        `/api/financial-assistant/conversations/${conversationId}`,
      ).catch(() => null);
      if (current) setMessages(current.messages);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(draft);
  }

  function downloadReport() {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const left = 42;
    pdf.setFillColor(8, 27, 58);
    pdf.rect(0, 0, 595, 90, "F");
    pdf.setTextColor(212, 175, 55);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("WEALTHTOGETHER INVESTMENTS", left, 32);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(21);
    pdf.text("Educational planning snapshot", left, 62);
    pdf.setTextColor(8, 27, 58);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.text(`Generated ${new Date().toLocaleDateString("en-IN")}`, left, 112);

    autoTable(pdf, {
      startY: 130,
      head: [["Planning area", "Recorded snapshot"]],
      body: [
        [
          "Age",
          snapshot.age === null ? "Not provided" : `${snapshot.age} years`,
        ],
        [
          "Monthly take-home income",
          snapshot.monthlyIncome
            ? `INR ${Math.round(snapshot.monthlyIncome).toLocaleString("en-IN")}`
            : "Not provided",
        ],
        [
          "Monthly expenses",
          snapshot.monthlyExpenses
            ? `INR ${Math.round(snapshot.monthlyExpenses).toLocaleString("en-IN")}`
            : "Not provided",
        ],
        [
          "Estimated savings rate",
          snapshot.savingsRate === null
            ? "Not available"
            : `${(snapshot.savingsRate * 100).toFixed(1)}%`,
        ],
        [
          "Recorded monthly SIP",
          snapshot.currentMonthlySip
            ? `INR ${Math.round(snapshot.currentMonthlySip).toLocaleString("en-IN")}`
            : "Not recorded",
        ],
        [
          "Portfolio invested / current",
          `INR ${Math.round(snapshot.investedAmount).toLocaleString("en-IN")} / INR ${Math.round(snapshot.portfolioValue).toLocaleString("en-IN")}`,
        ],
        [
          "Emergency fund",
          `${formatMoney(snapshot.emergencySavings)}${snapshot.emergencyFundMonths === null ? "" : ` · ${snapshot.emergencyFundMonths.toFixed(1)} months of recorded expenses`}`,
        ],
        ["Risk profile", snapshot.riskProfile.replaceAll("_", " ")],
      ],
      theme: "striped",
      headStyles: { fillColor: [8, 27, 58] },
      styles: { fontSize: 9, cellPadding: 6 },
    });
    const afterSnapshot =
      (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? 130;
    autoTable(pdf, {
      startY: afterSnapshot + 18,
      head: [["Goal", "Owner", "Target", "Saved", "Progress", "Target date"]],
      body: snapshot.goals.length
        ? snapshot.goals.map((goal) => [
            goal.title,
            goal.owner,
            `INR ${Math.round(goal.targetAmount).toLocaleString("en-IN")}`,
            `INR ${Math.round(goal.savedAmount).toLocaleString("en-IN")}`,
            `${goal.progress.toFixed(1)}%`,
            goal.targetDate,
          ])
        : [["No goals recorded", "—", "—", "—", "—", "—"]],
      theme: "striped",
      headStyles: { fillColor: [8, 27, 58] },
      styles: { fontSize: 8, cellPadding: 5 },
    });
    const afterGoals =
      (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? afterSnapshot;
    autoTable(pdf, {
      startY: afterGoals + 18,
      head: [
        [
          "Scenario",
          "Period",
          "SIP / month",
          "Projected corpus",
          "Illustrated goal cost",
        ],
      ],
      body: scenarios.map((item) => [
        item.name,
        `${item.years} years`,
        `INR ${Math.round(item.sip).toLocaleString("en-IN")}`,
        `INR ${Math.round(item.corpus).toLocaleString("en-IN")}`,
        selectedGoal
          ? `INR ${Math.round(item.goalCost).toLocaleString("en-IN")}`
          : "Select a goal",
      ]),
      theme: "striped",
      headStyles: { fillColor: [8, 27, 58] },
      styles: { fontSize: 8, cellPadding: 5 },
    });
    const actionPlan = [...messages]
      .reverse()
      .find((message) => message.role === "assistant");
    if (actionPlan) {
      const bottom =
        (pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable
          ?.finalY ?? afterGoals;
      const text = actionPlan.content
        .replace(/[#*_`>-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      let y = bottom + 24;
      if (y > 750) {
        pdf.addPage();
        y = 52;
      }
      pdf.setTextColor(8, 27, 58);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("Latest educational assistant summary", left, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      const lines = pdf.splitTextToSize(text, 510) as string[];
      y += 18;
      for (const line of lines.slice(0, 80)) {
        if (y > 792) {
          pdf.addPage();
          y = 52;
        }
        pdf.text(line, left, y);
        y += 12;
      }
    }
    for (let page = 1; page <= pdf.getNumberOfPages(); page += 1) {
      pdf.setPage(page);
      pdf.setTextColor(95, 104, 118);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        "Educational estimates only · Not personalized investment, tax, or legal advice · No securities or mutual funds recommended",
        left,
        820,
        { maxWidth: 510 },
      );
      pdf.text(`${page} / ${pdf.getNumberOfPages()}`, 553, 820, {
        align: "right",
      });
    }
    pdf.save("wealthtogether-educational-planning-report.pdf");
  }

  const estimatedSavingText =
    snapshot.estimatedMonthlySavings === null
      ? "Add income and expenses"
      : formatMoney(snapshot.estimatedMonthlySavings);
  const retirementText =
    snapshot.retirementGoalProgress === null
      ? "Add a retirement goal"
      : `${snapshot.retirementGoalProgress.toFixed(0)}% funded so far`;
  const activeConversation = conversations.find(
    (item) => item.id === conversationId,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.16em] uppercase">
            WealthTogether Investments
          </p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            AI Financial Assistant
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
            Understand your planning numbers, explore assumptions, and create an
            educational action plan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={pending || !family.hydrated || !portfolio.hydrated}
            onClick={downloadReport}
            variant="outline"
          >
            <ArrowDownToLine aria-hidden="true" className="size-4" />
            Printable report
          </Button>
          <Button
            disabled={pending || !conversationId}
            onClick={() =>
              void sendMessage(
                "Create an educational action plan from the planning snapshot and scenarios I have chosen to share. Summarize the available information, uncertainties, and practical planning next steps. Do not recommend funds or securities.",
              )
            }
            variant="outline"
          >
            <Sparkles aria-hidden="true" className="size-4" />
            Action plan
          </Button>
          <Button
            disabled={pending}
            onClick={() => void startConversation()}
            variant="gold"
          >
            <MessageSquarePlus aria-hidden="true" className="size-4" />
            New chat
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Goal progress"
          value={
            snapshot.overallGoalProgress === null
              ? "No goals yet"
              : `${snapshot.overallGoalProgress.toFixed(0)}% funded`
          }
          detail={`${snapshot.goals.length} recorded goal${snapshot.goals.length === 1 ? "" : "s"}`}
          icon={ArrowRight}
        />
        <InsightCard
          label="Retirement readiness"
          value={retirementText}
          detail="Based on recorded retirement goal savings only"
          icon={Clock3}
        />
        <InsightCard
          label="Estimated monthly savings"
          value={estimatedSavingText}
          detail={
            snapshot.savingsRate === null
              ? "Based on take-home income and Self expenses"
              : `${(snapshot.savingsRate * 100).toFixed(1)}% of recorded take-home income`
          }
          icon={Sparkles}
        />
        <InsightCard
          label="Investment discipline"
          value={snapshot.investmentDiscipline.status}
          detail={snapshot.investmentDiscipline.explanation}
          icon={Check}
        />
      </div>

      {error ? (
        <p
          className="bg-destructive/10 text-destructive rounded-xl px-4 py-3 text-sm"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="grid min-h-[690px] gap-4 xl:grid-cols-[230px_minmax(0,1fr)_310px]">
        <Card className="hidden min-h-[680px] flex-col overflow-hidden xl:flex">
          <div className="border-border flex items-center justify-between border-b px-4 py-4">
            <div>
              <h2 className="text-sm font-semibold">Your conversations</h2>
              <p className="text-muted-foreground mt-1 text-[11px]">
                Private chat history
              </p>
            </div>
            <Button
              aria-label="Start a new conversation"
              disabled={pending}
              onClick={() => void startConversation()}
              size="icon"
              variant="ghost"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>
          <ConversationList
            conversations={conversations}
            currentId={conversationId}
            loading={loadingConversations}
            onDelete={deleteConversation}
            onSelect={openConversation}
          />
          <div className="border-border mt-auto border-t p-4">
            <p className="text-muted-foreground flex items-start gap-2 text-[11px] leading-5">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
              Only your account can access these conversations.
            </p>
          </div>
        </Card>

        <Card className="flex min-h-[690px] min-w-0 flex-col overflow-hidden">
          <div className="border-border flex items-center gap-3 border-b px-4 py-3 sm:px-5">
            <span className="bg-accent text-accent-foreground grid size-9 shrink-0 place-items-center rounded-xl">
              <Sparkles className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold">
                {activeConversation?.title ?? "Planning conversation"}
              </h2>
              <p className="text-muted-foreground mt-0.5 text-[11px]">
                Educational financial planning · no product picks
              </p>
            </div>
            {conversationId ? (
              <button
                aria-label="Delete this conversation"
                className="text-muted-foreground hover:text-destructive rounded-lg p-2"
                disabled={pending}
                onClick={() => {
                  const item = conversations.find(
                    (entry) => entry.id === conversationId,
                  );
                  if (item) void deleteConversation(item);
                }}
                type="button"
              >
                <Trash2 className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="border-border border-b px-4 py-2.5 xl:hidden">
            <details>
              <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-2 text-xs font-medium">
                <Clock3 className="size-3.5" />
                Conversation history
                <ChevronDown className="ml-auto size-3.5" />
              </summary>
              <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
                {conversations.map((item) => (
                  <ConversationButton
                    current={item.id === conversationId}
                    item={item}
                    key={item.id}
                    onSelect={openConversation}
                  />
                ))}
              </div>
            </details>
          </div>

          <div
            aria-label="Conversation"
            aria-live="polite"
            className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6"
            role="log"
          >
            {loadingMessages ? (
              <div className="text-muted-foreground flex justify-center py-10 text-sm">
                <LoaderCircle className="mr-2 size-4 animate-spin" />
                Loading chat…
              </div>
            ) : null}
            {!loadingMessages && messages.length === 0 ? (
              <div className="mx-auto max-w-xl py-5">
                <div className="bg-accent text-accent-foreground mx-auto grid size-14 place-items-center rounded-2xl">
                  <Bot className="size-7" />
                </div>
                <h3 className="font-display mt-4 text-center text-2xl">
                  What would you like to understand?
                </h3>
                <p className="text-muted-foreground mx-auto mt-2 max-w-md text-center text-sm leading-6">
                  Ask about SIPs, inflation, XIRR, CAGR, retirement planning, or
                  compare a few transparent scenarios.
                </p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      className="border-border bg-background hover:bg-muted text-foreground rounded-xl border px-3.5 py-3 text-left text-xs leading-5 transition-colors"
                      disabled={pending}
                      key={question}
                      onClick={() => void sendMessage(question)}
                      type="button"
                    >
                      {question}
                    </button>
                  ))}
                  <button
                    className="border-border bg-background hover:bg-muted text-foreground rounded-xl border px-3.5 py-3 text-left text-xs leading-5 transition-colors"
                    disabled={pending}
                    onClick={() =>
                      void sendMessage(
                        "Create an educational action plan from the planning snapshot. Summarize recorded information, uncertainties, and three practical planning steps. Do not recommend funds or securities.",
                      )
                    }
                    type="button"
                  >
                    Create an educational action plan
                  </button>
                </div>
              </div>
            ) : null}
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {pending ? <TypingIndicator /> : null}
            <div ref={listEndRef} />
          </div>

          <div className="border-border space-y-3 border-t px-4 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                className={`flex min-h-8 items-center gap-2 text-xs font-medium ${family.hydrated && portfolio.hydrated && !pending ? "cursor-pointer" : "cursor-wait opacity-60"}`}
              >
                <input
                  checked={includeData}
                  className="accent-primary size-4"
                  disabled={pending || !family.hydrated || !portfolio.hydrated}
                  onChange={(event) => setIncludeData(event.target.checked)}
                  type="checkbox"
                />
                <span>Include my financial snapshot in this chat</span>
              </label>
              <span className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                <ShieldCheck className="size-3.5" />
                Opt-in · never stored with chat messages
              </span>
            </div>
            {includeData ? (
              <p className="text-muted-foreground bg-muted/55 rounded-lg px-3 py-2 text-[10px] leading-4">
                For each new question, your age, income, SIP, risk profile, goal
                types, amounts and dates, emergency-fund estimate, and portfolio
                totals are sent to OpenAI. Account name, email, phone, and date
                of birth are excluded from the snapshot.
              </p>
            ) : (
              <p className="text-muted-foreground text-[10px] leading-4">
                Personal planning data is off. Only your question is sent; your
                profile, goals, emergency fund, and portfolio stay out of the
                request.
              </p>
            )}
            <form className="flex items-end gap-2" onSubmit={submit}>
              <label className="sr-only" htmlFor="assistant-message">
                Ask a planning question
              </label>
              <textarea
                autoComplete="off"
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/25 max-h-36 min-h-12 flex-1 resize-y rounded-xl border px-3.5 py-3 text-sm leading-5 shadow-sm outline-none focus-visible:ring-2 disabled:opacity-60"
                disabled={pending || !conversationId}
                id="assistant-message"
                maxLength={1200}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(draft);
                  }
                }}
                placeholder="Ask anything about your plan…"
                rows={1}
                value={draft}
              />
              <Button
                aria-label="Send message"
                className="size-12 shrink-0 rounded-xl"
                disabled={pending || !draft.trim() || !conversationId}
                size="icon"
                type="submit"
                variant="gold"
              >
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </form>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                <CircleHelp className="size-3.5" />
                Educational only, not financial, tax, or legal advice. Avoid
                names or identifying details in chat.
              </p>
              <Button
                asChild
                className="h-8 px-2.5 text-[11px]"
                size="sm"
                variant="outline"
              >
                <Link href="/consultation">
                  Book consultation
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">
                  Your planning snapshot
                </h2>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  From your profile and this browser
                </p>
              </div>
              <Button
                aria-label="Download printable planning report"
                disabled={!family.hydrated || !portfolio.hydrated}
                onClick={downloadReport}
                size="icon"
                variant="ghost"
              >
                <FileText className="size-4" />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <MiniStat
                label="Age"
                value={snapshot.age === null ? "—" : `${snapshot.age}`}
              />
              <MiniStat
                label="Risk profile"
                value={snapshot.riskProfile.replaceAll("_", " ")}
                capitalize
              />
              <MiniStat
                label="Monthly income"
                value={
                  snapshot.monthlyIncome
                    ? formatCompactMoney(snapshot.monthlyIncome)
                    : "Not set"
                }
              />
              <MiniStat
                label="Current SIP"
                value={
                  snapshot.currentMonthlySip
                    ? formatCompactMoney(snapshot.currentMonthlySip)
                    : "Not set"
                }
              />
              <MiniStat
                label="Portfolio value"
                value={formatCompactMoney(snapshot.portfolioValue)}
              />
              <MiniStat
                label="Emergency fund"
                value={
                  snapshot.emergencyFundMonths === null
                    ? formatCompactMoney(snapshot.emergencySavings)
                    : `${snapshot.emergencyFundMonths.toFixed(1)} mo.`
                }
              />
            </div>
            <p className="text-muted-foreground mt-3 text-[10px] leading-4">
              Holdings and family goals are stored in this browser. Income, SIP,
              and risk profile are in your account profile.
            </p>
            <Link
              className="text-primary mt-3 inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
              href="/profile"
            >
              Update profile
              <ArrowRight className="size-3.5" />
            </Link>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold">Scenario comparison</h2>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  Illustrations, not forecasts
                </p>
              </div>
              <MoreHorizontal className="text-muted-foreground size-4" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <label className="text-muted-foreground text-[10px]">
                Years
                <input
                  aria-label="Projection years"
                  className={`${numberField} mt-1`}
                  max="50"
                  min="1"
                  onChange={(event) =>
                    setHorizon(
                      Math.max(
                        1,
                        Math.min(50, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  type="number"
                  value={horizon}
                />
              </label>
              <label className="text-muted-foreground text-[10px]">
                Return %
                <input
                  aria-label="Annual return assumption percent"
                  className={`${numberField} mt-1`}
                  max="25"
                  min="0"
                  onChange={(event) =>
                    setAnnualReturn(
                      Math.max(
                        0,
                        Math.min(25, Number(event.target.value) || 0),
                      ),
                    )
                  }
                  step="0.5"
                  type="number"
                  value={annualReturn}
                />
              </label>
              <label className="text-muted-foreground text-[10px]">
                Inflation %
                <input
                  aria-label="Inflation assumption percent"
                  className={`${numberField} mt-1`}
                  max="20"
                  min="0"
                  onChange={(event) =>
                    setInflation(
                      Math.max(
                        0,
                        Math.min(20, Number(event.target.value) || 0),
                      ),
                    )
                  }
                  step="0.5"
                  type="number"
                  value={inflation}
                />
              </label>
            </div>
            {snapshot.goals.length ? (
              <label className="text-muted-foreground mt-3 block text-[10px]">
                Compare against
                <select
                  className="border-input bg-background text-foreground mt-1 h-9 w-full rounded-lg border px-2.5 text-xs"
                  onChange={(event) => setGoalId(event.target.value)}
                  value={selectedGoal?.id ?? ""}
                >
                  {snapshot.goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.owner} · {goal.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-muted-foreground bg-muted/50 mt-3 rounded-lg p-2.5 text-[10px] leading-4">
                Add a goal in your family dashboard to compare an
                inflation-adjusted target.
              </p>
            )}
            <div className="mt-4 space-y-2">
              {scenarios.map((item, index) => (
                <ScenarioRow
                  hasGoal={Boolean(selectedGoal)}
                  item={item}
                  key={item.name}
                  selected={index === 0}
                />
              ))}
            </div>
            <p className="text-muted-foreground mt-3 text-[10px] leading-4">
              Assumes monthly contributions at month-end and the whole tracked
              portfolio and SIP are available for this selected goal. Entered
              goal amount is treated as today’s cost. Actual allocation and
              returns can differ.
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-4" />
              </span>
              <h2 className="text-sm font-semibold">Signals, with context</h2>
            </div>
            <ul className="mt-3 space-y-3 text-xs leading-5">
              <li>
                <span className="font-semibold">Goal progress:</span>{" "}
                <span className="text-muted-foreground">
                  {snapshot.overallGoalProgress === null
                    ? "No goals recorded yet."
                    : `${snapshot.overallGoalProgress.toFixed(1)}% of entered goal targets is saved across profiles.`}
                </span>
              </li>
              <li>
                <span className="font-semibold">Retirement:</span>{" "}
                <span className="text-muted-foreground">
                  {snapshot.retirementGoal
                    ? `${snapshot.retirementGoal.progress.toFixed(1)}% of the recorded retirement goal is saved. This is not a retirement adequacy estimate.`
                    : "Add a retirement goal to view its saved-to-target progress."}
                </span>
              </li>
              <li>
                <span className="font-semibold">Cash flow:</span>{" "}
                <span className="text-muted-foreground">
                  {snapshot.savingsRate === null
                    ? "Enter monthly income and Self monthly expenses to estimate a savings rate."
                    : `The estimate is ${(snapshot.savingsRate * 100).toFixed(1)}% based on entered monthly figures.`}
                </span>
              </li>
              <li>
                <span className="font-semibold">Contribution history:</span>{" "}
                <span className="text-muted-foreground">
                  {snapshot.investmentDiscipline.explanation}
                </span>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
      <p className="text-muted-foreground mx-auto max-w-4xl text-center text-[10px] leading-4">
        Educational information only. Illustrations depend on user-entered
        assumptions, are not guaranteed, and do not recommend particular
        investments or securities.
      </p>
    </div>
  );
}

function ConversationList({
  conversations,
  currentId,
  loading,
  onSelect,
  onDelete,
}: {
  conversations: Conversation[];
  currentId: string;
  loading: boolean;
  onSelect: (id: string) => void;
  onDelete: (conversation: Conversation) => void;
}) {
  if (loading)
    return (
      <div className="text-muted-foreground p-4 text-xs">
        Loading your chats…
      </div>
    );
  if (!conversations.length)
    return (
      <div className="text-muted-foreground p-4 text-xs">
        Start a new conversation.
      </div>
    );
  return (
    <div className="space-y-1 overflow-y-auto p-2">
      {conversations.map((item) => (
        <div className="group relative" key={item.id}>
          <ConversationButton
            current={item.id === currentId}
            item={item}
            onSelect={onSelect}
          />
          <button
            aria-label={`Delete ${item.title}`}
            className="text-muted-foreground hover:text-destructive absolute top-2 right-1 hidden rounded-md p-1.5 group-hover:block focus:block"
            onClick={() => onDelete(item)}
            type="button"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ConversationButton({
  current,
  item,
  onSelect,
}: {
  current: boolean;
  item: Conversation;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      className={`block w-full rounded-xl px-3 py-2.5 pr-9 text-left transition-colors ${current ? "bg-accent text-accent-foreground" : "hover:bg-muted text-foreground"}`}
      onClick={() => onSelect(item.id)}
      type="button"
    >
      <span className="block truncate text-xs font-semibold">{item.title}</span>
      <span className="text-muted-foreground mt-1 block truncate text-[10px]">
        {item.last_message_preview || "New conversation"}
      </span>
      <span className="text-muted-foreground mt-1 block text-[9px]">
        {item.last_message_at
          ? new Date(item.last_message_at).toLocaleDateString("en-IN")
          : "Just started"}
      </span>
    </button>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const user = message.role === "user";
  return (
    <div className={`flex ${user ? "justify-end" : "justify-start"}`}>
      <div
        className={
          user
            ? "bg-navy max-w-[88%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-white"
            : "bg-secondary/70 text-foreground max-w-[94%] rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-6"
        }
      >
        {user ? (
          message.content
        ) : (
          <div className="assistant-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div
      aria-label="Assistant is typing"
      className="bg-secondary/70 text-muted-foreground flex w-fit items-center gap-2 rounded-2xl rounded-tl-md px-4 py-3 text-xs"
      role="status"
    >
      <span className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-.25s]" />
      <span className="bg-primary size-2 animate-bounce rounded-full [animation-delay:-.12s]" />
      <span className="bg-primary size-2 animate-bounce rounded-full" />
      Thinking through the assumptions…
    </div>
  );
}

function InsightCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof ArrowRight;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-muted-foreground text-xs">{label}</p>
        <span className="bg-accent text-primary grid size-8 place-items-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-base font-semibold capitalize">{value}</p>
      <p className="text-muted-foreground mt-1 text-[10px] leading-4">
        {detail}
      </p>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-muted/65 rounded-xl p-2.5">
      <p className="text-muted-foreground text-[10px]">{label}</p>
      <p
        className={`mt-1 truncate text-xs font-semibold ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function ScenarioRow({
  item,
  selected,
  hasGoal,
}: {
  item: ScenarioResult;
  selected: boolean;
  hasGoal: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${selected ? "border-gold/55 bg-accent/45" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium">{item.name}</p>
        <span className="text-muted-foreground shrink-0 text-[9px]">
          {item.years} yr
        </span>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]">
        <span className="text-muted-foreground">
          Corpus{" "}
          <strong className="text-foreground ml-1">
            {formatCompactMoney(item.corpus)}
          </strong>
        </span>
        <span className="text-muted-foreground">
          Goal cost{" "}
          <strong className="text-foreground ml-1">
            {hasGoal ? formatCompactMoney(item.goalCost) : "Add a goal"}
          </strong>
        </span>
      </div>
    </div>
  );
}
