// src/app/layout/AppLayout.tsx
import { Outlet, Link, NavLink } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    "px-3 py-2 rounded-lg font-semibold",
    isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
  ].join(" ");

export default function AppLayout() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r border-gray-200 p-4">
        <h1 className="text-2xl font-black mb-4">
          <Link to="/" className="hover:underline">
            Job Hub
          </Link>
        </h1>

        <nav className="flex flex-col gap-2">
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
          <NavLink to="/postings" className={navClass}>
            Postings
          </NavLink>
          <NavLink to="/board" className={navClass}>
            Board
          </NavLink>
          <NavLink to="/calendar" className={navClass}>
            Calendar
          </NavLink>
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
        </nav>

        <div className="mt-6 text-xs text-gray-500 leading-relaxed">
          MVP: 공고 탐색 → 요약 확인 → 지원 보드 관리
        </div>
      </aside>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
