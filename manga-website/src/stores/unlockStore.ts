import { create } from 'zustand';
import type { UnlockRecord } from '../types';
import * as unlockMock from '../mock/unlock';

interface UnlockState {
  unlockedIds: string[];
  loadUnlocked: (userId: string) => void;
  isUnlocked: (mangaId: string) => boolean;
  unlock: (userId: string, mangaId: string) => UnlockRecord;
}

export const useUnlockStore = create<UnlockState>((set, get) => ({
  unlockedIds: [],

  loadUnlocked: (userId) => {
    set({ unlockedIds: unlockMock.getUserUnlockedMangaIds(userId) });
  },

  isUnlocked: (mangaId) => {
    return get().unlockedIds.includes(mangaId);
  },

  unlock: (userId, mangaId) => {
    const record = unlockMock.unlockManga(userId, mangaId);
    set({ unlockedIds: [...get().unlockedIds, mangaId] });
    return record;
  },
}));
