import type { User } from '../types';

const STORAGE_KEY = 'users_data';
const CURRENT_USER_KEY = 'current_user';

// 内置默认管理员账号
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  nickname: '平台管理员',
  email: 'admin@ai-manga.com',
  password: 'admin123',
  role: 'admin',
  creditBalance: 999,
  freeToday: 0,
  lastFreeDate: '',
  lastCheckIn: '',
  createdAt: new Date().toISOString(),
};

// 初始化
function getUsers(): User[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  let users: User[];
  if (!stored) {
    users = [DEFAULT_ADMIN];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    return users;
  }
  try {
    users = JSON.parse(stored);
  } catch {
    users = [];
  }
  // 确保管理员账号始终存在（兼容旧数据无管理员的情况）
  if (!users.find((u) => u.id === DEFAULT_ADMIN.id)) {
    users.unshift(DEFAULT_ADMIN);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
  return users;
}

function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// 注册（邮箱 + 昵称 + 密码）
export function registerUser(nickname: string, email: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  
  if (users.find((u) => u.email === email)) {
    return { success: false, message: '该邮箱已被注册' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    nickname,
    email,
    password,
    role: 'user',
    creditBalance: 5,
    freeToday: 0,
    lastFreeDate: '',
    lastCheckIn: '',
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: '注册成功', user: newUser };
}

// 登录（邮箱 + 密码）
export function loginUser(email: string, password: string): { success: boolean; message: string; user?: User } {
  const users = getUsers();
  const user = users.find((u) => u.email === email);
  
  if (!user) {
    return { success: false, message: '该邮箱未注册' };
  }
  if (user.password !== password) {
    return { success: false, message: '密码错误' };
  }

  setCurrentUser(user);
  return { success: true, message: '登录成功', user };
}

// 设置当前登录用户
export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// 获取当前登录用户
export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// 登出
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// 判断指定用户是否为管理员
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

// 获取所有注册用户
export function getAllUsers(): User[] {
  return getUsers();
}

// 设置用户角色（管理员提拔/降级）
export function setUserRole(userId: string, role: 'user' | 'admin'): boolean {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  users[idx] = { ...users[idx], role };
  saveUsers(users);
  return true;
}

// 更新当前用户（用于信用额度变动）同时同步到 users_data 数组
export function updateCurrentUser(user: User) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx !== -1) {
    users[idx] = user;
    saveUsers(users);
  }
}
