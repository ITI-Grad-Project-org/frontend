import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./DashboardLayout";
import Overview from "./Overview";
import Clients from "./Clients";
import ClientProfile from "./ClientProfile";
import Chat from "./Chat";
import Plans from "./plans/Plans";
import PlanLogs from "./plans/PlanLogs";
import PlanDayLog from "./plans/PlanDayLog";
import NutritionPlans from "./nutritionPlans/NutritionPlans";
import NutritionPlanLogs from "./nutritionPlans/NutritionPlanLogs";
import NutritionPlanDayLog from "./nutritionPlans/NutritionPlanDayLog";
import AISuggestions from "./AISuggestions";
import Exercises from "./Exercises";
import Nutrition from "./Nutrition";
import Analytics from "./Analytics";
import Reviews from "./Reviews";

const PlanBuilder = lazy(() => import("./plans/PlanBuilder"));
const NutritionPlanBuilder = lazy(() => import("./nutritionPlans/NutritionPlanBuilder"));

function BuilderFallback() {
    return (
        <div className="flex items-center justify-center rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Loading plan editor…
        </div>
    );
}

export default function DashboardRoutes() {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:clientId" element={<ClientProfile />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat/:clientId" element={<Chat />} />
                <Route path="plans" element={<Plans />} />
                <Route path="plans/:programId" element={<Suspense fallback={<BuilderFallback />}><PlanBuilder /></Suspense>} />
                <Route path="plans/:programId/logs" element={<PlanLogs />} />
                <Route path="plans/:programId/days/:programDayId/log" element={<PlanDayLog />} />
                <Route path="exercise-plans" element={<Navigate to="/dashboard/plans" replace />} />
                <Route path="nutrition-plans" element={<NutritionPlans />} />
                <Route path="nutrition-plans/:planId" element={<Suspense fallback={<BuilderFallback />}><NutritionPlanBuilder /></Suspense>} />
                <Route path="nutrition-plans/:planId/logs" element={<NutritionPlanLogs />} />
                <Route path="nutrition-plans/:planId/days/:dayId/log" element={<NutritionPlanDayLog />} />
                <Route path="ai-suggestions" element={<AISuggestions />} />
                <Route path="nutrition" element={<Navigate to="/dashboard/nutrition-plans" replace />} />
                <Route path="exercises" element={<Exercises />} />
                <Route path="meals" element={<Nutrition />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reviews" element={<Reviews />} />
            </Route>
        </Routes>
    );
}