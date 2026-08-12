import { Stepper, type StepperStep } from "@/components/ui/stepper";

interface ProfileStepperProps {
    steps: ReadonlyArray<StepperStep>;
    activeStep: number;
}

export function ProfileStepper({ steps, activeStep }: ProfileStepperProps) {
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

            <Stepper steps={steps} activeStep={activeStep} className="mt-6" />
        </section>
    );
}
