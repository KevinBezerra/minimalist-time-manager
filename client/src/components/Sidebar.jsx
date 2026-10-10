import "./Sidebar.css";
export default function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-bars">
          <span className="bar bar-teal"></span>
          <span className="bar bar-orange"></span>
          <span className="bar bar-navy"></span>
        </div>
        <span className="logo-text">Minimalist Time Manager</span>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <button
          type="button"
          className={`nav-item ${currentView === "dashboard" ? "active" : ""}`}
          aria-current={currentView === "dashboard" ? "page" : undefined}
          onClick={() => onViewChange("dashboard")}
        >
          <span className="nav-icon">▦</span>
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          className={`nav-item ${currentView === "completed" ? "active" : ""}`}
          aria-current={currentView === "completed" ? "page" : undefined}
          onClick={() => onViewChange("completed")}
        >
          <span className="nav-icon">✓</span>
          <span>Completed</span>
        </button>
        <button type="button" className="nav-item" disabled>
          <span className="nav-icon">⏱</span>
          <span>Pomodoro</span>
        </button>
        <button type="button" className="nav-item" disabled>
          <span className="nav-icon">🏷</span>
          <span>Categories</span>
        </button>
      </nav>
    </aside>
  );
}