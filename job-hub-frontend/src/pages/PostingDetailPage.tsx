// src/pages/PostingDetailPage.tsx
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostingDetail, type PostingDetail } from "../api/postings";
import { useBoardStore } from "../shared/store/boardStore";

type Summary = NonNullable<PostingDetail["summary"]>;

const summaryLabels: { key: keyof Summary; label: string }[] = [
  { key: "업무", label: "업무" },
  { key: "자격요건", label: "자격요건" },
  { key: "우대사항", label: "우대사항" },
  { key: "기술스택", label: "기술스택" },
  { key: "전형절차", label: "전형절차" },
  { key: "마감상세", label: "마감상세" },
];

export default function PostingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addCard = useBoardStore((s) => s.addCard);

  const postingId = id ?? "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["postingDetail", postingId],
    queryFn: () => getPostingDetail(postingId),
    enabled: Boolean(postingId),
  });

  if (isLoading) return <div style={{ color: "#666" }}>불러오는 중...</div>;

  if (isError) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>공고 상세</h2>
        <div style={{ color: "#c00" }}>
          조회 실패: {(error as Error)?.message ?? "unknown error"}
        </div>
        <Link to="/postings">← 목록으로</Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>공고 상세</h2>
        <div>공고 데이터가 없어요.</div>
        <Link to="/postings">← 목록으로</Link>
      </div>
    );
  }

  const handleCreateApplication = () => {
    addCard({
      postingId: data._id,
      company: data.company,
      title: data.title,
      deadline: data.deadline ?? "-",
      status: "INTEREST",
    });
    navigate("/board");
  };

  const summary: Summary | null = data.summary ?? null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Link to="/postings">← 목록으로</Link>

      <div>
        <h2 style={{ fontSize: 26, fontWeight: 900 }}>{data.title}</h2>
        <div style={{ marginTop: 6, color: "#555" }}>{data.company}</div>

        {data.link && (
          <div style={{ marginTop: 8 }}>
            <a href={data.link} target="_blank" rel="noreferrer">
              원문 링크 열기
            </a>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(data.techStack ?? []).map((t) => (
          <span
            key={t}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 999,
              border: "1px solid #ddd",
            }}
          >
            {t}
          </span>
        ))}
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>AI 요약</div>

        <ul style={{ margin: 0, paddingLeft: 18, color: "#333", display: "grid", gap: 6 }}>
          {summaryLabels.map(({ key, label }) => {
            const value = summary?.[key];
            return (
              <li key={String(key)}>
                {label}: {typeof value === "string" && value.trim() ? value : "-"}
              </li>
            );
          })}

          {/* 요약에 기술스택이 비어있으면 fallback */}
          {(!summary?.기술스택 || summary.기술스택.trim() === "") && (
            <li>기술스택: {(data.techStack ?? []).join(", ") || "-"}</li>
          )}

          {/* 요약에 마감상세가 비어있으면 fallback */}
          {(!summary?.마감상세 || summary.마감상세.trim() === "") && (
            <li>마감상세: {data.deadline ?? "-"}</li>
          )}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleCreateApplication}
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: "12px 14px",
          fontWeight: 800,
          cursor: "pointer",
          background: "white",
          width: "fit-content",
        }}
      >
        <b>⭐</b>
      </button>
    </div>
  );
}