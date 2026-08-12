import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Horizontal connector stepper. Renders each step as an indicator circle
 * joined by separator lines that fill in as steps complete.
 */
export interface StepperStep {
  title: string
  description?: string
}

function Stepper({
  steps,
  activeStep,
  className,
  ...props
}: React.ComponentProps<"ol"> & {
  steps: readonly StepperStep[]
  activeStep: number
}) {
  return (
    <ol
      data-slot="stepper"
      className={cn("flex w-full items-start gap-2", className)}
      {...props}
    >
      {steps.map((step, index) => {
        const isActive = index === activeStep
        const isCompleted = index < activeStep

        return (
          <StepperItem
            key={step.title}
            step={{ ...step, index }}
            isActive={isActive}
            isCompleted={isCompleted}
            isLast={index === steps.length - 1}
          />
        )
      })}
    </ol>
  )
}

function StepperItem({
  step,
  isActive,
  isCompleted,
  isLast,
}: {
  step: StepperStep & { index: number }
  isActive: boolean
  isCompleted: boolean
  isLast: boolean
}) {
  return (
    <li
      data-slot="stepper-item"
      className="group/step relative flex w-full flex-col items-center justify-center"
    >
      {!isLast && <StepperSeparator isCompleted={isCompleted} />}

      <StepperIndicator
        index={step.index}
        isActive={isActive}
        isCompleted={isCompleted}
      />

      <div className="mt-3 flex w-full flex-col items-center gap-1 text-center">
        <StepperTitle isActive={isActive}>{step.title}</StepperTitle>
        {step.description && (
          <StepperDescription>{step.description}</StepperDescription>
        )}
      </div>
    </li>
  )
}

function StepperSeparator({ isCompleted }: { isCompleted: boolean }) {
  return (
    <div
      aria-hidden
      data-slot="stepper-separator"
      className={cn(
        "absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-5 h-0.5 shrink-0 rounded-full transition-colors duration-300",
        isCompleted ? "bg-brand" : "bg-muted"
      )}
    />
  )
}

function StepperIndicator({
  index,
  isActive,
  isCompleted,
}: {
  index: number
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div
      data-slot="stepper-indicator"
      className={cn(
        "z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
        isActive &&
          "border-brand bg-brand text-brand-foreground shadow-(--shadow-accent)",
        isCompleted && "border-brand bg-brand/10 text-brand",
        !isActive && !isCompleted && "border-border bg-card text-muted-foreground"
      )}
    >
      {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
    </div>
  )
}

function StepperTitle({
  isActive,
  className,
  ...props
}: React.ComponentProps<"p"> & { isActive: boolean }) {
  return (
    <p
      data-slot="stepper-title"
      className={cn(
        "text-sm font-semibold transition-colors",
        isActive ? "text-foreground" : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="stepper-description"
      className={cn("sr-only text-xs text-muted-foreground transition-colors md:not-sr-only", className)}
      {...props}
    />
  )
}

export { Stepper }
