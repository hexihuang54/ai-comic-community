// 漫画创作模板

export interface MangaTemplate {
  id: string;
  name: string;
  emoji: string;
  description: string;
  style: string; // AI 风格关键词
  fields: TemplateField[];
  pages: PageTemplate[];
}

export interface TemplateField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'select';
  options?: string[];
  maxLength?: number;
}

export interface PageTemplate {
  promptTemplate: string; // 包含 {fieldName} 占位符
}

// 预设模板库
export const MANGA_TEMPLATES: MangaTemplate[] = [
  {
    id: 'school-romance',
    name: '校园恋爱',
    emoji: '🌸',
    description: '青春校园里的甜蜜恋爱故事',
    style: 'anime style, school romance, soft lighting, kawaii, pastel colors',
    fields: [
      { key: 'heroName', label: '男主名字', placeholder: '例如：小明', type: 'text', maxLength: 10 },
      { key: 'heroineName', label: '女主名字', placeholder: '例如：小樱', type: 'text', maxLength: 10 },
      { key: 'scene', label: '故事场景', placeholder: '选择主要场景', type: 'select', options: ['教室', '操场', '图书馆', '天台', '樱花树下'] },
      { key: 'plot', label: '关键情节', placeholder: '选择情节走向', type: 'select', options: ['初次相遇', '表白', '误会', '和好', '毕业告别'] },
    ],
    pages: [
      { promptTemplate: 'Anime style, {scene}, spring season, cherry blossoms falling, a handsome boy named {heroName} walking alone, looking slightly lonely, detailed school background, soft pastel colors, manga panel' },
      { promptTemplate: 'Anime style, {scene}, a cute girl named {heroineName} laughing with friends, bright smile, sunlight shining through windows, beautiful anime girl, kawaii style' },
      { promptTemplate: 'Anime style, {heroName} and {heroineName} accidentally bump into each other, books falling on the ground, close-up of their eyes meeting, romantic atmosphere, cherry blossoms in background' },
      { promptTemplate: 'Anime style, {heroName} helping {heroineName} pick up books, their hands touching briefly, both blushing, close-up shot, romantic school anime style' },
      { promptTemplate: 'Anime style, {heroName} and {heroineName} sitting together in {scene}, talking and laughing, warm sunset lighting through windows, beautiful school romance scene' },
      { promptTemplate: 'Anime style, {heroName} and {heroineName} walking home together under cherry blossom trees, sunset, romantic atmosphere, they almost hold hands, beautiful anime ending scene' },
    ],
  },
  {
    id: 'fantasy-adventure',
    name: '奇幻冒险',
    emoji: '⚔️',
    description: '勇者在魔法世界的冒险旅程',
    style: 'fantasy anime, epic adventure, magical world, detailed background, dynamic action',
    fields: [
      { key: 'heroName', label: '勇者名字', placeholder: '例如：亚瑟', type: 'text', maxLength: 10 },
      { key: 'weapon', label: '武器', placeholder: '选择武器', type: 'select', options: ['圣剑', '魔法杖', '弓箭', '战斧', '双刀'] },
      { key: 'enemy', label: '敌人', placeholder: '选择敌人', type: 'select', options: ['魔王', '恶龙', '暗黑骑士', '亡灵军团', '邪恶魔王'] },
      { key: 'magicElement', label: '魔法元素', placeholder: '选择魔法属性', type: 'select', options: ['火焰', '冰霜', '雷电', '光明', '暗影'] },
    ],
    pages: [
      { promptTemplate: 'Fantasy anime style, a young warrior named {heroName} standing in a medieval village, holding a {weapon}, looking determined, epic fantasy background, detailed anime art style' },
      { promptTemplate: 'Fantasy anime style, {heroName} wielding {weapon} with {magicElement} magic aura, casting a spell, dynamic action pose, magical effects, epic battle scene' },
      { promptTemplate: 'Fantasy anime style, terrifying {enemy} appearing in a dark castle, menacing aura, dark atmosphere, ominous lighting, fantasy anime villain design' },
      { promptTemplate: 'Fantasy anime style, epic battle between {heroName} and {enemy}, {weapon} clashing with dark power, {magicElement} magic exploding, dramatic action scene' },
      { promptTemplate: 'Fantasy anime style, {heroName} victorious, standing over defeated {enemy}, {magicElement} energy fading, triumphant pose, rays of light breaking through darkness' },
      { promptTemplate: 'Fantasy anime style, {heroName} returning home as a hero, villagers cheering, sunset lighting, peaceful ending, epic adventure conclusion' },
    ],
  },
  {
    id: 'daily-comedy',
    name: '日常搞笑',
    emoji: '😂',
    description: '轻松搞笑的日常生活故事',
    style: 'comedy anime, slice of life, exaggerated expressions, funny, lighthearted',
    fields: [
      { key: 'characterName', label: '主角名字', placeholder: '例如：阿呆', type: 'text', maxLength: 10 },
      { key: 'setting', label: '故事背景', placeholder: '选择场景', type: 'select', options: ['家庭', '办公室', '便利店', '健身房', '咖啡馆'] },
      { key: 'comedyElement', label: '搞笑元素', placeholder: '选择搞笑类型', type: 'select', options: ['误会', '摔倒', '吃瘪', '夸张反应', '反转'] },
    ],
    pages: [
      { promptTemplate: 'Comedy anime style, {characterName} in {setting}, looking confident and happy, bright lighting, exaggerated anime expression, funny slice of life anime' },
      { promptTemplate: 'Comedy anime style, unexpected situation happens to {characterName} in {setting}, surprised exaggerated expression, funny anime comedy moment, comedic timing' },
      { promptTemplate: 'Comedy anime style, {characterName} trying to handle {comedyElement}, making things worse, hilarious exaggerated reaction, funny anime scene' },
      { promptTemplate: 'Comedy anime style, {comedyElement} escalating, {characterName} in complete chaos, multiple funny elements, comedic anime exaggeration' },
      { promptTemplate: 'Comedy anime style, {characterName} embarrassed after {comedyElement}, others laughing, funny embarrassed anime expression, comedic ending' },
    ],
  },
  {
    id: 'scifi-cyberpunk',
    name: '科幻未来',
    emoji: '🤖',
    description: '赛博朋克世界的科幻故事',
    style: 'cyberpunk anime, futuristic city, neon lights, sci-fi, mecha, dystopian',
    fields: [
      { key: 'heroName', label: '主角名字', placeholder: '例如：K', type: 'text', maxLength: 10 },
      { key: 'role', label: '身份', placeholder: '选择身份', type: 'select', options: ['黑客', '赏金猎人', 'AI机器人', '公司特工', '反抗军'] },
      { key: 'tech', label: '科技元素', placeholder: '选择科技', type: 'select', options: ['义体改造', '虚拟现实', '时间旅行', '人工智能', '太空飞船'] },
    ],
    pages: [
      { promptTemplate: 'Cyberpunk anime style, futuristic city at night with neon lights, {heroName} as a {role}, wearing high-tech gear, rain falling, cyberpunk atmosphere, detailed background' },
      { promptTemplate: 'Cyberpunk anime style, {heroName} using {tech}, holographic screens floating around, glowing neon effects, high-tech cyberpunk scene, anime style' },
      { promptTemplate: 'Cyberpunk anime style, {heroName} discovering a dark conspiracy, corporate building in background, mysterious atmosphere, cyberpunk thriller mood' },
      { promptTemplate: 'Cyberpunk anime style, action scene, {heroName} fighting using {tech}, neon weapons firing, dynamic cyberpunk battle, anime action pose' },
      { promptTemplate: 'Cyberpunk anime style, {heroName} looking at the city skyline from rooftop, contemplating the future, philosophical mood, cyberpunk aesthetic ending' },
    ],
  },
  {
    id: 'mystery-suspense',
    name: '悬疑推理',
    emoji: '🔮',
    description: '扑朔迷离的推理故事',
    style: 'mystery anime, detective, dark atmosphere, suspenseful, noir, dramatic shadows',
    fields: [
      { key: 'detectiveName', label: '侦探名字', placeholder: '例如：柯林', type: 'text', maxLength: 10 },
      { key: 'crime', label: '案件类型', placeholder: '选择案件', type: 'select', options: ['密室杀人', '失踪案', '盗窃案', '连环案', '神秘符号'] },
      { key: 'clue', label: '关键线索', placeholder: '选择线索', type: 'select', options: ['日记', '照片', '录音', '密码信', '特殊物品'] },
    ],
    pages: [
      { promptTemplate: 'Mystery anime style, {detectiveName} in a dimly lit detective office, looking at case files, noir atmosphere, dramatic shadows, detective anime scene' },
      { promptTemplate: 'Mystery anime style, {crime} crime scene, police tape, evidence markers, {detectiveName} investigating carefully, suspenseful atmosphere, dark anime style' },
      { promptTemplate: 'Mystery anime style, {detectiveName} discovering {clue}, close-up of the clue, dramatic lighting, eureka moment, mystery anime' },
      { promptTemplate: 'Mystery anime style, {detectiveName} piecing together clues, multiple evidence boards, thinking intensely, detective deduction scene, anime style' },
      { promptTemplate: 'Mystery anime style, {detectiveName} revealing the truth, dramatic confrontation, shocked villain expression, mystery solved, anime climax scene' },
    ],
  },
];

// 根据模板和填空生成漫画页面
export function generatePagesFromTemplate(template: MangaTemplate, fieldValues: Record<string, string>): Array<{ prompt: string; imageUrl: string }> {
  const pages: Array<{ prompt: string; imageUrl: string }> = [];
  
  template.pages.forEach((pageTemplate) => {
    let prompt = pageTemplate.promptTemplate;
    
    // 替换占位符
    Object.entries(fieldValues).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
    });
    
    // 添加风格后缀
    prompt = `${prompt}, ${template.style}`;
    
    pages.push({ prompt, imageUrl: '' });
  });
  
  return pages;
}

// 根据模板和用户输入生成标题和描述
export function generateTitleAndDescription(template: MangaTemplate, fieldValues: Record<string, string>): { title: string; description: string } {
  const firstField = Object.values(fieldValues)[0] || '';
  const title = `${template.name}：${firstField}的故事`;
  
  const fieldSummary = Object.entries(fieldValues)
    .map(([key, value]) => `${value}`)
    .join('、');
  
  const description = `一部${template.name}题材的 AI 漫画，包含 ${template.pages.length} 页。主要元素：${fieldSummary}。`;
  
  return { title, description };
}
