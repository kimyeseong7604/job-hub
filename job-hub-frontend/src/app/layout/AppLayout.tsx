import { Outlet, Link, NavLink } from "react-router-dom";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`;

export default function AppLayout() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ borderRight: "1px solid #eee", padding: 16 }}>
        <h1 style={{ fontWeight: 700, marginBottom: 12 }}>
          <Link to="/">Job Hub</Link>
        </h1>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <NavLink to="/dashboard" className={navItemClass}>Dashboard</NavLink>
          <NavLink to="/postings" className={navItemClass}>Postings</NavLink>
          <NavLink to="/board" className={navItemClass}>Board</NavLink>
          <NavLink to="/calendar" className={navItemClass}>Calendar</NavLink>
        </nav>
      </aside>

      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
