// src/pages/PostingsPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPostings } from "../api/postings";
import Card from "../shared/ui/Card";
import Badge from "../shared/ui/Badge";

export default function PostingsPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [onlySummary, setOnlySummary] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["postings", { keyword }],
    queryFn: () => getPostings({ keyword: keyword.trim() || undefined }),
  });

  const items = useMemo(() => {
    const list = data ?? [];
    return onlySummary ? list.filter((p) => Boolean(p.summary)) : list;
  }, [data, onlySummary]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-black mr-2">공고 목록</h2>

        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="회사명/직무 검색"
          className="h-10 w-[280px] rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={onlySummary}
            onChange={(e) => setOnlySummary(e.target.checked)}
            className="h-4 w-4"
          />
          요약 있는 공고만
        </label>
      </div>

      {isLoading && <div className="text-sm text-gray-600">불러오는 중...</div>}

      {isError && (
        <div className="text-sm text-red-600">
          공고 조회 실패: {(error as Error)?.message ?? "unknown error"}
        </div>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-3">
          {items.map((p) => (
            <button
              key={p._id}
              onClick={() => navigate(`/postings/${p._id}`)}
              className="text-left"
            >
              <Card className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="text-lg font-extrabold">{p.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{p.company}</div>
                  </div>

                  <div className="text-right text-sm text-gray-700">
                    <div className="font-bold">마감</div>
                    <div>{p.deadline ?? "-"}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {p.summary ? "요약 있음" : "요약 없음"}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(p.techStack ?? []).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </Card>
            </button>
          ))}

          {items.length === 0 && (
            <Card className="p-4">
              <div className="text-sm text-gray-600">조건에 맞는 공고가 없어요.</div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
