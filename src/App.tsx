import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Clients from "./pages/Dashboard/Clients";
import Homepage from "./pages/Homepage";
import DefaultPage from "./pages/DefaultPage";
import Overview from "./pages/Dashboard/Overview";
import Plans from "./pages/Dashboard/Plans";
import Nutrition from "./pages/Dashboard/Nutrition";
import Exercises from "./pages/Dashboard/Exercises";
import Meals from "./pages/Dashboard/Meals";
import Analytics from "./pages/Dashboard/Analytics";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { ThemeProvider } from "./theme";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import { AuthSessionBootstrap } from "./components/AuthSessionBootstrap";
import { RequireAuth } from "./components/RequireAuth";
import { RequireGuest } from "./components/RequireGuest";
import { ThemeToggleFab } from "./components/ThemeToggleFab";
import { AppToaster } from "./components/AppToaster";
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
              <Route path="plans" element={<Plans />} />
              <Route path="nutrition" element={<Nutrition />} />
              <Route path="exercises" element={<Exercises />} />
              <Route path="meals" element={<Meals />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

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
