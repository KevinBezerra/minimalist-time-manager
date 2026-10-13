import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Today from "./pages/Today";
import Tasks from "./pages/Tasks";
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
        <Route path="/today" element={<Today />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/completed" element={<Completed />} />
        <Route path="/categories" element={<Categories />} />
        <Route index element={<Navigate to="/today" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
