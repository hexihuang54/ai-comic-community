// AI 漫画的单页
export interface AIPage {
  pageNumber: number;
  prompt: string;
  imageUrl: string;
  regenerated?: boolean;
  auditStatus?: 'pending' | 'approved' | 'rejected';
}

// AI 漫画作品（完整数据模型）
export interface AIManga {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  pages: AIPage[];
  mode: 'panel' | 'oneshot';
  isOfficial: boolean;
  tags?: string[];
  auditStatus: 'pending' | 'approved' | 'rejected';
  generationModel: string;
  creditCost: number;
  createdAt: string;
  uploadedBy?: string;
  reviewedAt?: string;
  rejectReason?: string;
  // 付费阅读
  isPaid?: boolean;
  freePages?: number;
  pricePoints?: number;
}

// 用户类型
export interface User {
  id: string;
  nickname: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  creditBalance: number;
  freeToday: number;
  lastFreeDate: string;
  lastCheckIn: string;
  createdAt: string;
}

// 登录表单（邮箱登录）
export interface LoginForm {
  email: string;
  password: string;
}

// 注册表单（邮箱+昵称+密码）
export interface RegisterForm {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

// AI 创作表单（分镜模式）
export interface PanelCreateForm {
  title: string;
  description: string;
}

// AI 创作表单（一次性模式）
export interface OneShotCreateForm {
  title: string;
  description: string;
  storyPrompt: string;
  pageCount: number;
}

// 评论
export interface Comment {
  id: string;
  mangaId: string;
  username: string;
  content: string;
  createdAt: string;
}

// 互动统计
export interface InteractionStats {
  mangaId: string;
  likes: string[];
  urges: string[];
  comments: Comment[];
}

// 付费解锁记录
export interface UnlockRecord {
  userId: string;
  mangaId: string;
  unlockedAt: string;
}

// 创作者收益记录
export interface EarningRecord {
  id: string;
  mangaId: string;
  mangaTitle: string;
  authorNickname: string;
  payerNickname: string;
  points: number;
  createdAt: string;
}

// 弹幕
export interface Danmaku {
  id: string;
  mangaId: string;
  pageNumber: number;
  content: string;
  username: string;
  color: string;
  createdAt: string;
}

// 接龙作品
export interface MangaChain {
  id: string;
  originalMangaId: string;
  originalTitle: string;
  chainTitle: string;
  author: string;
  pages: AIPage[];
  createdAt: string;
  likes: number;
}

// 每周挑战
export interface WeeklyChallenge {
  id: string;
  week: string;
  theme: string;
  description: string;
  emoji: string;
  startDate: string;
  endDate: string;
  submissions: ChallengeSubmission[];
}

export interface ChallengeSubmission {
  mangaId: string;
  mangaTitle: string;
  author: string;
  votes: number;
}
