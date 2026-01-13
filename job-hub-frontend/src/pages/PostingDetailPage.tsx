import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { mockPostings } from "../shared/mock/postings";

export default function PostingDetailPage() {
  const { id } = useParams();

  const posting = useMemo(() => mockPostings.find((p) => p.id === id), [id]);

  if (!posting) {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>공고 상세</h2>
        <div>공고를 찾지 못했어.</div>
        <Link to="/postings">← 목록으로</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <Link to="/postings">← 목록으로</Link>

      <div>
        <h2 style={{ fontSize: 26, fontWeight: 900 }}>{posting.title}</h2>
        <div style={{ marginTop: 6, color: "#555" }}>{posting.company}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {posting.techStack.map((t) => (
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
        <div style={{ fontWeight: 800, marginBottom: 8 }}>AI 요약 (목업)</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#333", display: "grid", gap: 6 }}>
          <li>업무: React 기반 채용 공고 탐색/관리 화면 개발</li>
          <li>자격요건: TS/React 경험</li>
          <li>우대사항: React Query, 상태관리 경험</li>
          <li>기술스택: {posting.techStack.join(", ")}</li>
          <li>전형절차: 서류 → 과제/코테 → 면접</li>
          <li>마감상세: {posting.deadline}</li>
        </ul>
      </div>

      <button
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          padding: "12px 14px",
          fontWeight: 800,
          cursor: "pointer",
          background: "white",
          width: "fit-content",
        }}
        onClick={() => alert("지원 만들기 (다음 단계에서 연결)")}
      >
        지원 만들기
      </button>
    </div>
  );
}
