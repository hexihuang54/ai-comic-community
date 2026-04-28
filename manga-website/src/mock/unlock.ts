import type { UnlockRecord } from '../types';

const STORAGE_KEY = 'unlock_records';

function getAll(): UnlockRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(records: UnlockRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// 检查用户是否已解锁某部作品
export function isUnlocked(userId: string, mangaId: string): boolean {
  return getAll().some((r) => r.userId === userId && r.mangaId === mangaId);
}

// 解锁作品
export function unlockManga(userId: string, mangaId: string): UnlockRecord {
  const records = getAll();
  if (records.some((r) => r.userId === userId && r.mangaId === mangaId)) {
    return records.find((r) => r.userId === userId && r.mangaId === mangaId)!;
  }
  const record: UnlockRecord = {
    userId,
    mangaId,
    unlockedAt: new Date().toISOString(),
  };
  records.push(record);
  saveAll(records);
  return record;
}

// 获取用户解锁的所有作品ID列表
export function getUserUnlockedMangaIds(userId: string): string[] {
  return getAll().filter((r) => r.userId === userId).map((r) => r.mangaId);
}

// 获取某部作品被多少人解锁
export function getMangaUnlockCount(mangaId: string): number {
  return getAll().filter((r) => r.mangaId === mangaId).length;
}
