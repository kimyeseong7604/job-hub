import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBoardStore } from "../shared/store/boardStore";
import type { KanbanStatus, BookmarkCard } from "../entities/bookmark";
import BoardCardEditModal from "../shared/ui/BoardCardEditModal";
import Button from "../shared/ui/Button";

const columns: { key: KanbanStatus; title: string }[] = [
  { key: "INTEREST", title: "관심" },
  { key: "PREPARE", title: "서류 준비" },
  { key: "APPLIED", title: "지원 완료" },
  { key: "INTERVIEW", title: "면접" },
  { key: "RESULT", title: "최종 결과" },
];

function calcDday(deadline: string): string {
  const [y, m, d] = deadline.split("-").map(Number);
  const end = new Date(y, (m ?? 1) - 1, d ?? 1);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = end.getTime() - today.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffDays)) return "";
  if (diffDays === 0) return "D-day";
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

export default function BoardPage() {
  const navigate = useNavigate();
  const cards = useBoardStore((s) => s.cards);
  const moveCard = useBoardStore((s) => s.moveCard);
  const updateCard = useBoardStore((s) => s.updateCard);

  const [editCardId, setEditCardId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.key] = cards.filter((c) => c.status === col.key);
      return acc;
    }, {} as Record<KanbanStatus, BookmarkCard[]>);
  }, [cards]);

  const editingCard = useMemo(
    () => (editCardId ? cards.find((c) => c.id === editCardId) ?? null : null),
    [editCardId, cards]
  );

  return (
    <div className="grid gap-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">지원 보드</h2>
          <div className="mt-1 text-sm text-gray-600">
            제목 클릭: 공고 상세 · 편집: 메모/다음 액션
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {columns.map((col) => (
          <section key={col.key} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="mb-3 font-extrabold">{col.title}</div>

            <div className="grid gap-3">
              {grouped[col.key].map((card) => (
                <div key={card.id} className="rounded-2xl border border-gray-200 bg-white p-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/postings/${card.postingId}`)}
                    className="w-full text-left"
                    title="공고 상세로 이동"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-extrabold">{card.title}</div>
                      <div className="text-xs font-bold text-gray-700">{calcDday(card.deadline)}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{card.company}</div>
                    <div className="mt-1 text-xs text-gray-500">마감: {card.deadline}</div>
                  </button>

                  <div className="mt-3 grid gap-1">
                    <div className="text-xs text-gray-600">
                      다음 액션: <span className="font-bold">{card.nextActionDate || "-"}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      메모:{" "}
                      {card.memo ? (
                        <span>
                          {card.memo.slice(0, 40)}
                          {card.memo.length > 40 ? "…" : ""}
                        </span>
                      ) : (
                        "-"
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditCardId(card.id)}>
                      편집
                    </Button>

                    {columns
                      .filter((c) => c.key !== col.key)
                      .slice(0, 2)
                      .map((c) => (
                        <Button
                          key={c.key}
                          size="sm"
                          variant="ghost"
                          onClick={() => moveCard(card.id, c.key)}
                        >
                          → {c.title}
                        </Button>
                      ))}
                  </div>
                </div>
              ))}

              {grouped[col.key].length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white p-3 text-sm text-gray-500">
                  비어 있음
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      <BoardCardEditModal
        key={editCardId ?? "closed"}
        open={Boolean(editCardId)}
        card={editingCard}
        onClose={() => setEditCardId(null)}
        onSave={(patch) => {
          if (!editingCard) return;
          updateCard(editingCard.id, patch);
          setEditCardId(null);
        }}
      />
    </div>
  );
}
