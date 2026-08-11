// src/pages/Dashboard/Meals.tsx
import { useState } from "react";
import { Plus, Utensils, Apple } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

// Food Components & Hooks
import { FoodFilters } from "@/components/nutrition/FoodFilters";
import { FoodGrid } from "@/components/nutrition/FoodGrid";
import AddEditFoodModal from "@/components/modals/AddEditFoodModal";
import FoodDetailsModal from "@/components/modals/FoodDetailsModal";
import { useFoodsData } from "@/hooks/useFoodsData";

// Meal Components & Hooks
import { MealFilters } from "@/components/nutrition/MealFilters";
import { MealGrid } from "@/components/nutrition/MealGrid";
import AddEditMealModal from "@/components/modals/AddEditMealModal";
import MealDetailsModal from "@/components/modals/MealDetailsModal";
import { useMealsData } from "@/hooks/useMealsData";

import type { Food, Meal, CreateFoodDto, UpdateFoodDto, CreateMealDto, UpdateMealDto, ReplaceMealItemsDto } from "@/types/nutrition";

export default function Meals() {
  const [activeTab, setActiveTab] = useState<"meals" | "foods">("meals");

  // Foods state
  const foodsHook = useFoodsData();
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [foodToEdit, setFoodToEdit] = useState<Food | null>(null);
  const [viewingFood, setViewingFood] = useState<Food | null>(null);

  // Meals state
  const mealsHook = useMealsData();
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | null>(null);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);

  // Food handlers
  const handleOpenAddFood = () => {
    setFoodToEdit(null);
    setIsFoodModalOpen(true);
  };

  const handleOpenEditFood = (food: Food) => {
    setFoodToEdit(food);
    setIsFoodModalOpen(true);
  };

  const handleSaveFood = async (
    dto: CreateFoodDto | UpdateFoodDto,
    isEditing: boolean,
    foodId?: string
  ) => {
    if (isEditing && foodId) {
      await foodsHook.handleUpdateFood(foodId, dto as UpdateFoodDto);
    } else {
      await foodsHook.handleCreateFood(dto as CreateFoodDto);
    }
  };

  // Meal handlers
  const handleOpenAddMeal = () => {
    setMealToEdit(null);
    setIsMealModalOpen(true);
  };

  const handleOpenEditMeal = (meal: Meal) => {
    setMealToEdit(meal);
    setIsMealModalOpen(true);
  };

  const handleSaveMeal = async (
    metaDto: CreateMealDto | UpdateMealDto,
    recipeDto: ReplaceMealItemsDto,
    isEditing: boolean,
    mealId?: string
  ) => {
    if (isEditing && mealId) {
      await mealsHook.handleUpdateMeal(mealId, metaDto as UpdateMealDto, recipeDto);
    } else {
      await mealsHook.handleCreateMeal(metaDto as CreateMealDto);
    }
  };

  // Pagination states
  const [foodPage, setFoodPage] = useState(1);
  const FOOD_PAGE_SIZE = 8;

  const [mealPage, setMealPage] = useState(1);
  const MEAL_PAGE_SIZE = 8;

  // Reset pagination when filters change
  const handleFoodFiltersChangeWithReset = (newFilters: Parameters<typeof foodsHook.handleFiltersChange>[0]) => {
    foodsHook.handleFiltersChange(newFilters);
    setFoodPage(1);
  };

  const handleMealFiltersChangeWithReset = (newFilters: Parameters<typeof mealsHook.handleFiltersChange>[0]) => {
    mealsHook.handleFiltersChange(newFilters);
    setMealPage(1);
  };

  // Paginated foods slice
  const totalFoodPages = Math.ceil(foodsHook.filteredFoods.length / FOOD_PAGE_SIZE) || 1;
  const paginatedFoods = foodsHook.filteredFoods.slice(
    (foodPage - 1) * FOOD_PAGE_SIZE,
    foodPage * FOOD_PAGE_SIZE
  );

  // Paginated meals slice
  const totalMealPages = Math.ceil(mealsHook.filteredMeals.length / MEAL_PAGE_SIZE) || 1;
  const paginatedMeals = mealsHook.filteredMeals.slice(
    (mealPage - 1) * MEAL_PAGE_SIZE,
    mealPage * MEAL_PAGE_SIZE
  );

  // Filter active foods to populate meal recipe food dropdown
  const activeFoods = foodsHook.foods.filter((f) => f.isActive);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black font-display text-foreground sm:text-4xl">
            Nutrition Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reusable food ingredients and meal recipes for your coaching plans.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={handleOpenAddFood}
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-success text-success-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm sm:w-auto"
          >
            <Apple className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
          <button
            onClick={handleOpenAddMeal}
            className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm sm:w-auto"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Create Meal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("meals")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer sm:flex-none sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm ${activeTab === "meals"
            ? "bg-ink text-ink-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Meals Library</span>
          <Chip className="font-bold ml-0.5 px-2 py-0.5 text-[11px] sm:ml-1 sm:px-3 sm:py-3 sm:text-xs">{mealsHook.filteredMeals.length}</Chip>
        </button>

        <button
          onClick={() => setActiveTab("foods")}
          className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer sm:flex-none sm:gap-2.5 sm:px-5 sm:py-3 sm:text-sm ${activeTab === "foods"
            ? "bg-ink text-ink-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <Apple className="w-4 h-4" />
          <span>Food Items</span>
          <Chip className="font-bold ml-0.5 px-2 py-0.5 text-[11px] sm:ml-1 sm:px-3 sm:py-3 sm:text-xs">{foodsHook.filteredFoods.length}</Chip>
        </button>
      </div>

      {/* Meals Tab Content */}
      {activeTab === "meals" && (
        <section className="space-y-6">
          <MealFilters
            filters={mealsHook.filters}
            onFiltersChange={handleMealFiltersChangeWithReset}
            onResetFilters={() => {
              mealsHook.resetFilters();
              setMealPage(1);
            }}
            onRefresh={() => void mealsHook.refreshData()}
            isRefreshing={mealsHook.isRefreshing}
            totalMeals={mealsHook.meals.length}
            filteredCount={mealsHook.filteredMeals.length}
          />

          <MealGrid
            loading={mealsHook.loading}
            error={mealsHook.error}
            meals={paginatedMeals}
            hasActiveFilter={mealsHook.hasActiveFilter}
            currentPage={mealPage}
            totalPages={totalMealPages}
            onPageChange={setMealPage}
            onRetry={mealsHook.refreshData}
            onOpenAdd={handleOpenAddMeal}
            onView={setViewingMeal}
            onEdit={handleOpenEditMeal}
            onArchive={mealsHook.actions.setMealToArchive}
            onUnarchive={mealsHook.handleUnarchive}
          />
        </section>
      )}

      {/* Food Items Tab Content */}
      {activeTab === "foods" && (
        <section className="space-y-6">
          <FoodFilters
            filters={foodsHook.filters}
            onFiltersChange={handleFoodFiltersChangeWithReset}
            onResetFilters={() => {
              foodsHook.resetFilters();
              setFoodPage(1);
            }}
            onRefresh={() => void foodsHook.refreshData()}
            isRefreshing={foodsHook.isRefreshing}
            totalFoods={foodsHook.foods.length}
            filteredCount={foodsHook.filteredFoods.length}
          />

          <FoodGrid
            loading={foodsHook.loading}
            error={foodsHook.error}
            foods={paginatedFoods}
            hasActiveFilter={foodsHook.hasActiveFilter}
            currentPage={foodPage}
            totalPages={totalFoodPages}
            onPageChange={setFoodPage}
            onRetry={foodsHook.refreshData}
            onOpenAdd={handleOpenAddFood}
            onView={setViewingFood}
            onEdit={handleOpenEditFood}
            onArchive={foodsHook.actions.setFoodToArchive}
            onUnarchive={foodsHook.handleUnarchive}
          />
        </section>
      )}

      {/* Modals & Dialogs */}

      {/* Add / Edit Food Modal */}
      <AddEditFoodModal
        open={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        food={foodToEdit}
        onSave={handleSaveFood}
      />

      {/* Food Details Modal */}
      <FoodDetailsModal
        food={viewingFood}
        onClose={() => setViewingFood(null)}
        onEdit={(food) => {
          setViewingFood(null);
          handleOpenEditFood(food);
        }}
      />

      {/* Archive Food Confirm Dialog */}
      <ConfirmDialog
        open={foodsHook.actions.foodToArchive !== null}
        title="Archive Food Item?"
        description={`"${foodsHook.actions.foodToArchive?.name}" will be archived and hidden from active pickers. Existing meal recipes using this food will remain intact.`}
        confirmLabel="Archive"
        isConfirming={foodsHook.actions.isArchiving}
        onConfirm={foodsHook.actions.handleArchiveConfirm}
        onCancel={() => foodsHook.actions.setFoodToArchive(null)}
      />

      {/* Add / Edit Meal Modal */}
      <AddEditMealModal
        open={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        meal={mealToEdit}
        availableFoods={activeFoods}
        onSave={handleSaveMeal}
      />

      {/* Meal Details Modal */}
      <MealDetailsModal
        meal={viewingMeal}
        onClose={() => setViewingMeal(null)}
        onEdit={(meal) => {
          setViewingMeal(null);
          handleOpenEditMeal(meal);
        }}
      />

      {/* Archive Meal Confirm Dialog */}
      <ConfirmDialog
        open={mealsHook.actions.mealToArchive !== null}
        title="Archive Meal Recipe?"
        description={`"${mealsHook.actions.mealToArchive?.name}" will be archived and hidden from normal library choices. Existing client plans will retain their snapshot.`}
        confirmLabel="Archive"
        isConfirming={mealsHook.actions.isArchiving}
        onConfirm={mealsHook.actions.handleArchiveConfirm}
        onCancel={() => mealsHook.actions.setMealToArchive(null)}
      />
    </div>
  );
}