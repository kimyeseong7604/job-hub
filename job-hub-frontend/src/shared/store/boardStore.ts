// src/shared/store/boardStore.ts
import { create } from "zustand";
import type { BookmarkCard, KanbanStatus } from "../../entities/bookmark";

type BoardState = {
  cards: BookmarkCard[];
  addCard: (card: Omit<BookmarkCard, "id">) => { created: boolean; cardId: string };
  moveCard: (id: string, status: KanbanStatus) => void;
  updateCard: (id: string, patch: Partial<Pick<BookmarkCard, "memo" | "nextActionDate">>) => void;
  findByPostingId: (postingId: string) => BookmarkCard | undefined;
};

export const useBoardStore = create<BoardState>((set, get) => ({
  cards: [],

  addCard: (card) => {
    const existed = get().cards.find((c) => c.postingId === card.postingId);
    if (existed) return { created: false, cardId: existed.id };

    const newCard: BookmarkCard = { ...card, id: crypto.randomUUID() };
    set((state) => ({ cards: [...state.cards, newCard] }));
    return { created: true, cardId: newCard.id };
  },

  moveCard: (id, status) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, status } : c)),
    })),

  updateCard: (id, patch) =>
    set((state) => ({
      cards: state.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  findByPostingId: (postingId) => get().cards.find((c) => c.postingId === postingId),
}));
