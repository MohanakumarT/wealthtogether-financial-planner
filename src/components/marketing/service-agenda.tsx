import { Check, Clock3 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type ServiceAgendaItem = {
  label: string;
  title: string;
  duration?: string;
  topics: string[];
};

const layoutClasses = {
  sessions: "lg:grid-cols-2",
  weeks: "sm:grid-cols-2",
} as const;

export function ServiceAgenda({
  items,
  layout = "sessions",
}: {
  items: ServiceAgendaItem[];
  layout?: keyof typeof layoutClasses;
}) {
  return (
    <div className={`grid gap-5 ${layoutClasses[layout]}`}>
      {items.map((item) => (
        <Card className="overflow-hidden" key={item.label}>
          <div className="bg-muted/60 flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
            <div>
              <p className="text-primary text-[10px] font-bold tracking-[0.16em] uppercase">
                {item.label}
              </p>
              <h4 className="font-display mt-1 text-2xl tracking-tight">
                {item.title}
              </h4>
            </div>
            {item.duration ? (
              <span className="border-border bg-background text-muted-foreground inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium">
                <Clock3 aria-hidden="true" className="text-primary size-3.5" />
                {item.duration}
              </span>
            ) : null}
          </div>
          <CardContent className="p-5 sm:p-6">
            <ul className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              {item.topics.map((topic) => (
                <li
                  className="text-muted-foreground flex items-start gap-2.5 text-sm leading-5"
                  key={topic}
                >
                  <Check
                    aria-hidden="true"
                    className="text-primary mt-0.5 size-4 shrink-0"
                  />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
