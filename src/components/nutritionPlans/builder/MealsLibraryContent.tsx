import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { useMealsData } from "@/hooks/nutrition/useMealsData";
import { LibraryMealCard } from "./LibraryMealCard";

// Slot label chips shown in the sidebar (client-side filter by meal name keywords)
const SLOT_CHIPS = [
  { label: "Breakfast", keywords: ["breakfast", "oats", "egg", "toast", "morning"] },
  { label: "Lunch", keywords: ["lunch", "chicken", "rice", "bowl", "wrap"] },
  { label: "Dinner", keywords: ["dinner", "beef", "salmon", "potato", "steak"] },
  { label: "Snack", keywords: ["snack", "yogurt", "bar", "nut", "fruit"] },
  { label: "Pre-WO", keywords: ["pre", "workout", "shake", "banana", "energy"] },
  { label: "Post-WO", keywords: ["post", "recovery", "protein", "whey"] },
] as const;

export function MealsLibraryContent({ refreshVersion }: { refreshVersion: number }) {
  const {
    filteredMeals,
    loading: mealsLoading,
    filters: mealFilters,
    handleFiltersChange,
    refreshData,
  } = useMealsData();

  const [slotFilter, setSlotFilter] = useState<string>("");

  const displayedMeals = useMemo(() => {
    if (!slotFilter) return filteredMeals;
    const chip = SLOT_CHIPS.find((c) => c.label === slotFilter);
    if (!chip) return filteredMeals;
    return filteredMeals.filter((m) =>
      chip.keywords.some((kw) =>
        m.name.toLowerCase().includes(kw) ||
        (m.description ?? "").toLowerCase().includes(kw),
      ),
    );
  }, [filteredMeals, slotFilter]);

  useEffect(() => {
    if (refreshVersion > 0) void refreshData();
  }, [refreshVersion, refreshData]);

  return (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search meals..."
          value={mealFilters.search}
          onChange={(e) => handleFiltersChange({ search: e.target.value })}
          className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-background border-border outline-none focus:border-brand"
        />
      </div>

      {/* Dietary Tag Filter */}
      <div>
        <label className="block mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Dietary Tag
        </label>
        <select
          value={mealFilters.dietaryTag}
          onChange={(e) => handleFiltersChange({ dietaryTag: e.target.value as any })}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-brand"
        >
          <option value="">All tags</option>
          <option value="halal">Halal</option>
          <option value="vegan">Vegan</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="gluten_free">Gluten-Free</option>
          <option value="keto">Keto</option>
          <option value="low_carb">Low Carb</option>
        </select>
      </div>

      {/* Slot / Category chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Meal Category
          </span>
          {slotFilter && (
            <button
              type="button"
              onClick={() => setSlotFilter("")}
              className="flex items-center gap-0.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["Breakfast", "Lunch", "Dinner", "Snack", "Pre-WO", "Post-WO"] as const).map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setSlotFilter((prev) => (prev === label ? "" : label))}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${slotFilter === label
                ? "bg-brand text-brand-foreground shadow-sm"
                : "bg-muted/60 border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-2 max-h-[40rem] overflow-y-auto pr-1">
        {mealsLoading ? (
          <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading meals…
          </div>
        ) : displayedMeals.length > 0 ? (
          displayedMeals.map((meal) => <LibraryMealCard key={meal.id} meal={meal} />)
        ) : (
          <p className="text-xs text-center text-muted-foreground p-4">No meals found.</p>
        )}
      </div>
    </>
  );
}