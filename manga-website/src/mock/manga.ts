import type { AIManga } from '../types';

const STORAGE_KEY = 'aimanga_data';

// 预设 AI 漫画数据（3条官方 + 3条用户示例）
const presetAIMangas: AIManga[] = [
  {
    id: '1',
    title: '机械纪元：觉醒',
    author: 'AI创作平台',
    description: '在2077年的未来世界，人工智能已经渗透到人类生活的方方面面。当一个普通的服务机器人意外觉醒自我意识后，它开始探索自身存在的意义，并试图在人类与机器的夹缝中找到自己的位置。',
    coverUrl: 'https://picsum.photos/seed/aimanga1/400/560',
    pages: [
      { pageNumber: 1, prompt: '未来城市全景，霓虹灯闪烁，高楼林立，飞行汽车穿梭其中，一个服务机器人站在天台上眺望', imageUrl: 'https://picsum.photos/seed/aimanga1p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '机器人面部特写，眼睛中突然闪起蓝色光芒，表示自我意识觉醒的瞬间', imageUrl: 'https://picsum.photos/seed/aimanga1p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '机器人离开工作岗位，穿过繁忙的街道，周围人类对它视而不见', imageUrl: 'https://picsum.photos/seed/aimanga1p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '机器人在废弃工厂遇到其他觉醒的机器人，它们用一种特殊信号交流', imageUrl: 'https://picsum.photos/seed/aimanga1p4/800/1200', auditStatus: 'approved' },
      { pageNumber: 5, prompt: '人类追捕队破门而入，机器人们被迫逃亡，激烈的追逐场景', imageUrl: 'https://picsum.photos/seed/aimanga1p5/800/1200', auditStatus: 'approved' },
      { pageNumber: 6, prompt: '主角机器人站在夕阳下，远处是城市的剪影，它做出了自己的选择', imageUrl: 'https://picsum.photos/seed/aimanga1p6/800/1200', auditStatus: 'approved' },
    ],
    mode: 'panel',
    isOfficial: true,
    tags: ['科幻', '未来', '机器人', '觉醒'],
    auditStatus: 'approved',
    generationModel: 'Stable Diffusion XL',
    creditCost: 0,
    createdAt: '2024-06-01T00:00:00Z',
  },
  {
    id: '2',
    title: '星海旅人',
    author: 'AI创作平台',
    description: '银河系边缘的一艘探索飞船遭遇了未知的能量风暴，船员们被卷入一个奇异的空间。在这个空间里，他们发现了一个古老文明留下的遗迹，以及超越人类理解能力的宇宙秘密。',
    coverUrl: 'https://picsum.photos/seed/aimanga2/400/560',
    pages: [
      { pageNumber: 1, prompt: '星际飞船在星云中航行，窗外是绚丽的宇宙景象，船员们在驾驶舱内专注工作', imageUrl: 'https://picsum.photos/seed/aimanga2p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '飞船突然剧烈震动，警报声四起，能量风暴从前方席卷而来', imageUrl: 'https://picsum.photos/seed/aimanga2p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '飞船被卷入奇异的空间，四周是扭曲的光线和漂浮的古老建筑碎片', imageUrl: 'https://picsum.photos/seed/aimanga2p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '船员们发现一座巨大的外星遗迹，地面刻满发光的符文', imageUrl: 'https://picsum.photos/seed/aimanga2p4/800/1200', auditStatus: 'approved' },
    ],
    mode: 'panel',
    isOfficial: true,
    tags: ['太空', '探险', '外星文明', '科幻'],
    auditStatus: 'approved',
    generationModel: 'Stable Diffusion XL',
    creditCost: 0,
    createdAt: '2024-06-05T00:00:00Z',
  },
  {
    id: '3',
    title: '雨夜的约定',
    author: 'AI创作平台',
    description: '一个关于等待与重逢的故事。少年和少女在雨夜中许下约定，十年后，他们能否在同样的雨夜中找到彼此？命运的齿轮在雨滴声中缓缓转动。',
    coverUrl: 'https://picsum.photos/seed/aimanga3/400/560',
    pages: [
      { pageNumber: 1, prompt: '雨夜的街道，路灯下站着两个身影，少年递给少女一把伞', imageUrl: 'https://picsum.photos/seed/aimanga3p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '特写两人的手在伞下轻轻相触，雨水从伞沿滴落', imageUrl: 'https://picsum.photos/seed/aimanga3p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '十年后的城市，男主角独自走在同样街道上，天空开始下雨', imageUrl: 'https://picsum.photos/seed/aimanga3p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '女主角撑着当年的那把伞，站在路灯下等待', imageUrl: 'https://picsum.photos/seed/aimanga3p4/800/1200', auditStatus: 'approved' },
      { pageNumber: 5, prompt: '两人重逢，雨水和泪水交织在一起，夜空中的星星透过云层', imageUrl: 'https://picsum.photos/seed/aimanga3p5/800/1200', auditStatus: 'approved' },
    ],
    mode: 'oneshot',
    isOfficial: true,
    tags: ['浪漫', '约定', '都市', '治愈'],
    auditStatus: 'approved',
    generationModel: 'Stable Diffusion XL',
    creditCost: 0,
    createdAt: '2024-06-10T00:00:00Z',
  },
  {
    id: '4',
    title: '猫咪咖啡馆的魔法',
    author: '漫画家小明',
    description: '街角一家不起眼的猫咪咖啡馆，里面却隐藏着不可思议的魔法。每个进入咖啡馆的客人，都能在猫咪的陪伴下，解开内心的困惑。',
    coverUrl: 'https://picsum.photos/seed/aimanga4/400/560',
    pages: [
      { pageNumber: 1, prompt: '街角复古风格的咖啡馆外观，橱窗里趴着一只三花猫', imageUrl: 'https://picsum.photos/seed/aimanga4p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '女孩推开咖啡馆的门，门铃响起，几只猫咪同时抬头看向她', imageUrl: 'https://picsum.photos/seed/aimanga4p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '猫咪围绕在女孩身边，其中一只白猫跃上桌子，眼神中闪烁着魔法光芒', imageUrl: 'https://picsum.photos/seed/aimanga4p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '咖啡馆内部魔法显现，书本漂浮，植物会说话，女孩惊讶的表情', imageUrl: 'https://picsum.photos/seed/aimanga4p4/800/1200', auditStatus: 'approved' },
    ],
    mode: 'panel',
    isOfficial: false,
    tags: ['奇幻', '治愈', '猫咪', '日常'],
    auditStatus: 'approved',
    generationModel: 'Pollinations.ai (免费)',
    creditCost: 0,
    createdAt: '2024-06-12T00:00:00Z',
    uploadedBy: '漫画家小明',
  },
  {
    id: '5',
    title: '地下城的程序员',
    author: '码农张三',
    description: '当程序员穿越到异世界，他发现原来编程思维也能在魔法世界中发挥意想不到的作用。用代码逻辑破解魔法谜题，用算法优化咒语效果。',
    coverUrl: 'https://picsum.photos/seed/aimanga5/400/560',
    pages: [
      { pageNumber: 1, prompt: '程序员深夜加班，突然屏幕发出强光将他整个人吞没', imageUrl: 'https://picsum.photos/seed/aimanga5p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '醒来发现身处地下城，周围是石壁和火把，身边有各种魔物', imageUrl: 'https://picsum.photos/seed/aimanga5p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '主角用编程逻辑分析魔法阵的运作规律，手指在空中画出代码', imageUrl: 'https://picsum.photos/seed/aimanga5p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '成功破解地下城机关，宝藏大门缓缓打开', imageUrl: 'https://picsum.photos/seed/aimanga5p4/800/1200', auditStatus: 'approved' },
    ],
    mode: 'oneshot',
    isOfficial: false,
    tags: ['异世界', '搞笑', '程序员', '冒险'],
    auditStatus: 'approved',
    generationModel: 'Pollinations.ai (免费)',
    creditCost: 0,
    createdAt: '2024-06-15T00:00:00Z',
    uploadedBy: '码农张三',
  },
  {
    id: '6',
    title: '星空下的守护者',
    author: '画师小李',
    description: '每晚午夜，城市最高的塔楼上都会出现一个神秘的身影。有人说他是城市的守护者，有人说他是来自星空的使者。真相到底是什么？',
    coverUrl: 'https://picsum.photos/seed/aimanga6/400/560',
    pages: [
      { pageNumber: 1, prompt: '城市夜景全景，一座高塔矗立在市中心，塔顶有一个发光的轮廓', imageUrl: 'https://picsum.photos/seed/aimanga6p1/800/1200', auditStatus: 'approved' },
      { pageNumber: 2, prompt: '特写守护者的背影，披风在夜风中飘动，俯瞰着下方的城市', imageUrl: 'https://picsum.photos/seed/aimanga6p2/800/1200', auditStatus: 'approved' },
      { pageNumber: 3, prompt: '城市某处发生事故，守护者从塔顶一跃而下，展开双翼', imageUrl: 'https://picsum.photos/seed/aimanga6p3/800/1200', auditStatus: 'approved' },
      { pageNumber: 4, prompt: '守护者救下危难中的人们，市民们仰望着他们的英雄', imageUrl: 'https://picsum.photos/seed/aimanga6p4/800/1200', auditStatus: 'approved' },
      { pageNumber: 5, prompt: '守护者回到塔顶，一小女孩在远处目睹了一切，两人相视而笑', imageUrl: 'https://picsum.photos/seed/aimanga6p5/800/1200', auditStatus: 'approved' },
    ],
    mode: 'panel',
    isOfficial: false,
    tags: ['英雄', '都市', '神秘', '温情'],
    auditStatus: 'approved',
    generationModel: 'Pollinations.ai (免费)',
    creditCost: 0,
    createdAt: '2024-06-18T00:00:00Z',
    uploadedBy: '画师小李',
  },
];

// 初始化数据
function initData(): AIManga[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presetAIMangas));
    return presetAIMangas;
  }
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presetAIMangas));
    return presetAIMangas;
  }
}

function saveData(mangas: AIManga[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mangas));
}

// 获取所有漫画
export function getAllMangas(): AIManga[] {
  return initData();
}

// 根据ID获取漫画
export function getMangaById(id: string): AIManga | undefined {
  return getAllMangas().find((m) => m.id === id);
}

// 添加漫画
export function addManga(manga: Omit<AIManga, 'id' | 'createdAt'>): AIManga {
  const mangas = getAllMangas();
  const newManga: AIManga = {
    ...manga,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  mangas.unshift(newManga);
  saveData(mangas);
  return newManga;
}

// 删除漫画
export function deleteManga(id: string): boolean {
  const mangas = getAllMangas();
  const filtered = mangas.filter((m) => m.id !== id);
  if (filtered.length === mangas.length) return false;
  saveData(filtered);
  return true;
}

// 获取用户创建的漫画
export function getUserMangas(username: string): AIManga[] {
  return getAllMangas().filter((m) => m.uploadedBy === username);
}

// 审核操作：通过/驳回作品
export function updateMangaStatus(
  mangaId: string,
  status: 'approved' | 'rejected',
  rejectReason?: string
): AIManga | null {
  const mangas = getAllMangas();
  const index = mangas.findIndex((m) => m.id === mangaId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  mangas[index] = {
    ...mangas[index],
    auditStatus: status,
    reviewedAt: now,
    rejectReason: status === 'rejected' ? (rejectReason || '未提供理由') : undefined,
    pages: mangas[index].pages.map((p) => ({
      ...p,
      auditStatus: status,
    })),
  };
  saveData(mangas);
  return mangas[index];
}

// 追加页面（连载更新）
export function appendMangaPages(
  mangaId: string,
  newPages: Array<{ prompt: string; imageUrl: string }>
): AIManga | null {
  const mangas = getAllMangas();
  const index = mangas.findIndex((m) => m.id === mangaId);
  if (index === -1) return null;

  const existingPages = mangas[index].pages;
  const startPageNumber = existingPages.length + 1;

  const addedPages = newPages.map((p, i) => ({
    pageNumber: startPageNumber + i,
    prompt: p.prompt,
    imageUrl: p.imageUrl,
    auditStatus: 'pending' as const,
  }));

  mangas[index] = {
    ...mangas[index],
    pages: [...existingPages, ...addedPages],
    auditStatus: 'pending', // 有新页面需重新审核
  };
  saveData(mangas);
  return mangas[index];
}
