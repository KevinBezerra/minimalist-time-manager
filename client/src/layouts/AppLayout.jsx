import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../App.css";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`app-layout ${isSidebarOpen ? "menu-open" : ""}`}>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsSidebarOpen((open) => !open)}
        aria-label="Open navigation menu"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
