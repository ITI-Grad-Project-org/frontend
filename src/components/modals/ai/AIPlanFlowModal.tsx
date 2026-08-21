import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import { formatAiError, getApiErrorMessage, getApiStatus } from "@/lib/api";
import type { ClientConnection } from "@/types/client";
import {
  acceptPlanSuggestion,
  createPlanSuggestion,
  declinePlanSuggestion,
  getPlanSuggestion,
  listPlanSuggestions,
} from "@/services/ai";
import { getClientProgram } from "@/services/plans";
import { getNutritionPlan } from "@/services/nutritionPlans";
import type { ClientProgramTree } from "@/types/plans";
import type { NutritionPlanTree } from "@/types/nutritionPlans";
import type {
  AICreatePlanSuggestionPayload,
  AIPlanSuggestionCreated,
  AIPlanSuggestionDetail,
  AIPlanSuggestionKind,
  AIPlanSuggestionSummary,
} from "@/types/ai";
import {
  aiPlanConfigSchema,
  aiPlanGoalOptions,
  aiPlanKindOptions,
  defaultAIPlanConfigValues,
  type AIPlanConfigFormData,
} from "@/schemas/ai";
import { AIQueueLoader } from "@/components/ai/AIQueueLoader";
import { AIPlanSuggestionReview } from "@/components/ai/AIPlanSuggestionReview";
import { usePlanSuggestionPolling } from "@/hooks/ai/usePlanSuggestionPolling";

type FlowState =
  | { name: "configure" }
  | { name: "queued"; created: AIPlanSuggestionCreated }
  | { name: "review"; detail: AIPlanSuggestionDetail; queue: AIPlanSuggestionSummary[] }
  | { name: "success"; detail: AIPlanSuggestionDetail };

type Props = {
  open: boolean;
  clients: ClientConnection[];
  defaultKind: AIPlanSuggestionKind;
  onClose: () => void;
  onCreated: (created: ClientProgramTree | NutritionPlanTree) => void | Promise<void>;
  onUpgrade?: () => void;
  /** Open straight into the review step for an existing ready suggestion. */
  initialDetail?: AIPlanSuggestionDetail;
};

const fieldCls =
  "w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand";

function formatClientLabel(connection: ClientConnection) {
  const client = connection.client;
  const name = `${client.firstName || ""} ${client.lastName || ""}`.trim() || "Unknown Client";
  return `${name} · ${client.email}`;
}

function StepHeader({
  title,
  subtitle,
  onClose,
  onReset,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onReset?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border p-6 pb-4">
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
          <Sparkles className="h-5 w-5 shrink-0 text-brand" />
          {title}
        </h2>
        {subtitle ? <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            title="Start over"
            className="cursor-pointer rounded-xl border border-border p-2 transition-colors hover:bg-muted"
          >
            <RotateCcw size={18} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="cursor-pointer rounded-xl border border-border p-2 transition-colors hover:bg-muted"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function CloseOnlyBar({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Review suggestion
      </p>
      <button
        type="button"
        onClick={onClose}
        title="Close"
        className="cursor-pointer rounded-xl border border-border p-2 transition-colors hover:bg-muted"
      >
        <X size={18} />
      </button>
    </div>
  );
}

// ─── Configure step ─────────────────────────────────────────────────────────────

function ConfigureStep({
  clients,
  isSubmitting,
  configError,
  upgradeRequired,
  register,
  control,
  errors,
  onSubmit,
  onClose,
  onUpgrade,
}: {
  clients: ClientConnection[];
  isSubmitting: boolean;
  configError: string | null;
  upgradeRequired: boolean;
  register: ReturnType<typeof useForm<AIPlanConfigFormData>>["register"];
  control: ReturnType<typeof useForm<AIPlanConfigFormData>>["control"];
  errors: ReturnType<typeof useForm<AIPlanConfigFormData>>["formState"]["errors"];
  onSubmit: (event?: React.FormEvent) => void;
  onClose: () => void;
  onUpgrade?: () => void;
}) {
  const watchedKind = useWatch<AIPlanConfigFormData>({ control, name: "kind" });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepHeader
        title="Create plan with AI"
        subtitle="Answer a few questions — the AI reads the client's file and drafts a full plan."
        onClose={onClose}
      />
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {configError ? (
            <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{configError}</span>
              </div>
              {upgradeRequired && onUpgrade ? (
                <button
                  type="button"
                  onClick={onUpgrade}
                  className="mt-3 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground"
                >
                  View Solo and Studio
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Client *</span>
              <select {...register("membershipId")} className={fieldCls} disabled={clients.length === 0}>
                <option value="">{clients.length === 0 ? "No active clients" : "Select a client"}</option>
                {clients.map((connection) => (
                  <option key={connection.id} value={connection.id}>
                    {formatClientLabel(connection)}
                  </option>
                ))}
              </select>
              {errors.membershipId && <p className="mt-1 text-xs text-destructive">{errors.membershipId.message}</p>}
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Plan kind *</span>
              <select {...register("kind")} className={fieldCls}>
                {aiPlanKindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.kind && <p className="mt-1 text-xs text-destructive">{errors.kind.message}</p>}
            </label>

            {watchedKind === "training" ? (
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Days per week{" "}
                  <span className="font-normal text-muted-foreground/70">
                    (training only — blank uses the client's schedule)
                  </span>
                </span>
                <input {...register("daysPerWeek")} type="number" min="1" max="7" placeholder="3" className={fieldCls} />
                {errors.daysPerWeek && <p className="mt-1 text-xs text-destructive">{errors.daysPerWeek.message}</p>}
              </label>
            ) : null}
          </div>

          <div className="space-y-5 border-t border-border pt-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Goal{" "}
                <span className="font-normal text-muted-foreground/70">(optional — overrides the intake goal)</span>
              </span>
              <select {...register("goal")} className={fieldCls}>
                {aiPlanGoalOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.goal && <p className="mt-1 text-xs text-destructive">{errors.goal.message}</p>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Notes for the AI <span className="font-normal text-muted-foreground/70">(optional)</span>
              </span>
              <textarea
                {...register("coachNotes")}
                placeholder="Shoulder still recovering — keep overhead pressing light…"
                rows={3}
                className={`${fieldCls} min-h-24 resize-y`}
              />
              {errors.coachNotes && <p className="mt-1 text-xs text-destructive">{errors.coachNotes.message}</p>}
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || clients.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Queuing request…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Start generating
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Queued / waiting step ─────────────────────────────────────────────────────

function QueuedStep({
  created,
  onReady,
  onRetryRequest,
  onReset,
  onClose,
}: {
  created: AIPlanSuggestionCreated;
  onReady: (detail: AIPlanSuggestionDetail) => Promise<void>;
  onRetryRequest: () => void;
  onReset: () => void;
  onClose: () => void;
}) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const transitionedRef = useRef(false);

  const poll = usePlanSuggestionPolling({
    enabled: true,
    suggestionId: created.suggestionId,
    membershipId: created.membershipId,
    kind: created.kind,
  });

  const failed = poll.status === "failed" || poll.status === "invalid";
  const showErrorPanel = failed || poll.status === "error" || loadError !== null;

  useEffect(() => {
    if (poll.status !== "ready" || transitionedRef.current) return;
    transitionedRef.current = true;
    void (async () => {
      try {
        const detail = await getPlanSuggestion(created.suggestionId);
        setLoadError(null);
        await onReady(detail);
      } catch (error) {
        setLoadError(
          getApiErrorMessage(error, "Your plan is ready, but it could not be loaded. Please try again."),
        );
      }
    })();
  }, [poll.status, reloadToken, created.suggestionId, onReady]);

  const retryLoad = () => {
    setLoadError(null);
    transitionedRef.current = false;
    setReloadToken((token) => token + 1);
  };

  const waitSeconds = poll.attempts * 4;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepHeader
        title="Creating with AI"
        subtitle={
          showErrorPanel
            ? "Generation did not complete."
            : "The request is queued — the AI is reading the client's file and designing the plan."
        }
        onClose={onClose}
        onReset={showErrorPanel ? onReset : undefined}
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        {showErrorPanel ? (
          <div className="w-full max-w-sm space-y-3">
            <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {formatAiError(
                  loadError ?? poll.errorMessage,
                  "Generation could not be completed. Please try again.",
                )}
              </span>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              {failed || loadError !== null ? (
                <button
                  type="button"
                  onClick={loadError !== null ? retryLoad : onRetryRequest}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border bg-border px-4 py-3 text-sm font-semibold text-foreground transition hover:opacity-90"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try again
                </button>
              ) : null}
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Change settings
              </button>
            </div>
          </div>
        ) : (
          <>
            <AIQueueLoader />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Your plan is being designed…</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {poll.attempts > 0
                  ? `Been working for about ${waitSeconds} seconds. You can leave this open — it will update on its own.`
                  : "It usually takes under a minute."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Success step ──────────────────────────────────────────────────────────────

function SuccessStep({
  detail,
  opening,
  onOpen,
  onClose,
}: {
  detail: AIPlanSuggestionDetail;
  opening: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const targetId = detail.kind === "training" ? detail.createdProgramId : detail.createdPlanId;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <StepHeader
        title="Plan created"
        subtitle="The suggestion was accepted and a real draft plan was built for the client."
        onClose={onClose}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="h-9 w-9 text-success" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{detail.plan?.name ?? "Your plan"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {detail.kind === "training" ? "Training program" : "Nutrition plan"} · draft ·{" "}
            {detail.constraints?.durationWeeks} week{detail.constraints?.durationWeeks === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onOpen}
            disabled={opening || !targetId}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {opening ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening…
              </>
            ) : (
              <>
                Open in builder
                <span aria-hidden>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Flow orchestrator ─────────────────────────────────────────────────────────

function AIPlanFlowModalContent({
  clients,
  defaultKind,
  onClose,
  onCreated,
  initialDetail,
  onUpgrade,
}: Omit<Props, "open">) {
  const [flow, setFlow] = useState<FlowState>(() =>
    initialDetail ? { name: "review", detail: initialDetail, queue: [] } : { name: "configure" },
  );
  const [configError, setConfigError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [lastPayload, setLastPayload] = useState<AICreatePlanSuggestionPayload | null>(null);

  const clientNameMap = new Map(
    clients.map((connection) => [connection.id, formatClientLabel(connection)]),
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AIPlanConfigFormData>({
    resolver: zodResolver(aiPlanConfigSchema),
    defaultValues: { ...defaultAIPlanConfigValues, kind: defaultKind },
  });

  useEffect(() => {
    if (clients.length === 0) return;
    reset({
      ...defaultAIPlanConfigValues,
      kind: defaultKind,
      membershipId: clients[0]?.id ?? "",
    });
  }, [clients, reset, defaultKind]);

  const startFlow = async (payload: AICreatePlanSuggestionPayload) => {
    setIsSubmitting(true);
    setConfigError(null);
    setUpgradeRequired(false);
    try {
      const created = await createPlanSuggestion(payload);
      setLastPayload(payload);
      setFlow({ name: "queued", created });
    } catch (error) {
      setConfigError(getApiErrorMessage(error, "We could not start the AI generation. Please try again."));
      setUpgradeRequired(getApiStatus(error) === 403);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: AIPlanConfigFormData) => {
    const payload: AICreatePlanSuggestionPayload = {
      membershipId: values.membershipId,
      kind: values.kind,
      durationWeeks: 1,
      daysPerWeek: values.daysPerWeek ? Number(values.daysPerWeek) : undefined,
      goal: values.goal || undefined,
      coachNotes: values.coachNotes || undefined,
    };
    await startFlow(payload);
  };

  const resetFlow = () => {
    setFlow({ name: "configure" });
    setConfigError(null);
    setUpgradeRequired(false);
  };

  const retryQueue = () => {
    const target = lastPayload;
    if (!target) {
      resetFlow();
      return;
    }
    setFlow({ name: "configure" });
    void startFlow(target);
  };

  // Polling lives in the (keyed) QueuedStep; when its suggestion is ready it
  // fetches the full detail and hands it to us with the ready queue around it.
  const handleReady = async (detail: AIPlanSuggestionDetail) => {
    const list = await listPlanSuggestions({
      membershipId: detail.membershipId,
      kind: detail.kind,
      status: "ready",
      limit: 20,
    });
    setFlow({ name: "review", detail, queue: list.docs.filter((s) => s.id !== detail.id) });
  };

  const handleAccept = async (payload: { name: string; startDate: string }) => {
    if (flow.name !== "review") return;
    setIsAccepting(true);
    try {
      await acceptPlanSuggestion(flow.detail.id, payload);
      const detail = await getPlanSuggestion(flow.detail.id);
      toast.success("Plan created as a draft.");
      setFlow({ name: "success", detail });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We could not build this plan. It is still here if you want to try again."),
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async (reason: string) => {
    if (flow.name !== "review") return;
    setIsDeclining(true);
    try {
      await declinePlanSuggestion(flow.detail.id, { reason });
      toast.success("Suggestion declined.");

      const list = await listPlanSuggestions({
        membershipId: flow.detail.membershipId,
        kind: flow.detail.kind,
        status: "ready",
        limit: 20,
      });
      const remaining = list.docs.filter((s) => s.id !== flow.detail.id);
      if (remaining.length > 0) {
        const detail = await getPlanSuggestion(remaining[0].id);
        setFlow({ name: "review", detail, queue: remaining.filter((s) => s.id !== remaining[0].id) });
      } else {
        setFlow({ name: "configure" });
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We could not decline this suggestion. It is still available."),
      );
    } finally {
      setIsDeclining(false);
    }
  };

  const openCreatedPlan = async () => {
    if (flow.name !== "success") return;
    const targetId = flow.detail.kind === "training" ? flow.detail.createdProgramId : flow.detail.createdPlanId;
    if (!targetId) {
      toast.error("The new plan could not be located. It may still be building.");
      return;
    }
    setIsOpening(true);
    try {
      const created =
        flow.detail.kind === "training" ? await getClientProgram(targetId) : await getNutritionPlan(targetId);
      await onCreated(created);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We could not open the new plan. It may still be building."));
    } finally {
      setIsOpening(false);
    }
  };

  let cardMaxWidth = "max-w-xl";
  if (flow.name === "review") cardMaxWidth = "max-w-3xl";
  if (flow.name === "success") cardMaxWidth = "max-w-lg";

  let body: ReactElement;

  if (flow.name === "configure") {
    body = (
      <ConfigureStep
        clients={clients}
        isSubmitting={isSubmitting}
        configError={configError}
        upgradeRequired={upgradeRequired}
        register={register}
        control={control}
        errors={errors}
        onSubmit={handleSubmit(onSubmit)}
        onClose={onClose}
        onUpgrade={onUpgrade}
      />
    );
  } else if (flow.name === "queued") {
    body = (
      <QueuedStep
        key={flow.created.suggestionId}
        created={flow.created}
        onReady={handleReady}
        onRetryRequest={retryQueue}
        onReset={resetFlow}
        onClose={onClose}
      />
    );
  } else if (flow.name === "review") {
    body = (
      <div className="flex min-h-0 flex-1 flex-col">
        <CloseOnlyBar onClose={onClose} />
        <AIPlanSuggestionReview
          key={flow.detail.id}
          detail={flow.detail}
          clientName={clientNameMap.get(flow.detail.membershipId) ?? "the client"}
          accepting={isAccepting}
          declining={isDeclining}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      </div>
    );
  } else {
    body = (
      <SuccessStep
        detail={flow.detail}
        opening={isOpening}
        onOpen={openCreatedPlan}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className={`w-full ${cardMaxWidth} max-h-[90vh] overflow-hidden rounded-3xl border border-border bg-background shadow-2xl modal-card flex flex-col`}
    >
      {body}
    </div>
  );
}

export function AIPlanFlowModal(props: Props) {
  if (!props.open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={props.onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <AIPlanFlowModalContent
          clients={props.clients}
          defaultKind={props.defaultKind}
          onClose={props.onClose}
          onCreated={props.onCreated}
          initialDetail={props.initialDetail}
          onUpgrade={props.onUpgrade}
        />
      </div>
    </div>,
    document.body,
  );
}

export default AIPlanFlowModal;
