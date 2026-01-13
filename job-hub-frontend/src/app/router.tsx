import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import PostingsPage from "../pages/PostingsPage";
import PostingDetailPage from "../pages/PostingDetailPage";
import BoardPage from "../pages/BoardPage";
import CalendarPage from "../pages/CalendarPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <PostingsPage /> },
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/postings", element: <PostingsPage /> },
      { path: "/postings/:id", element: <PostingDetailPage /> },
      { path: "/board", element: <BoardPage /> },
      { path: "/calendar", element: <CalendarPage /> },
    ],
  },
]);
