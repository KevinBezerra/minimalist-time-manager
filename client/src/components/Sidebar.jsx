import "./Sidebar.css";
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
                <a href="#" className="nav-item active">
                    <span className="nav-icon">🏠</span>
                    <span>Today</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="nav-icon">☰</span>
                    <span>Tasks</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="nav-icon">⏱</span>
                    <span>Pomodoro</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="nav-icon">✓</span>
                    <span>Completed</span>
                </a>
                <a href="#" className="nav-item">
                    <span className="nav-icon">🏷</span>
                    <span>Categories</span>
                </a>
            </nav>
        </aside>
    );
}