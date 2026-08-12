import { useState } from "react";
import { Utensils } from "lucide-react";
import { MealsLibraryContent } from "./MealsLibraryContent";

export function MealsLibrarySidebar({ refreshVersion }: { refreshVersion: number }) {
  const [started, setStarted] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Utensils className="w-4 h-4 text-brand" /> Meals Library
        </h3>
      </div>

      {started ? (
        <MealsLibraryContent refreshVersion={refreshVersion} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            The library loads on demand to keep this page fast — then stays cached for the session.
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
          >
            Load meals library
          </button>
        </div>
      )}
    </>
  );
}