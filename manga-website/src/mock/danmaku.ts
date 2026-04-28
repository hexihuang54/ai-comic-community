import type { Danmaku } from '../types';

const STORAGE_KEY = 'danmaku_records';

const DANMAKU_COLORS = ['#fff', '#ff4d4f', '#faad14', '#52c41a', '#1890ff', '#722ed1', '#eb2f96'];

function getAll(): Danmaku[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveAll(records: Danmaku[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addDanmaku(mangaId: string, pageNumber: number, username: string, content: string): Danmaku {
  const records = getAll();
  const color = DANMAKU_COLORS[Math.floor(Math.random() * DANMAKU_COLORS.length)];
  const danmaku: Danmaku = {
    id: Date.now().toString() + Math.random(),
    mangaId,
    pageNumber,
    content,
    username,
    color,
    createdAt: new Date().toISOString(),
  };
  records.push(danmaku);
  saveAll(records);
  return danmaku;
}

export function getPageDanmaku(mangaId: string, pageNumber: number): Danmaku[] {
  return getAll().filter((d) => d.mangaId === mangaId && d.pageNumber === pageNumber);
}

export function getAllDanmaku(mangaId: string): Danmaku[] {
  return getAll().filter((d) => d.mangaId === mangaId);
}
