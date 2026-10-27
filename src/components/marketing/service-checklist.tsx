import { Check } from "lucide-react";

import { Card } from "@/components/ui/card";

export type ServiceChecklistItem = {
  title: string;
  description?: string;
};

const gridClasses = {
  three: "sm:grid-cols-2 lg:grid-cols-3",
  four: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

export function ServiceChecklist({
  items,
  columns = "three",
}: {
  items: ServiceChecklistItem[];
  columns?: keyof typeof gridClasses;
}) {
  return (
    <div className={`grid gap-3 ${gridClasses[columns]}`}>
      {items.map((item) => (
        <Card
          className="flex h-full items-start gap-3.5 p-4 transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:transform-none sm:p-5"
          key={item.title}
        >
          <span className="bg-accent text-accent-foreground grid size-9 shrink-0 place-items-center rounded-xl">
            <Check aria-hidden="true" className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold">{item.title}</span>
            {item.description ? (
              <span className="text-muted-foreground mt-1 block text-xs leading-5">
                {item.description}
              </span>
            ) : null}
          </span>
        </Card>
      ))}
    </div>
  );
}
