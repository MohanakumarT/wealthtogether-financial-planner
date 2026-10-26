"use client";

import {
  AlertCircle,
  BookmarkPlus,
  Check,
  Download,
  History,
  RotateCcw,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import type { CalculatorActionMessage } from "@/features/calculators/hooks/use-calculator-actions";

export function CalculatorActions({
  hasResult,
  canSave,
  authStatus,
  savedId,
  savedName,
  saveBusy,
  saveMessage,
  loginHref,
  onPrepareSave,
  onReset,
  onShare,
  onDownload,
  onSave,
  message,
}: {
  hasResult: boolean;
  canSave: boolean;
  authStatus: "checking" | "signed-in" | "signed-out" | "unconfigured";
  savedId: string | null;
  savedName: string;
  saveBusy: boolean;
  saveMessage: string;
  loginHref: string;
  onPrepareSave: () => Promise<boolean>;
  onReset: () => void;
  onShare: () => void;
  onDownload: () => void;
  onSave: (name: string) => Promise<boolean>;
  message?: CalculatorActionMessage | null;
}) {
  const StatusIcon = message?.kind === "error" ? AlertCircle : Check;
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [name, setName] = useState(savedName);

  useEffect(() => {
    setName(savedName);
    if (savedId) setSavePanelOpen(true);
    else setSavePanelOpen(false);
  }, [savedId, savedName]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button onClick={onReset} type="button" variant="outline">
          <RotateCcw aria-hidden="true" className="size-4" />
          Reset
        </Button>
        <Button
          disabled={!hasResult}
          onClick={onShare}
          type="button"
          variant="secondary"
        >
          <Share2 aria-hidden="true" className="size-4" />
          Share
        </Button>
        <Button
          disabled={!hasResult}
          onClick={onDownload}
          type="button"
          variant="secondary"
        >
          <Download aria-hidden="true" className="size-4" />
          Download PDF report
        </Button>
      </div>
      {authStatus === "signed-in" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!canSave || saveBusy}
              onClick={() => setSavePanelOpen((open) => !open)}
              type="button"
              variant="secondary"
            >
              <BookmarkPlus aria-hidden="true" className="size-4" />
              {savedId ? "Save changes" : "Save calculation"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/history">
                <History aria-hidden="true" className="size-4" />
                History
              </Link>
            </Button>
          </div>
          {savePanelOpen ? (
            <div className="border-border bg-muted/50 space-y-3 rounded-xl border p-3.5">
              <InputField
                autoComplete="off"
                label="Name this calculation"
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                value={name}
              />
              <div className="flex gap-2">
                <Button
                  disabled={!canSave || saveBusy || !name.trim()}
                  onClick={() => void onSave(name)}
                  type="button"
                  variant="gold"
                >
                  {saveBusy
                    ? "Saving…"
                    : savedId
                      ? "Save changes"
                      : "Save to history"}
                </Button>
                <Button
                  disabled={saveBusy}
                  onClick={() => setSavePanelOpen(false)}
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </div>
              {saveMessage ? (
                <p
                  aria-live="polite"
                  className="text-muted-foreground text-xs"
                  role="status"
                >
                  {saveMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : authStatus === "signed-out" ? (
        <div className="border-border flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-xs">
          <span className="text-muted-foreground">
            Sign in to keep this scenario in your history.
          </span>
          <Button asChild size="sm" variant="gold">
            <Link href={loginHref}>Sign in to save</Link>
          </Button>
        </div>
      ) : authStatus === "checking" && hasResult ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-xs">
          <span className="text-muted-foreground">
            Keep this scenario in your account to revisit it later.
          </span>
          <Button
            disabled={saveBusy}
            onClick={async () => {
              if (await onPrepareSave()) setSavePanelOpen(true);
            }}
            size="sm"
            type="button"
            variant="gold"
          >
            {saveBusy ? "Checking account…" : "Save calculation"}
          </Button>
        </div>
      ) : authStatus === "unconfigured" ? (
        <p className="text-muted-foreground text-xs">
          Connect Supabase to save calculations to your account.
        </p>
      ) : null}
      {message ? (
        <p
          aria-live="polite"
          className={`flex items-center gap-1.5 text-xs ${message.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}
          role="status"
        >
          <StatusIcon aria-hidden="true" className="size-3.5" />
          {message.text}
        </p>
      ) : null}
      {saveMessage && !savePanelOpen && authStatus === "signed-in" ? (
        <p
          aria-live="polite"
          className="text-muted-foreground text-xs"
          role="status"
        >
          {saveMessage}
        </p>
      ) : null}
    </div>
  );
}
