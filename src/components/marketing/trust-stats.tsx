export function TrustStats() {
  const stats = [
    {
      value: "15K+",
      label: "Instagram Community",
    },
    {
      value: "ARN-362166",
      label: "AMFI Registered Mutual Fund Distributor",
    },
    {
      value: "100%",
      label: "Financial Education Focused",
    },
    {
      value: "Free",
      label: "Financial Calculators",
    },
  ];

  return (
    <section className="border-y border-border bg-background">
      <div className="px-content mx-auto grid max-w-7xl gap-8 py-10 md:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="text-center"
          >
            <h3 className="text-gold text-3xl font-bold">
              {item.value}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}