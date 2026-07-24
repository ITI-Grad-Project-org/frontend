import { RefreshCw, Search } from "lucide-react";
import {
    planDifficultyOptions,
    planGoalOptions,
} from "@/schemas/plans";
import type { PlansFilters as PlansFiltersState } from "@/hooks/usePlansData";
import { formatFilterLabel } from "@/hooks/usePlansData";

interface PlansFiltersProps {
    filters: PlansFiltersState;
    onFiltersChange: (next: Partial<PlansFiltersState>) => void;
    onResetFilters: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    totalPrograms: number;
    filteredPrograms: number;
}

export function PlansFilters({
    filters,
    onFiltersChange,
    onResetFilters,
    onRefresh,
    isRefreshing,
    totalPrograms,
    filteredPrograms,
}: PlansFiltersProps) {
    return (
        <section className="rounded-3xl p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <h2 className="text-lg font-bold">Programs list</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        All client workout programs in your tenant, including drafts.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onRefresh}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-4">
                <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
                    <label className="block xl:col-span-1">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Search</span>
                        <div className="flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-4 py-3 focus-within:border-brand">
                            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <input
                                value={filters.searchTerm}
                                onChange={(event) => onFiltersChange({ searchTerm: event.target.value })}
                                placeholder="Search by plan or client"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                        </div>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Goal</span>
                        <select
                            value={filters.goal}
                            onChange={(event) => onFiltersChange({ goal: event.target.value })}
                            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
                        >
                            <option value="all">All goals</option>
                            {planGoalOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Difficulty</span>
                        <select
                            value={filters.difficulty}
                            onChange={(event) => onFiltersChange({ difficulty: event.target.value })}
                            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
                        >
                            <option value="all">All difficulties</option>
                            {planDifficultyOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Status</span>
                        <select
                            value={filters.status}
                            onChange={(event) => onFiltersChange({ status: event.target.value })}
                            className="w-full rounded-2xl border-2 border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
                        >
                            <option value="all">All statuses</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 h-fit self-end">
                        <input
                            type="checkbox"
                            checked={filters.showArchived}
                            onChange={(event) => onFiltersChange({ showArchived: event.target.checked })}
                            className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                        />
                        <div>
                            {/* <span className="block text-xs font-semibold text-muted-foreground">Archived</span> */}
                            <span className="block text-sm text-foreground">
                                Show archived plans
                            </span>
                        </div>
                    </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1 font-medium">
                        Showing {filteredPrograms} of {totalPrograms}
                    </span>
                    {filters.goal !== "all" && (
                        <span className="rounded-full bg-muted px-3 py-1 font-medium">
                            Goal: {formatFilterLabel(filters.goal)}
                        </span>
                    )}
                    {filters.difficulty !== "all" && (
                        <span className="rounded-full bg-muted px-3 py-1 font-medium">
                            Difficulty: {formatFilterLabel(filters.difficulty)}
                        </span>
                    )}
                    {filters.status !== "all" && (
                        <span className="rounded-full bg-muted px-3 py-1 font-medium">
                            Status: {formatFilterLabel(filters.status)}
                        </span>
                    )}
                    {filters.showArchived && (
                        <span className="rounded-full bg-muted px-3 py-1 font-medium">
                            Archived: Showing archived plans
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={onResetFilters}
                        className="rounded-full border border-border bg-chip-mint px-3 py-1 font-semibold text-foreground transition hover:opacity-90"
                    >
                        Reset filters
                    </button>
                </div>
            </div>
        </section>
    );
}
