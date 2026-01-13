import { useState } from "react";
import type { BookmarkCard } from "../../entities/bookmark";
import Button from "./Button";

type Props = {
  open: boolean;
  card: BookmarkCard | null;
  onClose: () => void;
  onSave: (patch: { memo: string; nextActionDate: string }) => void;
};

const templates = [
  "자소서 1차 초안 작성",
  "포트폴리오 업데이트",
  "코테 대비 문제풀이",
  "면접 예상질문 정리",
  "기업/직무 리서치",
] as const;

export default function BoardCardEditModal({ open, card, onClose, onSave }: Props) {
  const initialMemo = card?.memo ?? "";
  const initialNextActionDate = card?.nextActionDate ?? "";

  const [memo, setMemo] = useState(initialMemo);
  const [nextActionDate, setNextActionDate] = useState(initialNextActionDate);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-base font-black">카드 편집</div>
            <div className="mt-1 text-sm text-gray-600">
              {card ? `${card.company} · ${card.title}` : ""}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <div className="text-xs font-bold text-gray-600">다음 액션 날짜</div>
            <input
              type="date"
              value={nextActionDate}
              onChange={(e) => setNextActionDate(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>

          <div className="grid gap-2">
            <div className="text-xs font-bold text-gray-600">빠른 템플릿</div>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant="outline"
                  onClick={() => setMemo((prev) => (prev ? `${prev}\n- ${t}` : `- ${t}`))}
                  type="button"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <label className="grid gap-2">
            <div className="text-xs font-bold text-gray-600">메모</div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="예: - 자소서 1차 초안 작성"
              rows={6}
              className="rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button variant="default" onClick={() => onSave({ memo: memo.trim(), nextActionDate })}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}
