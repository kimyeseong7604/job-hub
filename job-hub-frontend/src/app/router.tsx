import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import HomePage from "../pages/HomePage";
import DashboardPage from "../pages/DashboardPage";
import PostingsPage from "../pages/PostingsPage";
import PostingDetailPage from "../pages/PostingDetailPage";
import BoardPage from "../pages/BoardPage";
import CalendarPage from "../pages/CalendarPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      // ✅ Job Hub 로고 클릭(= "/") → 메인 홈
      { index: true, element: <HomePage /> },

      // 기존 페이지는 그대로 유지
      { path: "dashboard", element: <DashboardPage /> },
      { path: "postings", element: <PostingsPage /> },
      { path: "postings/:id", element: <PostingDetailPage /> },
      { path: "board", element: <BoardPage /> },
      { path: "calendar", element: <CalendarPage /> },
    ],
  },
]);
