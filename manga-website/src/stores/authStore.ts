import { create } from 'zustand';
import type { User } from '../types';
import * as userMock from '../mock/user';

const DAILY_FREE_LIMIT = 3;
const CHECKIN_CREDIT = 2;

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (nickname: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  checkAuth: () => void;
  // 信用点相关
  getCreditBalance: () => number;
  getFreeToday: () => number;
  getFreeRemaining: () => number;
  canUseFree: () => boolean;
  consumeFree: () => { success: boolean; message: string };
  hasEnoughCredit: (cost: number) => boolean;
  consumeCredit: (cost: number) => { success: boolean; message: string };
  dailyCheckIn: () => { success: boolean; message: string; gained: number };
  // 付费解锁
  spendPointsForUnlock: (cost: number) => { success: boolean; message: string };
  // 管理员—用户管理
  allUsers: User[];
  loadAllUsers: () => void;
  updateUserRole: (userId: string, role: 'user' | 'admin') => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: userMock.getCurrentUser(),
  isLoggedIn: !!userMock.getCurrentUser(),
  isAdmin: userMock.isAdminUser(userMock.getCurrentUser()),

  login: (email: string, password: string) => {
    const result = userMock.loginUser(email, password);
    if (result.success && result.user) {
      set({ user: result.user, isLoggedIn: true, isAdmin: result.user.role === 'admin' });
    }
    return result;
  },

  register: (nickname: string, email: string, password: string) => {
    const result = userMock.registerUser(nickname, email, password);
    if (result.success && result.user) {
      userMock.setCurrentUser(result.user);
      set({ user: result.user, isLoggedIn: true, isAdmin: result.user.role === 'admin' });
    }
    return result;
  },

  logout: () => {
    userMock.logoutUser();
    set({ user: null, isLoggedIn: false, isAdmin: false });
  },

  checkAuth: () => {
    const user = userMock.getCurrentUser();
    set({ user, isLoggedIn: !!user, isAdmin: userMock.isAdminUser(user) });
  },

  // ============ 信用点操作 ============

  getCreditBalance: () => {
    const { user } = get();
    return user?.creditBalance ?? 0;
  },

  // 纯只读 getter，无副作用
  getFreeToday: () => {
    const { user } = get();
    if (!user) return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastFreeDate !== today) return 0;
    return user.freeToday;
  },

  getFreeRemaining: () => {
    const { user } = get();
    if (!user) return 0;
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastFreeDate !== today) return DAILY_FREE_LIMIT;
    return Math.max(0, DAILY_FREE_LIMIT - user.freeToday);
  },

  canUseFree: () => {
    return get().getFreeRemaining() > 0;
  },

  // 修复: 跨天自动重置 freeToday（内置日期检查）
  consumeFree: () => {
    const { user } = get();
    if (!user) return { success: false, message: '请先登录' };
    const today = new Date().toISOString().slice(0, 10);
    const isNewDay = user.lastFreeDate !== today;
    const effectiveFreeToday = isNewDay ? 0 : user.freeToday;
    const remaining = isNewDay ? DAILY_FREE_LIMIT : Math.max(0, DAILY_FREE_LIMIT - effectiveFreeToday);
    if (remaining <= 0) return { success: false, message: '今日免费次数已用完，请使用点数或明天再来' };
    const updated = { ...user, freeToday: effectiveFreeToday + 1, lastFreeDate: today };
    userMock.updateCurrentUser(updated);
    set({ user: updated });
    return { success: true, message: `已使用1次免费生成，剩余${remaining - 1}次` };
  },

  hasEnoughCredit: (cost: number) => {
    const { user } = get();
    if (!user) return false;
    return user.creditBalance >= cost;
  },

  // 修复: 防御性校验负数/零 cost
  consumeCredit: (cost: number) => {
    const { user } = get();
    if (!user) return { success: false, message: '请先登录' };
    if (cost <= 0) return { success: false, message: '无效的点数消耗' };
    if (user.creditBalance < cost) return { success: false, message: '点数不足，请充值或使用免费次数' };
    const updated = { ...user, creditBalance: user.creditBalance - cost };
    userMock.updateCurrentUser(updated);
    set({ user: updated });
    return { success: true, message: `已消耗${cost}点数，剩余${updated.creditBalance}点` };
  },

  dailyCheckIn: () => {
    const { user } = get();
    if (!user) return { success: false, message: '请先登录', gained: 0 };
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastCheckIn === today) return { success: false, message: '今日已签到，明天再来吧', gained: 0 };
    const updated = { ...user, creditBalance: user.creditBalance + CHECKIN_CREDIT, lastCheckIn: today };
    userMock.updateCurrentUser(updated);
    set({ user: updated });
    return { success: true, message: `签到成功！获得${CHECKIN_CREDIT}点数`, gained: CHECKIN_CREDIT };
  },

  // ========== 付费解锁消费点数 ==========
  spendPointsForUnlock: (cost) => {
    const { user } = get();
    if (!user) return { success: false, message: '请先登录' };
    if (cost <= 0) return { success: false, message: '无效的点数消耗' };
    if (user.creditBalance < cost) return { success: false, message: '点数不足，请充值' };
    const updated = { ...user, creditBalance: user.creditBalance - cost };
    userMock.updateCurrentUser(updated);
    set({ user: updated });
    return { success: true, message: `已消耗${cost}点数解锁作品` };
  },

  // ========== 管理员—用户管理 ==========
  allUsers: [],
  loadAllUsers: () => {
    set({ allUsers: userMock.getAllUsers() });
  },
  updateUserRole: (userId, role) => {
    const ok = userMock.setUserRole(userId, role);
    if (ok) {
      set({ allUsers: userMock.getAllUsers() });
    }
    return ok;
  },
}));
