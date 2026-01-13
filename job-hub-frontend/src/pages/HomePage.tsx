import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Card from "../shared/ui/Card";
import Button from "../shared/ui/Button";
import Badge from "../shared/ui/Badge";
import { getPostings } from "../api/postings";
import { useBoardStore } from "../shared/store/boardStore";
import type { BookmarkCard, KanbanStatus } from "../entities/bookmark";

function parseYmd(dateStr?: string) {
  if (!dateStr) return null;
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

function daysFromToday(dateStr?: string): number | null {
  const dt = parseYmd(dateStr);
  if (!dt) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = dt.getTime() - today.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function ddayText(diff: number | null) {
  if (diff === null) return "-";
  if (diff === 0) return "D-day";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}

function ddayBadgeClass(diff: number | null) {
  if (diff === null) return "bg-gray-100 text-gray-700";
  if (diff < 0) return "bg-red-100 text-red-700";
  if (diff <= 3) return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
}

function buildMonthGrid(year: number, monthIndex0: number) {
  const first = new Date(year, monthIndex0, 1);
  const last = new Date(year, monthIndex0 + 1, 0);
  const daysInMonth = last.getDate();
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

const statusLabels: Record<KanbanStatus, string> = {
  INTEREST: "관심",
  PREPARE: "서류 준비",
  APPLIED: "지원 완료",
  INTERVIEW: "면접",
  RESULT: "최종 결과",
};

const quickTemplates = [
  "자소서 1차 초안 작성",
  "포트폴리오 업데이트",
  "코테 대비 문제풀이",
  "면접 예상질문 정리",
  "기업/직무 리서치",
] as const;

function appendMemo(prev: string | undefined, line: string) {
  const base = (prev ?? "").trim();
  const item = `- ${line}`;
  if (!base) return item;
  // 이미 같은 라인이 있으면 중복 추가 방지(간단)
  if (base.includes(item)) return base;
  return `${base}\n${item}`;
}

export default function HomePage() {
  const navigate = useNavigate();

  const { data: postings } = useQuery({
    queryKey: ["postings", { home: true }],
    queryFn: () => getPostings({}),
  });

  const boardCards = useBoardStore((s) => s.cards);
  const updateCard = useBoardStore((s) => s.updateCard);

  const boardCounts = useMemo(() => {
    const init: Record<KanbanStatus, number> = {
      INTEREST: 0,
      PREPARE: 0,
      APPLIED: 0,
      INTERVIEW: 0,
      RESULT: 0,
    };
    for (const c of boardCards) init[c.status] += 1;
    return init;
  }, [boardCards]);

  const actionKpi = useMemo(() => {
    const list = boardCards
      .filter((c) => Boolean(c.nextActionDate))
      .map((c) => daysFromToday(c.nextActionDate))
      .filter((x) => x !== null) as number[];

    const dueToday = list.filter((d) => d === 0).length;
    const overdue = list.filter((d) => d < 0).length;
    return { dueToday, overdue };
  }, [boardCards]);

  const due7BoardCount = useMemo(() => {
    return boardCards
      .map((c) => daysFromToday(c.deadline))
      .filter((d) => d !== null && d >= 0 && d <= 7).length;
  }, [boardCards]);

  const postingStats = useMemo(() => {
    const list = postings ?? [];
    const total = list.length;
    const withSummary = list.filter((p) => Boolean(p.summary)).length;
    const noSummaryTop3 = list.filter((p) => !p.summary).slice(0, 3);

    const soonList = [...list]
      .map((p) => ({ p, diff: daysFromToday(p.deadline) }))
      .filter((x) => x.diff !== null) as { p: (typeof list)[number]; diff: number }[];

    const top3Soon = soonList.sort((a, b) => a.diff - b.diff).slice(0, 3);

    return { total, withSummary, top3Soon, noSummaryTop3 };
  }, [postings]);

  const now = new Date();
  const year = now.getFullYear();
  const monthIndex0 = now.getMonth();
  const monthLabel = `${year}-${String(monthIndex0 + 1).padStart(2, "0")}`;

  const [selectedYmd, setSelectedYmd] = useState<string>(() => toYmd(now));

  const monthDeadlineMap = useMemo(() => {
    const map = new Map<string, BookmarkCard[]>();
    for (const c of boardCards) {
      const dt = parseYmd(c.deadline);
      if (!dt) continue;
      if (dt.getFullYear() !== year || dt.getMonth() !== monthIndex0) continue;

      const key = toYmd(dt);
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [boardCards, year, monthIndex0]);

  const monthGrid = useMemo(() => buildMonthGrid(year, monthIndex0), [year, monthIndex0]);

  const selectedDayDeadlines = useMemo(() => {
    const list = monthDeadlineMap.get(selectedYmd) ?? [];
    return [...list].sort((a, b) => a.title.localeCompare(b.title, "ko")).slice(0, 5);
  }, [monthDeadlineMap, selectedYmd]);

  const totalBoard = boardCards.length;

  // ✅ Quick Actions 상태
  const todayYmd = toYmd(new Date());

  const quickCandidates = useMemo(() => {
    // RESULT는 보통 끝난 카드라 제외(원하면 제거 가능)
    return boardCards.filter((c) => c.status !== "RESULT");
  }, [boardCards]);

  const [quickCardId, setQuickCardId] = useState<string>("");

  // 후보가 생기면 첫 카드 자동 선택(초기 1회 느낌으로 동작)
  const effectiveQuickCardId = useMemo(() => {
    if (quickCardId) return quickCardId;
    return quickCandidates[0]?.id ?? "";
  }, [quickCardId, quickCandidates]);

  const selectedQuickCard = useMemo(() => {
    return quickCandidates.find((c) => c.id === effectiveQuickCardId) ?? null;
  }, [quickCandidates, effectiveQuickCardId]);

  const applyTodayAction = (template: string) => {
    if (!selectedQuickCard) return;

    const nextMemo = appendMemo(selectedQuickCard.memo, template);

    updateCard(selectedQuickCard.id, {
      nextActionDate: todayYmd,
      memo: nextMemo,
    });
  };

  const clearTodayAction = () => {
    if (!selectedQuickCard) return;
    updateCard(selectedQuickCard.id, { nextActionDate: "" });
  };

  return (
    <div className="grid gap-5">
      {/* 헤더 */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Job Hub</h2>
          <div className="mt-1 text-sm text-gray-600">한눈에 보고, 바로 처리하는 Job hub</div>
        </div>

        <div className="flex gap-2">
          <Link to="/postings">
            <Button variant="outline">공고</Button>
          </Link>
          <Link to="/board">
            <Button variant="outline">보드</Button>
          </Link>
          <Link to="/calendar">
            <Button variant="outline">캘린더</Button>
          </Link>
        </div>
      </div>

      {/* ✅ KPI 3장 */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs font-bold text-gray-600">지원 현황</div>
          <div className="mt-1 text-2xl font-black">{totalBoard}건</div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div>관심 {boardCounts.INTEREST}</div>
            <div>서류 {boardCounts.PREPARE}</div>
            <div>지원 {boardCounts.APPLIED}</div>
            <div>면접 {boardCounts.INTERVIEW}</div>
          </div>

          {totalBoard === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              공고 상세에서 <span className="font-bold">지원 만들기</span>로 카드가 생겨요.
            </div>
          )}

          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/board")}>
              보드 관리 →
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-gray-600">오늘 할 일</div>
          <div className="mt-1 text-2xl font-black">{actionKpi.dueToday}건</div>
          <div className="mt-2 text-sm text-gray-700">
            지연: <span className="font-black">{actionKpi.overdue}</span>건
          </div>

          {(actionKpi.dueToday === 0 && actionKpi.overdue === 0) && (
            <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              아래 Quick Actions로 <span className="font-bold">오늘 액션</span>을 바로 추가해봐요.
            </div>
          )}

          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              대시보드 →
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-xs font-bold text-gray-600">7일 이내 마감</div>
          <div className="mt-1 text-2xl font-black">{due7BoardCount}건</div>
          <div className="mt-2 text-sm text-gray-700">마감 임박</div>

          {due7BoardCount === 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
              관심 공고를 보드로 옮기면 마감 임박이 잡혀요.
            </div>
          )}

          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              마감 보기 →
            </Button>
          </div>
        </Card>
      </div>

      {/* ✅ Quick Actions: 오늘 액션 추가 */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-gray-600">Quick Actions</div>
            <div className="mt-1 text-xl font-black">오늘 액션 추가</div>
            <div className="mt-1 text-sm text-gray-600">
              선택한 카드에 <span className="font-bold">다음 액션 날짜=오늘</span> + 템플릿 메모를 바로 추가
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/board")}>
              보드에서 편집
            </Button>
          </div>
        </div>

        {quickCandidates.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            아직 보드 카드가 없어. <Link to="/postings" className="font-bold underline">공고</Link>에서
            공고를 선택하고 <span className="font-bold">지원 만들기</span>를 눌러봐요.
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            {/* 카드 선택 */}
            <div className="grid gap-2">
              <div className="text-xs font-bold text-gray-600">대상 카드</div>
              <select
                value={effectiveQuickCardId}
                onChange={(e) => setQuickCardId(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
              >
                {quickCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company} · {c.title} ({statusLabels[c.status]})
                  </option>
                ))}
              </select>

              {selectedQuickCard && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="font-extrabold">{selectedQuickCard.title}</div>
                  <div className="mt-1 text-gray-600">{selectedQuickCard.company}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                      다음 액션: {selectedQuickCard.nextActionDate || "-"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                      마감: {selectedQuickCard.deadline}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ddayBadgeClass(daysFromToday(selectedQuickCard.deadline))}`}>
                      {ddayText(daysFromToday(selectedQuickCard.deadline))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 템플릿 버튼 */}
            <div className="grid gap-2">
              <div className="text-xs font-bold text-gray-600">템플릿 선택</div>
              <div className="flex flex-wrap gap-2">
                {quickTemplates.map((t) => (
                  <Button key={t} variant="outline" onClick={() => applyTodayAction(t)}>
                    오늘: {t}
                  </Button>
                ))}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge>다음 액션 날짜 = {todayYmd}</Badge>
                <Button variant="ghost" size="sm" onClick={clearTodayAction}>
                  오늘 액션 날짜 지우기
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ✅ 메인 카드 2열 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 공고 카드 */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-600">공고</div>
              <div className="mt-1 text-xl font-black">탐색 요약</div>
              <div className="mt-1 text-sm text-gray-600">
                전체 {postingStats.total} · 요약 {postingStats.withSummary}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/postings")}>
              공고로 이동 →
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-sm font-extrabold">가까운 마감 TOP 3</div>
              <div className="mt-2 grid gap-2">
                {postingStats.top3Soon.length === 0 ? (
                  <div className="text-sm text-gray-600">마감일이 있는 공고가 없어요.</div>
                ) : (
                  postingStats.top3Soon.map(({ p, diff }) => (
                    <button
                      key={p._id}
                      onClick={() => navigate(`/postings/${p._id}`)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left hover:bg-gray-100 transition"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-extrabold">{p.title}</div>
                        <div className="mt-1 text-sm text-gray-600">{p.company}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ddayBadgeClass(diff)}`}>
                          {ddayText(diff)}
                        </span>
                        <div className="text-right text-xs text-gray-500">{p.deadline ?? "-"}</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <div className="flex items-end justify-between">
                <div className="text-sm font-extrabold">요약 없는 공고</div>
              </div>

              <div className="mt-2 grid gap-2">
                {postingStats.noSummaryTop3.length === 0 ? (
                  <div className="text-sm text-gray-600">요약 없는 공고가 없어요.</div>
                ) : (
                  postingStats.noSummaryTop3.map((p) => (
                    <div
                      key={p._id}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                    >
                      <button
                        onClick={() => navigate(`/postings/${p._id}`)}
                        className="min-w-0 text-left"
                        type="button"
                      >
                        <div className="truncate font-extrabold">{p.title}</div>
                        <div className="mt-1 text-sm text-gray-600">{p.company}</div>
                      </button>

                      <div className="flex items-center gap-2">
                        <Badge>요약 없음</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => alert("요약 생성은 백엔드 연동 후 활성화됩니다!")}
                        >
                          요약 생성
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 캘린더 카드 */}
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-gray-600">캘린더</div>
              <div className="mt-1 text-xl font-black">이번 달 마감</div>
              <div className="mt-1 text-sm text-gray-600">{monthLabel}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/calendar")}>
              캘린더로 이동 →
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500">
            {weekday.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {monthGrid.map((cell, idx) => {
              if (!cell.date || !cell.ymd) {
                return <div key={idx} className="h-10 rounded-xl border border-transparent" />;
              }
              const count = monthDeadlineMap.get(cell.ymd)?.length ?? 0;
              const isToday = cell.ymd === toYmd(new Date());
              const isSelected = cell.ymd === selectedYmd;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedYmd(cell.ymd!)}
                  className={[
                    "h-10 rounded-xl border px-2 py-1 text-left transition",
                    isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className={["text-sm font-extrabold", isToday ? "text-amber-700" : ""].join(" ")}>
                      {cell.date.getDate()}
                    </div>
                    {count > 0 && (
                      <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-black text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-sm font-extrabold">
              {selectedYmd} 마감 ({(monthDeadlineMap.get(selectedYmd) ?? []).length})
            </div>

            <div className="mt-2 grid gap-2">
              {selectedDayDeadlines.length === 0 ? (
                <div className="text-sm text-gray-600">이 날짜에는 마감 카드가 없어요.</div>
              ) : (
                selectedDayDeadlines.map((c) => {
                  const diff = daysFromToday(c.deadline);
                  return (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/postings/${c.postingId}`)}
                      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left hover:bg-gray-50 transition"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-extrabold">{c.title}</div>
                        <div className="mt-1 text-sm text-gray-600">{c.company}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${ddayBadgeClass(diff)}`}>
                          {ddayText(diff)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                          {statusLabels[c.status]}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                마감/액션 상세 →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-extrabold">바로 하기</div>
            <div className="mt-1 text-sm text-gray-600">
              공고 탐색 → 지원 보드 → 일정 관리 흐름으로 빠르게 이동
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" onClick={() => navigate("/postings")}>
              공고 탐색
            </Button>
            <Button variant="outline" onClick={() => navigate("/board")}>
              보드 관리
            </Button>
            <Button variant="outline" onClick={() => navigate("/calendar")}>
              캘린더 보기
            </Button>
          </div>
        </div>
      </Card>

      {totalBoard === 0 && (
        <Card className="p-4">
          <div className="text-sm text-gray-600">
            아직 보드 카드가 없어요.{" "}
            <Link to="/postings" className="font-bold underline">
              공고 목록
            </Link>
            에서 공고를 선택하고 <span className="font-bold">지원 만들기</span>를 눌러보세요!
          </div>
        </Card>
      )}
    </div>
  );
}
