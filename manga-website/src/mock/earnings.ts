import type { EarningRecord } from '../types';

const STORAGE_KEY = 'earning_records';

function getAll(): EarningRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(records: EarningRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 添加一条收益记录
export function addEarning(record: Omit<EarningRecord, 'id' | 'createdAt'>): EarningRecord {
  const records = getAll();
  const newRecord: EarningRecord = {
    ...record,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  records.unshift(newRecord);
  saveAll(records);
  return newRecord;
}

// 获取某作者的收益记录（按 uploadedBy 或 authorNickname 筛选）
export function getAuthorEarnings(authorNickname: string): EarningRecord[] {
  return getAll().filter((r) => r.authorNickname === authorNickname);
}

// 获取作者总收益（点数）
export function getAuthorTotalPoints(authorNickname: string): number {
  return getAuthorEarnings(authorNickname).reduce((sum, r) => sum + r.points, 0);
}

// 获取某部作品的收益记录
export function getMangaEarnings(mangaId: string): EarningRecord[] {
  return getAll().filter((r) => r.mangaId === mangaId);
}
