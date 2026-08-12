import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { Loader2 } from "lucide-react";
import Homepage from "./pages/Homepage";
import DefaultPage from "./pages/DefaultPage";
import CoachProfile from "./pages/CoachProfile";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import { ThemeProvider } from "./theme";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/auth/ForgotPassword";
import { AuthSessionBootstrap } from "./components/auth/AuthSessionBootstrap";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequireGuest } from "./components/auth/RequireGuest";
import { ThemeToggleFab } from "./components/ui/ThemeToggleFab";
import { AppToaster } from "./components/ui/AppToaster";
import ResetPassword from "./pages/auth/ResetPassword";

const DashboardRoutes = lazy(() => import("./pages/Dashboard"));

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-muted-foreground">
      <Loader2 className="size-7 animate-spin" />
    </div>
  );
}

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
              path="/dashboard/*"
              element={
                <RequireAuth>
                  <Suspense fallback={<DashboardFallback />}>
                    <DashboardRoutes />
                  </Suspense>
                </RequireAuth>
              }
            />

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