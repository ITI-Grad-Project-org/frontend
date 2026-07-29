// src/services/nutrition.ts
import { api } from "@/lib/api";
import type {
  Food,
  CreateFoodDto,
  UpdateFoodDto,
  GetFoodsParams,
  Meal,
  CreateMealDto,
  UpdateMealDto,
  ReplaceMealItemsDto,
  GetMealsParams,
} from "@/types/nutrition";

// ─── Food Library API ──────────────────────────────────────────────────────────

/** GET /nutrition/library/foods */
export async function getFoods(params?: GetFoodsParams): Promise<Food[]> {
  const { data } = await api.get<Food[]>("/nutrition/library/foods", { params });
  return Array.isArray(data) ? data : [];
}

/** GET /nutrition/library/foods/:foodId */
export async function getFood(foodId: string): Promise<Food> {
  const { data } = await api.get<Food>(`/nutrition/library/foods/${foodId}`);
  return data;
}

/** POST /nutrition/library/foods */
export async function createFood(dto: CreateFoodDto): Promise<Food> {
  const { data } = await api.post<Food>("/nutrition/library/foods", dto);
  return data;
}

/** PATCH /nutrition/library/foods/:foodId */
export async function updateFood(foodId: string, dto: UpdateFoodDto): Promise<Food> {
  const { data } = await api.patch<Food>(`/nutrition/library/foods/${foodId}`, dto);
  return data;
}

/** DELETE /nutrition/library/foods/:foodId (Archive) */
export async function archiveFood(foodId: string): Promise<void> {
  await api.delete(`/nutrition/library/foods/${foodId}`);
}

/** Unarchive food by setting isActive: true via PATCH */
export async function unarchiveFood(foodId: string): Promise<Food> {
  const { data } = await api.patch<Food>(`/nutrition/library/foods/${foodId}`, {
    isActive: true,
  });
  return data;
}

// ─── Meal Library API ──────────────────────────────────────────────────────────

/** GET /nutrition/library/meals */
export async function getMeals(params?: GetMealsParams): Promise<Meal[]> {
  const { data } = await api.get<Meal[]>("/nutrition/library/meals", { params });
  return Array.isArray(data) ? data : [];
}

/** GET /nutrition/library/meals/:mealId */
export async function getMeal(mealId: string): Promise<Meal> {
  const { data } = await api.get<Meal>(`/nutrition/library/meals/${mealId}`);
  return data;
}

/** POST /nutrition/library/meals */
export async function createMeal(dto: CreateMealDto): Promise<Meal> {
  const { data } = await api.post<Meal>("/nutrition/library/meals", dto);
  return data;
}

/** PATCH /nutrition/library/meals/:mealId (Metadata update or restore) */
export async function updateMeal(mealId: string, dto: UpdateMealDto): Promise<Meal> {
  const { data } = await api.patch<Meal>(`/nutrition/library/meals/${mealId}`, dto);
  return data;
}

/** PUT /nutrition/library/meals/:mealId/items (Replace complete recipe) */
export async function replaceMealItems(
  mealId: string,
  dto: ReplaceMealItemsDto
): Promise<Meal> {
  const { data } = await api.put<Meal>(`/nutrition/library/meals/${mealId}/items`, dto);
  return data;
}

/** DELETE /nutrition/library/meals/:mealId (Archive) */
export async function archiveMeal(mealId: string): Promise<void> {
  await api.delete(`/nutrition/library/meals/${mealId}`);
}

/** Unarchive meal by setting isActive: true via PATCH */
export async function unarchiveMeal(mealId: string): Promise<Meal> {
  const { data } = await api.patch<Meal>(`/nutrition/library/meals/${mealId}`, {
    isActive: true,
  });
  return data;
}
