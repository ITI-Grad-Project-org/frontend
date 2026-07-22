interface StepItem {
    title: string;
    description: string;
}

interface ProfileStepperProps {
    steps: ReadonlyArray<StepItem>;
    activeStep: number;
}

export function ProfileStepper({ steps, activeStep }: ProfileStepperProps) {
    const progress = steps.length <= 1 ? 100 : ((activeStep + 1) / steps.length) * 100;

    return (
        <section className="rounded-2xl border border-border bg-card p-5 shadow-(--shadow-card) sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Profile setup</p>
                    <h2 className="mt-2 text-lg font-bold">Complete your profile in steps</h2>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">
                    Step {activeStep + 1} of {steps.length}
                </p>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {steps.map((step, index) => {
                    const isActive = index === activeStep;
                    const isCompleted = index < activeStep;

                    return (
                        <div
                            key={step.title}
                            className={`rounded-xl border p-4 transition-colors ${
                                isActive
                                    ? "border-brand bg-brand/5"
                                    : isCompleted
                                        ? "border-border bg-muted/60"
                                        : "border-border bg-background"
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                                        isActive
                                            ? "bg-brand text-brand-foreground"
                                            : isCompleted
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{step.title}</p>
                                    <p className="text-xs text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
