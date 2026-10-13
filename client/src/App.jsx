import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Pomodoro from "./pages/Pomodoro";
import Completed from "./pages/Completed";
import Categories from "./pages/Categories";

function NotFound() {
  return <h1>404 — Page not found</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/today" element={<Navigate to="/dashboard" replace />} />
        <Route path="/tasks" element={<Navigate to="/dashboard" replace />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/completed" element={<Completed />} />
        <Route path="/categories" element={<Categories />} />
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
