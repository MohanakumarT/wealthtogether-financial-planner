import { Card } from "@/components/ui/card";
import { formatCalculatorValue } from "@/features/calculators/format";
import type { CalculatorYearTable as CalculatorYearTableConfig } from "@/features/calculators/types";

export function CalculatorYearTable({
  table,
}: {
  table: CalculatorYearTableConfig;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-border border-b px-5 py-4 sm:px-6">
        <h3 className="font-semibold">{table.title}</h3>
        {table.description ? (
          <p className="text-muted-foreground mt-1 text-sm">
            {table.description}
          </p>
        ) : null}
      </div>
      <div
        aria-label={table.title}
        className="overflow-x-auto"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted">
              {table.columns.map((column) => (
                <th
                  className="text-muted-foreground px-4 py-3 font-medium first:pl-5 sm:first:pl-6"
                  key={column.key}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {table.rows.map((row, index) => (
              <tr
                className="hover:bg-muted/50 transition-colors"
                key={`${String(row[table.columns[0]?.key] ?? "row")}-${index}`}
              >
                {table.columns.map((column) => (
                  <td
                    className="px-4 py-3 whitespace-nowrap first:pl-5 sm:first:pl-6"
                    key={column.key}
                  >
                    {formatCalculatorValue(
                      row[column.key],
                      column.format,
                      column.currency,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
