export const DESIGN_WIDTH = 375;
export const DESIGN_HEIGHT = 667;

export const STORAGE_KEY = 'reborn50_save';
export const SAVE_VERSION = 3;

export const TOTAL_DAYS = 50;
export const MAX_STAT = 999;

export const STATUS = {
  BOOT: 'boot',
  TITLE: 'title',
  HOME: 'home',
  CULTIVATION: 'cultivation',
  STORY: 'story',
  REALM: 'realm',
  ADVENTURE: 'adventure',
  MINIGAME: 'minigame',
  SOCIAL: 'social',
  HISTORY: 'history',
  SETTINGS: 'settings',
};

export const REALMS = [
  { id: 0, name: '俗世凡人', title: '凡尘未脱', desc: '尚未踏入修行之路', reqDays: 0, color: '#8B8B8B' },
  { id: 1, name: '初入江湖', title: '江湖新秀', desc: '初步掌握修行法门', reqDays: 5, color: '#7BA87B' },
  { id: 2, name: '静心修行', title: '心若止水', desc: '心性沉稳，渐入佳境', reqDays: 15, color: '#6B9FB5' },
  { id: 3, name: '体魄精进', title: '筋骨初成', desc: '肉身与精神同步提升', reqDays: 25, color: '#B58B6B' },
  { id: 4, name: '名士悟道', title: '超然物外', desc: '悟道渐深，已窥天机', reqDays: 35, color: '#9B7BB5' },
  { id: 5, name: '自律宗师', title: '返璞归真', desc: '五十日渡劫圆满，超凡入圣', reqDays: 50, color: '#D4A04A' },
];

export const SCENES_CONFIG = {
  morning: {
    name: '晨光山林',
    gradient: ['#1a1a2e', '#2d2d44', '#4a4a6a', '#8B7355'],
    clouds: true,
    particles: 'mist',
  },
  study: {
    name: '静心书院',
    gradient: ['#2a2a3e', '#3a3a55', '#5a6a7a', '#8B9DAF'],
    clouds: true,
    particles: 'leaves',
  },
  martial: {
    name: '练武云台',
    gradient: ['#2e1a1a', '#443030', '#6a4a3a', '#8B6B55'],
    clouds: true,
    particles: 'sparks',
  },
  dining: {
    name: '清和膳堂',
    gradient: ['#2a2a1a', '#3a3a28', '#5a5a3a', '#8B8B6B'],
    clouds: false,
    particles: 'steam',
  },
  stargaze: {
    name: '望月观星台',
    gradient: ['#0a0a1e', '#1a1a3a', '#2a2a5a', '#4a3a6a'],
    clouds: false,
    particles: 'stars',
  },
};

export const XINFA_LIST = [
  {
    id: 0, name: '晨兴诀', short: '早起',
    desc: '每日八点前起床，迎接第一缕朝阳',
    stat: 'zhenqi', scene: 'morning',
  },
  {
    id: 1, name: '静心禅功', short: '专注',
    desc: '晨间一小时无干扰专注，远离尘嚣',
    stat: 'xinjing', scene: 'study',
  },
  {
    id: 2, name: '炼体武经', short: '运动',
    desc: '每日运动一小时，强身健体',
    stat: 'tipo', scene: 'martial',
  },
  {
    id: 3, name: '博览书卷', short: '阅读',
    desc: '每日阅读十页，增长学识',
    stat: 'xueshi', scene: 'study',
  },
  {
    id: 4, name: '精进技艺', short: '技能',
    desc: '每日一小时技能学习，精进不休',
    stat: 'gongli', scene: 'study',
  },
  {
    id: 5, name: '清和食诀', short: '饮食',
    desc: '坚持健康饮食，清气自生',
    stat: 'qingqi', scene: 'dining',
  },
  {
    id: 6, name: '悟道复盘录', short: '复盘',
    desc: '每日记录感悟，在反思中顿悟',
    stat: 'dunwu', scene: 'stargaze',
  },
];

export const STAT_LABELS = {
  zhenqi: '真气',
  xinjing: '心境',
  tipo: '体魄',
  xueshi: '学识',
  gongli: '功力',
  qingqi: '清气',
  dunwu: '顿悟',
};

export const STAT_ICONS = ['☀', '❄', '⚔', '📖', '⚙', '🥗', '✦'];
