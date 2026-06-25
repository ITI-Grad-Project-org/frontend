import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import DashboardLayout from "./pages/DashboardLayout";
import Overview from "./pages/Overview";
import Trainees from "./pages/Trainees";
import Schedule from "./pages/Schedule";
import Homepage from "./pages/Homepage";
import DefaultPage from "./pages/DefaultPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Homepage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="trainees" element={<Trainees />} />
          <Route path="schedule" element={<Schedule />} />
        </Route>
        <Route path="*" element={<DefaultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
