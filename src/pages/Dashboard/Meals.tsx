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

  // Filter active foods to populate meal recipe food dropdown
  const activeFoods = foodsHook.foods.filter((f) => f.isActive);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display text-foreground">
            Nutrition Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage reusable food ingredients and meal recipes for your coaching plans.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={handleOpenAddFood}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Apple className="w-4 h-4" />
            <span>Add Food Item</span>
          </button>
          <button
            onClick={handleOpenAddMeal}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold bg-brand text-brand-foreground rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            <span>Create Meal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab("meals")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeTab === "meals"
              ? "bg-ink text-ink-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Meals Library</span>
          <Chip className="font-bold ml-1">{mealsHook.filteredMeals.length}</Chip>
        </button>

        <button
          onClick={() => setActiveTab("foods")}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer ${activeTab === "foods"
              ? "bg-ink text-ink-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <Apple className="w-4 h-4" />
          <span>Food Items</span>
          <Chip className="font-bold ml-1">{foodsHook.filteredFoods.length}</Chip>
        </button>
      </div>

      {/* Meals Tab Content */}
      {activeTab === "meals" && (
        <section className="space-y-6">
          <MealFilters
            filters={mealsHook.filters}
            onFiltersChange={mealsHook.handleFiltersChange}
            onResetFilters={mealsHook.resetFilters}
            onRefresh={() => void mealsHook.refreshData()}
            isRefreshing={mealsHook.isRefreshing}
            totalMeals={mealsHook.meals.length}
            filteredCount={mealsHook.filteredMeals.length}
          />

          <MealGrid
            loading={mealsHook.loading}
            error={mealsHook.error}
            meals={mealsHook.filteredMeals}
            hasActiveFilter={mealsHook.hasActiveFilter}
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
            onFiltersChange={foodsHook.handleFiltersChange}
            onResetFilters={foodsHook.resetFilters}
            onRefresh={() => void foodsHook.refreshData()}
            isRefreshing={foodsHook.isRefreshing}
            totalFoods={foodsHook.foods.length}
            filteredCount={foodsHook.filteredFoods.length}
          />

          <FoodGrid
            loading={foodsHook.loading}
            error={foodsHook.error}
            foods={foodsHook.filteredFoods}
            hasActiveFilter={foodsHook.hasActiveFilter}
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