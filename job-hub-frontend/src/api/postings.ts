// src/api/postings.ts
import api from "./api";

export type PostingListItem = {
  _id: string;
  title: string;
  company: string;
  deadline?: string;
  techStack?: string[];
  summary?: Record<string, unknown> | null;
};

export type PostingDetail = {
  _id: string;
  title: string;
  company: string;
  deadline?: string;
  link?: string;
  techStack?: string[];
  summary?: {
    업무?: string;
    자격요건?: string;
    우대사항?: string;
    기술스택?: string;
    전형절차?: string;
    마감상세?: string;
  } | null;
};

export type GetPostingsParams = {
  keyword?: string;
  tag?: string;
  page?: number;
};

// ✅ 임시 mock (백엔드 준비 전용)
const mockPostings: PostingListItem[] = [
  {
    _id: "1",
    title: "Frontend Engineer (React)",
    company: "Kakao",
    deadline: "2026-02-10",
    techStack: ["React", "TypeScript", "TanStack Query"],
    summary: { 업무: "React 기반 채용 공고 탐색/관리 화면 개발" },
  },
  {
    _id: "2",
    title: "Fullstack Engineer (Node/React)",
    company: "Taewoong Logistics",
    deadline: "2026-02-03",
    techStack: ["Node.js", "Express", "MongoDB", "React"],
    summary: null,
  },
  {
    _id: "3",
    title: "Frontend Intern",
    company: "Startup A",
    deadline: "2026-01-25",
    techStack: ["React", "Vite"],
    summary: { 업무: "프론트 기능 개발 및 유지보수" },
  },
];

function filterByKeyword(list: PostingListItem[], keyword?: string) {
  const k = (keyword ?? "").trim().toLowerCase();
  if (!k) return list;
  return list.filter(
    (p) => p.title.toLowerCase().includes(k) || p.company.toLowerCase().includes(k)
  );
}

export async function getPostings(params: GetPostingsParams) {
  try {
    const res = await api.get<PostingListItem[]>("/postings", { params });
    return res.data;
  } catch {
    // ✅ 백엔드 미가동이면 mock로 계속 개발 가능
    return filterByKeyword(mockPostings, params.keyword);
  }
}

export async function getPostingDetail(id: string) {
  try {
    const res = await api.get<PostingDetail>(`/postings/${id}`);
    return res.data;
  } catch {
    const found = mockPostings.find((p) => p._id === id);
    if (!found) throw new Error("mock: posting not found");
    const detail: PostingDetail = {
      _id: found._id,
      title: found.title,
      company: found.company,
      deadline: found.deadline,
      techStack: found.techStack,
      link: "https://example.com",
      summary: found.summary
        ? {
            업무: String(found.summary.업무 ?? "-"),
            자격요건: "TS/React 경험",
            우대사항: "React Query 경험",
            기술스택: (found.techStack ?? []).join(", "),
            전형절차: "서류 → 코테/과제 → 면접",
            마감상세: found.deadline ?? "-",
          }
        : null,
    };
    return detail;
  }
}
