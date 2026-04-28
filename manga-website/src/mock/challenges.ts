import type { WeeklyChallenge } from '../types';

const STORAGE_KEY = 'weekly_challenges';

// 预设挑战
const DEFAULT_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'challenge-1',
    week: '第 1 周',
    theme: '如果动物会说话',
    description: '想象一下，如果你的宠物突然会说话了，会发生什么有趣的故事？',
    emoji: '🐾',
    startDate: '2025-04-21',
    endDate: '2025-04-27',
    submissions: [
      { mangaId: 'demo-1', mangaTitle: '我家猫成精了', author: '漫画小白', votes: 42 },
      { mangaId: 'demo-2', mangaTitle: '狗的吐槽日常', author: '动漫爱好者', votes: 38 },
    ],
  },
  {
    id: 'challenge-2',
    week: '第 2 周',
    theme: '穿越到异世界',
    description: '一觉醒来，你发现自己身处一个完全不同的世界...',
    emoji: '🌀',
    startDate: '2025-04-28',
    endDate: '2025-05-04',
    submissions: [],
  },
  {
    id: 'challenge-3',
    week: '第 3 周',
    theme: '超级英雄的平凡一天',
    description: '即使拯救世界，也要吃饭睡觉。超级英雄的日常生活是怎样的？',
    emoji: '🦸',
    startDate: '2025-05-05',
    endDate: '2025-05-11',
    submissions: [],
  },
];

function getAll(): WeeklyChallenge[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHALLENGES));
    return DEFAULT_CHALLENGES;
  }
  return JSON.parse(stored);
}

export function getCurrentChallenge(): WeeklyChallenge | null {
  const challenges = getAll();
  const now = new Date();
  return challenges.find((c) => {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    return now >= start && now <= end;
  }) || challenges[0] || null;
}

export function getAllChallenges(): WeeklyChallenge[] {
  return getAll();
}

export function voteSubmission(challengeId: string, mangaId: string): boolean {
  const challenges = getAll();
  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return false;
  
  const submission = challenge.submissions.find((s) => s.mangaId === mangaId);
  if (!submission) return false;
  
  submission.votes += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  return true;
}
