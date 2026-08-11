import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Clients from "./pages/Dashboard/Clients";
import Homepage from "./pages/Homepage";
import DefaultPage from "./pages/DefaultPage";
import Overview from "./pages/Dashboard/Overview";
import Plans from "./pages/Dashboard/Plans";
import PlanBuilder from "./pages/Dashboard/PlanBuilder";
import PlanLogs from "./pages/Dashboard/PlanLogs";
import PlanDayLog from "./pages/Dashboard/PlanDayLog";
import NutritionPlans from "./pages/Dashboard/NutritionPlans";
import NutritionPlanBuilder from "./pages/Dashboard/NutritionPlanBuilder";
import NutritionPlanLogs from "./pages/Dashboard/NutritionPlanLogs";
import NutritionPlanDayLog from "./pages/Dashboard/NutritionPlanDayLog";
import Exercises from "./pages/Dashboard/Exercises";
import Meals from "./pages/Dashboard/Nutrition";
import Analytics from "./pages/Dashboard/Analytics";
import Reviews from "./pages/Dashboard/Reviews";
import Chat from "./pages/Dashboard/Chat";
import CoachProfile from "./pages/CoachProfile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ThemeProvider } from "./theme";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthSessionBootstrap } from "./components/auth/AuthSessionBootstrap";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireGuest } from "./components/auth/RequireGuest";
import { ThemeToggleFab } from "./components/ui/ThemeToggleFab";
import { AppToaster } from "./components/ui/AppToaster";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthSessionBootstrap>
          <Routes>
            <Route index element={<Homepage />} />
            <Route
              path="/signin"
              element={
                <RequireGuest>
                  <SignIn />
                </RequireGuest>
              }
            />
            <Route
              path="/signup"
              element={
                <RequireGuest>
                  <SignUp />
                </RequireGuest>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <RequireGuest>
                  <ForgotPassword />
                </RequireGuest>
              }
            />
            <Route
              path="/reset-password"
              element={
                <RequireGuest>
                  <ResetPassword />
                </RequireGuest>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="clients" element={<Clients />} />
              <Route path="chat" element={<Chat />} />
              <Route path="chat/:clientId" element={<Chat />} />
              <Route path="plans" element={<Plans />} />
              <Route path="plans/:programId" element={<PlanBuilder />} />
              <Route path="plans/:programId/logs" element={<PlanLogs />} />
              <Route path="plans/:programId/days/:programDayId/log" element={<PlanDayLog />} />
              <Route path="exercise-plans" element={<Navigate to="/dashboard/plans" replace />} />
              <Route path="nutrition-plans" element={<NutritionPlans />} />
              <Route path="nutrition-plans/:planId" element={<NutritionPlanBuilder />} />
              <Route path="nutrition-plans/:planId/logs" element={<NutritionPlanLogs />} />
              <Route path="nutrition-plans/:planId/days/:dayId/log" element={<NutritionPlanDayLog />} />
              <Route path="nutrition" element={<Navigate to="/dashboard/nutrition-plans" replace />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="meals" element={<Meals />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reviews" element={<Reviews />} />
            </Route>

            <Route path="/coach/:tenantId" element={<CoachProfile />} />

            <Route path="*" element={<DefaultPage />} />
          </Routes>
          <ThemeToggleFab />
          <AppToaster />
        </AuthSessionBootstrap>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
