import { useState } from "react";
import { ExerciseLibraryContent } from "./ExerciseLibraryContent";

export function ExerciseLibrarySidebar({ refreshVersion }: { refreshVersion: number }) {
    const [started, setStarted] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Exercise Library
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Drag one card onto a day.
                    </p>
                </div>
            </div>

            {started ? (
                <ExerciseLibraryContent refreshVersion={refreshVersion} />
            ) : (
                <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-2 py-8 text-center">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        The library loads on demand to keep this page fast — then stays cached for the session.
                    </p>
                    <button
                        type="button"
                        onClick={() => setStarted(true)}
                        className="rounded-2xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
                    >
                        Load exercise library
                    </button>
                </div>
            )}
        </>
    );
}