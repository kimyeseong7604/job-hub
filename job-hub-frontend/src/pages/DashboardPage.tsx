import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBoardStore } from "../shared/store/boardStore";
import type { BookmarkCard, KanbanStatus } from "../entities/bookmark";
import Card from "../shared/ui/Card";
import Button from "../shared/ui/Button";
import BoardCardEditModal from "../shared/ui/BoardCardEditModal";

const statusLabels: Record<KanbanStatus, string> = {
  INTEREST: "관심",
  PREPARE: "서류 준비",
  APPLIED: "지원 완료",
  INTERVIEW: "면접",
  RESULT: "최종 결과",
};

function parseYmd(dateStr: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d);
}

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysFromToday(dateStr: string): number | null {
  const dt = parseYmd(dateStr);
  if (!dt) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = dt.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function chipByDiff(diff: number | null) {
  if (diff === null) return { text: "-", cls: "bg-gray-100 text-gray-700" };
  if (diff < 0) return { text: `지연 ${Math.abs(diff)}일`, cls: "bg-red-100 text-red-700" };
  if (diff === 0) return { text: "오늘", cls: "bg-amber-100 text-amber-800" };
  if (diff === 1) return { text: "내일", cls: "bg-amber-100 text-amber-800" };
  return { text: `D-${diff}`, cls: "bg-gray-100 text-gray-700" };
}

function buildMonthGrid(year: number, monthIndex0: number) {
  // monthIndex0: 0~11
  const first = new Date(year, monthIndex0, 1);
  const last = new Date(year, monthIndex0 + 1, 0);
  const daysInMonth = last.getDate();

  // 0=일 ... 6=토
  const startDow = first.getDay();

  const cells: Array<{ date: Date | null; ymd: string | null }> = [];
  for (let i = 0; i < startDow; i++) cells.push({ date: null, ymd: null });
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex0, day);
    cells.push({ date: d, ymd: toYmd(d) });
  }
  while (cells.length % 7 !== 0) cells.push({ date: null, ymd: null });

  return cells;
}

const weekday = ["일", "월", "화", "수", "목", "금", "토"] as const;

export default function DashboardPage() {
  const navigate = useNavigate();
  const cards = useBoardStore((s) => s.cards);
  const updateCard = useBoardStore((s) => s.updateCard);

  const [editCardId, setEditCardId] = useState<string | null>(null);

  // 캘린더: 이번 달
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex0 = now.getMonth();
  const monthLabel = `${year}-${String(monthIndex0 + 1).padStart(2, "0")}`;

  const [selectedYmd, setSelectedYmd] = useState<string>(() => toYmd(now));

  const counts = useMemo(() => {
    const init: Record<KanbanStatus, number> = {
      INTEREST: 0,
      PREPARE: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      RESULT: 0,
    };
    for (const c of cards) init[c.status] += 1;
    return init;
  }, [cards]);

  // ✅ 다음 액션 위젯(기존)
  const nextActions = useMemo(() => {
    const list = cards
      .filter((c) => Boolean(c.nextActionDate))
      .map((c) => ({ card: c, diff: daysFromToday(c.nextActionDate!) }))
      .filter((x) => x.diff !== null) as { card: BookmarkCard; diff: number }[];

    return list.sort((a, b) => a.diff - b.diff).slice(0, 8);
  }, [cards]);

  // ✅ D-7 마감 공고(0~7일 남은 것만)
  const dueIn7 = useMemo(() => {
    const list = cards
      .filter((c) => Boolean(c.deadline))
      .map((c) => ({ card: c, diff: daysFromToday(c.deadline) }))
      .filter((x) => x.diff !== null) as { card: BookmarkCard; diff: number }[];

    return list
      .filter((x) => x.diff >= 0 && x.diff <= 7)
      .sort((a, b) => a.diff - b.diff)
      .slice(0, 10);
  }, [cards]);

  // ✅ 이번 달 마감 캘린더 데이터: ymd -> cards[]
  const monthDeadlineMap = useMemo(() => {
    const map = new Map<string, BookmarkCard[]>();
    for (const c of cards) {
      const dt = c.deadline ? parseYmd(c.deadline) : null;
      if (!dt) continue;
      if (dt.getFullYear() !== year || dt.getMonth() !== monthIndex0) continue;

      const key = toYmd(dt);
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    // 각 날짜 안에서도 빠르게 보기 좋게 title 정렬
    for (const [k, arr] of map.entries()) {
      map.set(
        k,
        [...arr].sort((a, b) => a.title.localeCompare(b.title, "ko"))
      );
    }
    return map;
  }, [cards, year, monthIndex0]);

  const monthGrid = useMemo(() => buildMonthGrid(year, monthIndex0), [year, monthIndex0]);

  const selectedDayDeadlines = useMemo(() => {
    return monthDeadlineMap.get(selectedYmd) ?? [];
  }, [monthDeadlineMap, selectedYmd]);

  const editingCard = useMemo(
    () => (editCardId ? cards.find((c) => c.id === editCardId) ?? null : null),
    [editCardId, cards]
  );

  const total = cards.length;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">대시보드</h2>
          <div className="mt-1 text-sm text-gray-600">총 {total}건 · 오늘 할 일부터 처리</div>
        </div>

        <div className="flex gap-2">
          <Link to="/postings">
            <Button variant="outline">공고 보기</Button>
          </Link>
          <Link to="/board">
            <Button variant="outline">보드로 이동 →</Button>
          </Link>
        </div>
      </div>

      {/* ✅ 다음 액션 */}
      <Card className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-extrabold">다음 액션</div>
            <div className="mt-1 text-sm text-gray-600">
              날짜가 있는 카드만 표시 · 대시보드에서 바로 편집 가능
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/board")}>
            보드에서 전체 보기 →
          </Button>
        </div>

        <div className="mt-3 grid gap-2">
          {nextActions.length === 0 ? (
            <div className="text-sm text-gray-600">
              아직 다음 액션이 없어. 보드에서 카드 편집으로 날짜를 추가해보세요.
            </div>
          ) : (
            nextActions.map(({ card, diff }) => {
              const chip = chipByDiff(diff);
              return (
                <div
                  key={card.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/postings/${card.postingId}`)}
                      className="truncate font-extrabold hover:underline"
                      title="공고 상세로 이동"
                    >
                      {card.title}
                    </button>
                    <div className="mt-1 text-sm text-gray-600">
                      {card.company} · {statusLabels[card.status]}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      다음 액션: {card.nextActionDate || "-"}
                      {card.memo
                        ? ` · ${card.memo.slice(0, 40)}${card.memo.length > 40 ? "…" : ""}`
                        : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${chip.cls}`}>
                      {chip.text}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => setEditCardId(card.id)}>
                      편집
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* ✅ 마감 7일 전 */}
      <Card className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-extrabold">마감 7일 전</div>
            <div className="mt-1 text-sm text-gray-600">D-7 ~ D-day 공고만 모아보기</div>
          </div>
          <Link to="/board">
            <Button variant="ghost" size="sm">
              보드 보기 →
            </Button>
          </Link>
        </div>

        <div className="mt-3 grid gap-2">
          {dueIn7.length === 0 ? (
            <div className="text-sm text-gray-600">7일 이내 마감 공고가 없어요.</div>
          ) : (
            dueIn7.map(({ card, diff }) => (
              <div
                key={card.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3"
              >
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate(`/postings/${card.postingId}`)}
                    className="truncate font-extrabold hover:underline"
                  >
                    {card.title}
                  </button>
                  <div className="mt-1 text-sm text-gray-600">{card.company}</div>
                  <div className="mt-1 text-xs text-gray-500">마감: {card.deadline}</div>
                </div>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                  D-{diff}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* ✅ 이번 달 마감 캘린더 미리보기 */}
      <Card className="p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-extrabold">이번 달 마감 캘린더</div>
            <div className="mt-1 text-sm text-gray-600">
              {monthLabel} · 날짜 클릭하면 해당일 마감 공고가 아래에 표시돼
            </div>
          </div>
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              캘린더 페이지 →
            </Button>
          </Link>
        </div>

        {/* 요일 */}
        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500">
          {weekday.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="mt-2 grid grid-cols-7 gap-2">
          {monthGrid.map((cell, idx) => {
            if (!cell.date || !cell.ymd) {
              return <div key={idx} className="h-14 rounded-xl border border-transparent" />;
            }
            const count = monthDeadlineMap.get(cell.ymd)?.length ?? 0;
            const isSelected = cell.ymd === selectedYmd;
            const isToday = cell.ymd === toYmd(new Date());

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedYmd(cell.ymd!)}
                className={[
                  "h-14 rounded-xl border p-2 text-left transition",
                  isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
              >
                <div className="flex items-start justify-between">
                  <div className={["text-sm font-extrabold", isToday ? "text-amber-700" : ""].join(" ")}>
                    {cell.date.getDate()}
                  </div>
                  {count > 0 && (
                    <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-black text-white">
                      {count}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  {count > 0 ? (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-transparent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* 선택 날짜의 마감 리스트 */}
        <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-sm font-extrabold">
            {selectedYmd} 마감 공고 ({selectedDayDeadlines.length})
          </div>

          <div className="mt-2 grid gap-2">
            {selectedDayDeadlines.length === 0 ? (
              <div className="text-sm text-gray-600">이 날짜에는 마감 공고가 없어요.</div>
            ) : (
              selectedDayDeadlines.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/postings/${c.postingId}`)}
                      className="truncate font-extrabold hover:underline"
                    >
                      {c.title}
                    </button>
                    <div className="mt-1 text-sm text-gray-600">{c.company}</div>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                    {statusLabels[c.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* 지원 현황 */}
      <Card className="p-4">
        <div className="mb-3 font-extrabold">지원 현황</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(Object.keys(statusLabels) as KanbanStatus[]).map((key) => (
            <div key={key} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-xs font-bold text-gray-600">{statusLabels[key]}</div>
              <div className="mt-1 text-2xl font-black">{counts[key]}</div>
            </div>
          ))}
        </div>
      </Card>

      {total === 0 && (
        <Card className="p-4">
          <div className="text-sm text-gray-600">
            아직 지원 보드에 카드가 없어요.{" "}
            <Link to="/postings" className="font-bold underline">
              공고 목록
            </Link>
            에서 공고를 선택하고 <span className="font-bold">지원 만들기</span>를 눌러보세요!
          </div>
        </Card>
      )}

      {/* 편집 모달 */}
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
