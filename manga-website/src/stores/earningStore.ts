import { create } from 'zustand';
import type { EarningRecord } from '../types';
import * as earningMock from '../mock/earnings';

interface EarningState {
  earnings: EarningRecord[];
  totalPoints: number;
  loadEarnings: (authorNickname: string) => void;
  addEarning: (record: Omit<EarningRecord, 'id' | 'createdAt'>) => void;
  refreshEarnings: (authorNickname: string) => void;
}

export const useEarningStore = create<EarningState>((set) => ({
  earnings: [],
  totalPoints: 0,

  loadEarnings: (authorNickname) => {
    set({
      earnings: earningMock.getAuthorEarnings(authorNickname),
      totalPoints: earningMock.getAuthorTotalPoints(authorNickname),
    });
  },

  addEarning: (record) => {
    earningMock.addEarning(record);
  },

  refreshEarnings: (authorNickname) => {
    set({
      earnings: earningMock.getAuthorEarnings(authorNickname),
      totalPoints: earningMock.getAuthorTotalPoints(authorNickname),
    });
  },
}));
