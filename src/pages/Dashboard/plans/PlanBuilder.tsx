import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import HorizontalScrollBar from "@/components/HorizontalScrollBar";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { CalendarDays, MonitorSmartphone, Send } from "lucide-react";
import { toast } from "react-toastify";
import AddDayExerciseModal from "@/components/modals/plans/AddDayExerciseModal";
import { ConfirmDialog } from "@/components/modals/common/ConfirmDialog";
import CreateExerciseAndAddToDayModal from "@/components/modals/plans/CreateExerciseAndAddToDayModal";
import EditPlanDayModal from "@/components/modals/plans/EditPlanDayModal";
import EditPlannedExerciseModal from "@/components/modals/plans/EditPlannedExerciseModal";
import type { ClientProgramDay, PlannedExercise } from "@/types/plans";
import type { Exercise } from "@/types/exercise";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DayCard } from "@/components/plans/builder/DayCard";
import { ExerciseLibraryPreview } from "@/components/plans/builder/ExerciseLibraryPreview";
import { ExerciseLibrarySidebar } from "@/components/plans/builder/ExerciseLibrarySidebar";
import type {
    BuilderDay,
    BuilderPlannedExercise,
} from "@/components/plans/builder/builder-types";
import { formatDate, getOverlayExercise } from "@/components/plans/builder/builder-utils";
import { usePlanBuilderData } from "@/hooks/plans/usePlanBuilderData";

export default function PlanBuilder() {
    const daysScrollContainerRef = useRef<HTMLDivElement | null>(null);
    const { programId } = useParams();
    const location = useLocation();
    const [pendingDrop, setPendingDrop] = useState<{
        exercise: Exercise;
        dayId: string;
        dayLabel: string;
        defaultPosition: number;
    } | null>(null);
    const [createExerciseTarget, setCreateExerciseTarget] = useState<{
        dayId: string;
        dayLabel: string;
        defaultPosition: number;
    } | null>(null);
    const [dayToEdit, setDayToEdit] = useState<BuilderDay | null>(null);
    const [exerciseToEdit, setExerciseToEdit] = useState<BuilderPlannedExercise | null>(null);
    const [exerciseToDelete, setExerciseToDelete] = useState<BuilderPlannedExercise | null>(null);
    const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
    // Bumped after creating an exercise so the (lazily loaded) library refetches
    const [libraryVersion, setLibraryVersion] = useState(0);
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" && window.matchMedia("(max-width: 1024px)").matches,
    );

    const {
        program,
        builderWeeks,
        selectedWeekId,
        setSelectedWeekId,
        selectedWeek,
        isLoading,
        error,
        isPublishing,
        reorderingDayId,
        updateLocalDay,
        findDayById,
        addExercise,
        replaceExercise,
        removeExercise,
        toggleRestDay,
        reorderExercises,
        publishPlan,
    } = usePlanBuilderData(programId);

    const clientName = (location.state as { clientName?: string } | null)?.clientName ?? "Unknown client";

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1024px)");
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    function handleDragEnd(event: any) {
        if (event.canceled) {
            return;
        }

        const { source, target } = event.operation;
        const sourceData = source?.data;
        const targetData = target?.data;
        if (!sourceData || !target) {
            return;
        }

        const exercise = getOverlayExercise(sourceData);
        if (exercise) {
            if (!targetData || targetData.kind !== "day") {
                return;
            }

            const targetDayId = String(target.id);
            const targetDay = findDayById(targetDayId);

            if (!targetDay) {
                toast.error("We could not find that day.");
                return;
            }

            if (targetDay.isRestDay) {
                toast.error("Unmark the day as rest before adding exercises.");
                return;
            }

            setPendingDrop({
                exercise,
                dayId: targetDayId,
                dayLabel: `Day ${targetDay.dayNumber}${targetDay.name ? ` · ${targetDay.name}` : ""}`,
                defaultPosition: targetDay.exercises.length + 1,
            });
            return;
        }

        const draggedExercise = sourceData as { kind?: string; exercise?: BuilderPlannedExercise; dayId?: string };
        const targetExercise = targetData as { kind?: string; exercise?: BuilderPlannedExercise; dayId?: string };

        if (draggedExercise.kind !== "planned-exercise" || targetExercise.kind !== "planned-exercise") {
            return;
        }

        if (!draggedExercise.exercise || !targetExercise.exercise || draggedExercise.dayId !== targetExercise.dayId) {
            return;
        }

        const draggedExerciseItem = draggedExercise.exercise;
        const targetExerciseItem = targetExercise.exercise;

        if (draggedExerciseItem.id === targetExerciseItem.id) {
            return;
        }

        reorderExercises(draggedExercise.dayId!, draggedExerciseItem.id, targetExerciseItem.id);
    }

    function handleAddSuccess(plannedExercise: PlannedExercise) {
        addExercise(plannedExercise);
        setPendingDrop(null);
    }

    function handleCreateSuccess(plannedExercise: PlannedExercise) {
        addExercise(plannedExercise);
        setCreateExerciseTarget(null);
        setLibraryVersion((v) => v + 1);
    }

    function handleDayUpdated(updatedDay: Partial<ClientProgramDay> & { id: string }) {
        updateLocalDay(updatedDay.id, updatedDay as Partial<BuilderDay>);
        setDayToEdit(null);
    }

    function handleExerciseUpdated(updatedExercise: PlannedExercise) {
        replaceExercise(updatedExercise);
        setExerciseToEdit(null);
    }

    function handleDeleteExercise() {
        if (!exerciseToDelete || !program?.id) {
            return;
        }

        void removeExercise(exerciseToDelete).then((ok) => {
            if (ok) setExerciseToDelete(null);
        });
    }

    async function handlePublishConfirm() {
        const ok = await publishPlan();
        if (ok) setIsPublishConfirmOpen(false);
    }

    if (isMobile) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand/10 text-brand">
                    <MonitorSmartphone className="size-8" />
                </div>
                <div className="max-w-xs">
                    <h2 className="text-xl font-black tracking-tight text-foreground">
                        Best on a larger screen
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        The Plan Builder uses an advanced drag-and-drop workout editor designed for
                        precision. For the best experience, open it on a tablet or desktop.
                    </p>
                </div>
                <Link
                    to="/dashboard/plans"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    ← Back to plans
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold uppercase text-muted-foreground">
                            Plan Builder
                        </p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                            {program ? (
                                <div>
                                    <div>{program.name}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-base font-normal text-muted-foreground">
                                        <span>For {clientName}</span>
                                        <span>·</span>
                                        <span>{program.goal}</span>
                                        <span>·</span>
                                        <span>{program.difficulty}</span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-muted-foreground">
                                        <span>
                                            <span className="font-semibold text-foreground">Start date</span>{": "}
                                            {formatDate(program.startDate)}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-foreground">End date</span>{": "}
                                            {formatDate(program.endDate)}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-foreground">Status</span>{": "}
                                            {program.status ?? "—"}
                                        </span>
                                        <span>
                                            <span className="font-semibold text-foreground">Archived</span>{": "}
                                            {program.isArchived ? "Yes" : "No"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                "Loading plan..."
                            )}
                        </h1>
                    </div>

                    {/* Publish button — draft only */}
                    {program?.status === "draft" && (
                        <button
                            type="button"
                            onClick={() => setIsPublishConfirmOpen(true)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:opacity-90"
                        >
                            <Send className="size-4" />
                            Publish plan
                        </button>
                    )}
                </div>

                <div>
                    <Link
                        to="/dashboard/plans"
                        className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                        ← Back to plans
                    </Link>
                </div>

                {isLoading && (
                    <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                        Loading plan...
                    </div>
                )}

                {!isLoading && error && (
                    <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
                        {error}
                    </div>
                )}

                {!isLoading && program && (
                    <DragDropProvider onDragEnd={handleDragEnd}>
                        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                            <aside className="flex max-h-[calc(100vh+10rem)] flex-col rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
                                <ExerciseLibrarySidebar refreshVersion={libraryVersion} />
                            </aside>

                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card px-4 py-3 shadow-(--shadow-card)">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                            Weeks
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Choose the week you want to edit.
                                        </p>
                                    </div>

                                    <Select
                                        value={selectedWeekId}
                                        onValueChange={setSelectedWeekId}
                                        disabled={!builderWeeks.length}
                                    >
                                        <SelectTrigger className="min-w-44 rounded-2xl border-border bg-background px-4 py-2.5">
                                            <SelectValue placeholder="Select week" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {builderWeeks.map((week) => (
                                                <SelectItem key={week.id} value={week.id}>
                                                    Week {week.weekNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedWeek ? (
                                    <div className="rounded-3xl border border-border bg-card p-4 shadow-(--shadow-card)">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">
                                                    Week {selectedWeek.weekNumber}
                                                </h2>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {selectedWeek.notes ? selectedWeek.notes : "No notes"}
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                                                <CalendarDays className="size-3.5" />
                                                {selectedWeek.days.length} days
                                            </div>
                                        </div>

                                        {/* Draggable Horizontal Scrollbar */}
                                        <HorizontalScrollBar scrollContainerRef={daysScrollContainerRef} className="mt-4" />

                                        <div ref={daysScrollContainerRef} className="mt-3 overflow-x-auto pb-2 no-scrollbar">
                                            <div className="flex min-w-max items-start gap-3">
                                                {selectedWeek.days.map((day) => (
                                                    <DayCard
                                                        key={day.id}
                                                        day={day}
                                                        weekNumber={selectedWeek.weekNumber}
                                                        programId={programId ?? ""}
                                                        onEdit={(nextDay) => setDayToEdit(nextDay)}
                                                        onToggleRestDay={(nextDay) => void toggleRestDay(nextDay)}
                                                        isReordering={reorderingDayId === day.id}
                                                        onCreateExercise={(nextDay) =>
                                                            setCreateExerciseTarget({
                                                                dayId: nextDay.id,
                                                                dayLabel: `Day ${nextDay.dayNumber}${nextDay.name ? ` · ${nextDay.name}` : ""}`,
                                                                defaultPosition: nextDay.exercises.length + 1,
                                                            })
                                                        }
                                                        onExerciseEdit={(exercise) => setExerciseToEdit(exercise)}
                                                        onExerciseDelete={(exercise) => setExerciseToDelete(exercise)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
                                        No weeks available for this plan.
                                    </div>
                                )}
                            </div>
                        </div>

                        <DragOverlay>
                            {(source) => {
                                const exercise = getOverlayExercise(source.data);
                                return exercise ? <ExerciseLibraryPreview exercise={exercise} /> : null;
                            }}
                        </DragOverlay>
                    </DragDropProvider>
                )}

                <AddDayExerciseModal
                    open={!!pendingDrop}
                    programId={program?.id ?? null}
                    programDayId={pendingDrop?.dayId ?? null}
                    dayLabel={pendingDrop?.dayLabel ?? ""}
                    exercise={pendingDrop?.exercise ?? null}
                    defaultPosition={pendingDrop?.defaultPosition ?? 1}
                    onClose={() => setPendingDrop(null)}
                    onAdded={handleAddSuccess}
                />

                <EditPlanDayModal
                    open={!!dayToEdit}
                    programId={program?.id ?? null}
                    day={dayToEdit}
                    onClose={() => setDayToEdit(null)}
                    onUpdated={handleDayUpdated}
                />

                <EditPlannedExerciseModal
                    key={exerciseToEdit?.id ?? "closed"}
                    open={!!exerciseToEdit}
                    programId={program?.id ?? null}
                    exercise={exerciseToEdit}
                    onClose={() => setExerciseToEdit(null)}
                    onUpdated={handleExerciseUpdated}
                />

                <CreateExerciseAndAddToDayModal
                    open={!!createExerciseTarget}
                    programId={program?.id ?? null}
                    programDayId={createExerciseTarget?.dayId ?? null}
                    dayLabel={createExerciseTarget?.dayLabel ?? ""}
                    defaultPosition={createExerciseTarget?.defaultPosition ?? 1}
                    onClose={() => setCreateExerciseTarget(null)}
                    onAdded={handleCreateSuccess}
                />

                {exerciseToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 backdrop-blur-sm">
                        <div className="w-full max-w-sm rounded-3xl border border-border bg-background p-6 shadow-2xl">
                            <h3 className="text-lg font-bold text-foreground">Delete exercise?</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                This will remove {exerciseToDelete.exerciseName} from the day.
                            </p>
                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setExerciseToDelete(null)}
                                    className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteExercise}
                                    className="rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground transition hover:opacity-90"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={isPublishConfirmOpen}
                title="Publish this plan?"
                description={
                    program
                        ? `"${program.name}" will be sent to ${clientName}. You can still cancel it afterwards.`
                        : ""
                }
                confirmLabel="Publish plan"
                cancelLabel="Not yet"
                pendingLabel="Publishing…"
                isConfirming={isPublishing}
                onConfirm={() => void handlePublishConfirm()}
                onCancel={() => setIsPublishConfirmOpen(false)}
            />
        </>
    );
}