type HowItWorksStep = {
  number: number;
  title: string;
  description: string;
};

type HowItWorksProps = {
  heading?: string;
  steps: HowItWorksStep[];
  className?: string;
};

/**
 * Reusable "How it works" section (Tailwind + TS)
 * - Responsive: stacks on mobile, 3 columns on desktop
 * - Accessible: semantic heading + proper text hierarchy
 */
export function HowItWorks({
  heading = "How it works",
  steps,
  className = "",
}: HowItWorksProps) {
  return (
    <section className={`w-full ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading}
        </h2>

        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-lg font-semibold text-white">
                {step.number}
              </div>

              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>

              <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
