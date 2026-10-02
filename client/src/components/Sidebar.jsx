import "./Sidebar.css";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/today", label: "Today", icon: "🏠" },
    { to: "/tasks", label: "Tasks", icon: "☰" },
    { to: "/pomodoro", label: "Pomodoro", icon: "⏱" },
    { to: "/completed", label: "Completed", icon: "✓" },
    { to: "/categories", label: "Categories", icon: "🏷" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Our logo block */}
            <div className="sidebar-logo">
                <div className="logo-bars">
                    <span className="bar bar-teal"></span>
                    <span className="bar bar-orange"></span>
                    <span className="bar bar-navy"></span>
                </div> 
                <span className="logo-text">Minimalist Time Manager</span>

            </div>            {/* Navigation items */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <NavLink 
                    key={item.to} 
                    to={item.to} 
                    className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} 
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}