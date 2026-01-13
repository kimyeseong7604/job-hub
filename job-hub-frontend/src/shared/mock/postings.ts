import type { Posting } from "../../entities/posting";

export const mockPostings: Posting[] = [
  {
    id: "1",
    title: "Frontend Engineer (React)",
    company: "Kakao",
    deadline: "2026-02-10",
    techStack: ["React", "TypeScript", "TanStack Query"],
    hasSummary: true,
    tags: ["frontend", "react"],
  },
  {
    id: "2",
    title: "Fullstack Engineer (Node/React)",
    company: "Taewoong Logistics",
    deadline: "2026-02-03",
    techStack: ["Node.js", "Express", "MongoDB", "React"],
    hasSummary: false,
    tags: ["fullstack", "node"],
  },
  {
    id: "3",
    title: "Frontend Intern",
    company: "Startup A",
    deadline: "2026-01-25",
    techStack: ["React", "Vite"],
    hasSummary: true,
    tags: ["intern", "frontend"],
  },
];
