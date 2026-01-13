import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockPostings } from "../shared/mock/postings";

export default function PostingsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [onlySummary, setOnlySummary] = useState(false);

  const items = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return mockPostings
      .filter((p) => (onlySummary ? p.hasSummary : true))
      .filter((p) =>
        k
          ? p.company.toLowerCase().includes(k) || p.title.toLowerCase().includes(k)
          : true
      );
  }, [keyword, onlySummary]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginRight: 8 }}>공고 목록</h2>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="회사명/직무 검색"
          style={{
            padding: "8px 10px",
            border: "1px solid #ddd",
            borderRadius: 8,
            minWidth: 260,
          }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={onlySummary}
            onChange={(e) => setOnlySummary(e.target.checked)}
          />
          요약 있는 공고만
        </label>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/postings/${p.id}`)}
            style={{
              textAlign: "left",
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 16,
              background: "white",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{p.title}</div>
                <div style={{ marginTop: 6, color: "#555" }}>{p.company}</div>
              </div>

              <div style={{ textAlign: "right", color: "#444" }}>
                <div style={{ fontWeight: 700 }}>마감</div>
                <div>{p.deadline}</div>
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  {p.hasSummary ? "요약 있음" : "요약 없음"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {p.techStack.map((t) => (
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
          </button>
        ))}

        {items.length === 0 && (
          <div style={{ padding: 16, color: "#666" }}>조건에 맞는 공고가 없어.</div>
        )}
      </div>
    </div>
  );
}
