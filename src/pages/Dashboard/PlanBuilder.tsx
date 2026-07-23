import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { getApiErrorMessage } from "@/lib/api";
import { getClientProgram } from "@/services/plans";
import type { ClientProgramTree } from "@/types/plans";

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
        return `${value.length}`;
    }

    return String(value);
}

export default function PlanBuilder() {
    const { programId } = useParams();
    const location = useLocation();
    const [program, setProgram] = useState<ClientProgramTree | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const clientName = (location.state as { clientName?: string } | null)?.clientName ?? "Unknown client";

    useEffect(() => {
        let isActive = true;

        if (!programId) {
            setProgram(null);
            setError("Missing plan id.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError("");

        void (async () => {
            try {
                const data = await getClientProgram(programId);

                if (!isActive) {
                    return;
                }

                setProgram(data);
            } catch (fetchError) {
                if (isActive) {
                    setError(
                        getApiErrorMessage(
                            fetchError,
                            "We could not load this plan.",
                        ),
                    );
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            isActive = false;
        };
    }, [programId]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Plan Builder
                    </p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                        {program
                            ? `${clientName} · ${program.name} · ${program.status}`
                            : "Loading plan..."}
                    </h1>
                </div>
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
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-(--shadow-card)">
                        <table className="w-full border-collapse text-sm">
                            <tbody>
                                {[
                                    { label: "Program ID", value: program.id },
                                    { label: "Name", value: program.name },
                                    { label: "Program type", value: program.programType },
                                    { label: "Membership ID", value: program.membershipId },
                                    { label: "Template ID", value: program.sourceTemplateId },
                                    { label: "Goal", value: program.goal },
                                    { label: "Difficulty", value: program.difficulty },
                                    { label: "Duration weeks", value: program.durationWeeks },
                                    { label: "Start date", value: program.startDate },
                                    { label: "End date", value: program.endDate },
                                    { label: "Status", value: program.status },
                                    { label: "Archived", value: program.isArchived },
                                    { label: "Created at", value: program.createdAt },
                                    { label: "Updated at", value: program.updatedAt },
                                    { label: "Schedule phase", value: program.schedulePhase },
                                ].map(({ label, value }) => (
                                    <tr key={label} className="border-b border-border last:border-b-0">
                                        <th className="w-56 bg-muted/30 px-4 py-3 text-left font-semibold text-foreground">
                                            {label}
                                        </th>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {formatValue(value)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-4">
                        {program.weeks.map((week) => (
                            <div
                                key={week.id}
                                className="overflow-hidden rounded-3xl border border-border bg-card shadow-(--shadow-card)"
                            >
                                <div className="border-b border-border px-4 py-3">
                                    <h2 className="text-lg font-bold text-foreground">Week {week.weekNumber}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {week.notes ? week.notes : "No notes"}
                                    </p>
                                </div>

                                <table className="w-full border-collapse text-sm">
                                    <thead className="bg-muted/30 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Day</th>
                                            <th className="px-4 py-3 font-semibold">Name</th>
                                            <th className="px-4 py-3 font-semibold">Rest</th>
                                            <th className="px-4 py-3 font-semibold">Scheduled</th>
                                            <th className="px-4 py-3 font-semibold">Exercises</th>
                                            <th className="px-4 py-3 font-semibold">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {week.days.map((day) => (
                                            <tr key={day.id} className="border-t border-border">
                                                <td className="px-4 py-3 font-medium text-foreground">
                                                    Day {day.dayNumber}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {day.name ?? "—"}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {day.isRestDay ? "Yes" : "No"}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {day.scheduledDate}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {day.exercises.length}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {day.notes ?? "—"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
