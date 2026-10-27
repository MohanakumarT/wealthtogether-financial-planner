import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="border-border divide-border divide-y border-y">
      {items.map((item) => (
        <details className="group" id={item.id} key={item.id}>
          <summary
            aria-controls={`${item.id}-content`}
            className="focus-visible:ring-ring focus-visible:ring-offset-background flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden"
          >
            <span>{item.title}</span>
            <ChevronDown
              aria-hidden="true"
              className="text-muted-foreground size-4 shrink-0 transition-transform duration-300 ease-out group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div
            className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr] motion-reduce:transition-none"
            id={`${item.id}-content`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="text-muted-foreground max-w-3xl pr-8 pb-5 text-sm leading-6">
                {item.content}
              </div>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
