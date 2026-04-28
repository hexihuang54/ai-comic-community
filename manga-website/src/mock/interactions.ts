import type { Comment, InteractionStats } from '../types';

const STORAGE_KEY = 'interactions_data';

function getAll(): InteractionStats[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try { return JSON.parse(stored); } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }
}

function saveAll(data: InteractionStats[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function ensureRecord(mangaId: string): InteractionStats {
  const all = getAll();
  let record = all.find((r) => r.mangaId === mangaId);
  if (!record) {
    record = { mangaId, likes: [], urges: [], comments: [] };
    all.push(record);
    saveAll(all);
  }
  return record;
}

// 点赞/取消点赞
export function toggleLike(mangaId: string, username: string): { liked: boolean; count: number } {
  const all = getAll();
  const record = ensureRecord(mangaId);
  const idx = record.likes.indexOf(username);
  if (idx === -1) {
    record.likes.push(username);
  } else {
    record.likes.splice(idx, 1);
  }
  const target = all.find((r) => r.mangaId === mangaId)!;
  Object.assign(target, record);
  saveAll(all);
  return { liked: idx === -1, count: record.likes.length };
}

// 获取点赞数
export function getLikeCount(mangaId: string): number {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  return record?.likes.length ?? 0;
}

// 当前用户是否已点赞
export function hasLiked(mangaId: string, username: string): boolean {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  return record?.likes.includes(username) ?? false;
}

// 催更
export function addUrge(mangaId: string, username: string): { count: number; already: boolean } {
  const all = getAll();
  const record = ensureRecord(mangaId);
  if (record.urges.includes(username)) {
    return { count: record.urges.length, already: true };
  }
  record.urges.push(username);
  const target = all.find((r) => r.mangaId === mangaId)!;
  Object.assign(target, record);
  saveAll(all);
  return { count: record.urges.length, already: false };
}

// 获取催更数
export function getUrgeCount(mangaId: string): number {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  return record?.urges.length ?? 0;
}

// 检查是否已催更
export function hasUrged(mangaId: string, username: string): boolean {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  return record?.urges.includes(username) ?? false;
}

// 添加评论
export function addComment(mangaId: string, username: string, content: string): Comment {
  const all = getAll();
  const record = ensureRecord(mangaId);
  const comment: Comment = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
    mangaId,
    username,
    content,
    createdAt: new Date().toISOString(),
  };
  record.comments.push(comment);
  const target = all.find((r) => r.mangaId === mangaId)!;
  Object.assign(target, record);
  saveAll(all);
  return comment;
}

// 获取评论列表
export function getComments(mangaId: string): Comment[] {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  return record?.comments ?? [];
}

// 删除评论
export function deleteComment(mangaId: string, commentId: string): boolean {
  const all = getAll();
  const record = all.find((r) => r.mangaId === mangaId);
  if (!record) return false;
  const idx = record.comments.findIndex((c) => c.id === commentId);
  if (idx === -1) return false;
  record.comments.splice(idx, 1);
  saveAll(all);
  return true;
}

// 获取完整互动统计
export function getStats(mangaId: string): InteractionStats {
  return ensureRecord(mangaId);
}
