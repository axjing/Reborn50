import { XINFA_LIST } from '../utils/constants.js';

var BASE_STATS = { zhenqi: 1, xinjing: 1, tipo: 1, xueshi: 1, gongli: 1, qingqi: 1, dunwu: 1 };

export class Player {
  constructor(data) {
    this.day = data.day || 1;
    this.stats = data.stats ? { ...data.stats } : { ...BASE_STATS };
    this.completedRules = data.completedRules || [];
    this.completedToday = data.completedToday || false;
    this.streak = data.streak || 0;
    this.completedDays = data.completedDays || 0;
    this.history = data.history || [];
    this.totalResets = data.totalResets || 0;
    this.level = data.level || 1;
    this.exp = data.exp || 0;

    this.achievements = data.achievements || [];
    this.adventures = data.adventures || [];
    this.chapterProgress = data.chapterProgress || 1;
    this.storyWatched = data.storyWatched || [];
    this.stars = data.stars || 0;
    this.totalStars = data.totalStars || 0;

    this.nickname = data.nickname || '修行者';
    this.avatar = data.avatar || '';
    this.startDate = data.startDate || null;
    this.petName = data.petName || '';
    this.petAffection = data.petAffection || 0;
  }

  get realm() {
    if (this.completedDays >= 50) return 5;
    if (this.completedDays >= 35) return 4;
    if (this.completedDays >= 25) return 3;
    if (this.completedDays >= 15) return 2;
    if (this.completedDays >= 5) return 1;
    return 0;
  }

  get realmName() {
    var names = ['俗世凡人', '初入江湖', '静心修行', '体魄精进', '名士悟道', '自律宗师'];
    return names[this.realm];
  }

  get chapter() {
    var c = 1;
    if (this.completedDays >= 41) c = 5;
    else if (this.completedDays >= 31) c = 4;
    else if (this.completedDays >= 21) c = 3;
    else if (this.completedDays >= 11) c = 2;
    return c;
  }

  get currentChapterDay() {
    var base = (this.chapter - 1) * 10;
    return Math.max(1, Math.min(10, this.completedDays - base));
  }

  get starRating() {
    var done = this.completedRules.length;
    if (done >= 7) return 3;
    if (done >= 4) return 2;
    if (done >= 1) return 1;
    return 0;
  }

  applyRule(ruleId) {
    if (this.completedRules.includes(ruleId)) return false;
    this.completedRules.push(ruleId);
    var rule = XINFA_LIST[ruleId];
    if (rule) {
      this.stats[rule.stat] = (this.stats[rule.stat] || 1) + 1;
    }
    return true;
  }

  isAllRulesDone() {
    return this.completedRules.length >= XINFA_LIST.length;
  }

  completeDay(stars) {
    stars = stars || this.starRating;
    var record = {
      day: this.day,
      timestamp: Date.now(),
      completedRules: [...this.completedRules],
      stats: { ...this.stats },
      streak: this.streak + 1,
      level: this.level,
      stars: stars,
    };
    this.history.push(record);
    this.day++;
    this.completedDays++;
    this.streak++;
    this.totalStars += stars;
    this.exp += 5 + stars * 3;
    this.stars = stars;
    this.completedRules = [];
    this.completedToday = true;
    return this.checkLevelUp();
  }

  resetDay() {
    var record = {
      day: this.day,
      timestamp: Date.now(),
      completedRules: [...this.completedRules],
      failed: true,
      streak: 0,
    };
    this.history.push(record);
    this.day = 1;
    this.streak = 0;
    this.totalResets++;
    this.completedRules = [];
    this.completedToday = false;
    Object.keys(BASE_STATS).forEach(function(k) {
      this.stats[k] = Math.max(1, (this.stats[k] || 1) - 1);
    }.bind(this));
  }

  checkLevelUp() {
    var needed = this.level * 30;
    if (this.exp >= needed) {
      this.exp -= needed;
      this.level++;
      return true;
    }
    return false;
  }

  getTopStats(n) {
    n = n || 3;
    var sorted = Object.keys(this.stats).sort(function(a, b) {
      return (this.stats[b] || 0) - (this.stats[a] || 0);
    }.bind(this));
    return sorted.slice(0, n);
  }

  get maxHP() {
    return 30 + (this.stats.tipo || 1) * 5 + (this.stats.qingqi || 1) * 2;
  }

  get maxSP() {
    return 20 + (this.stats.zhenqi || 1) * 3 + (this.stats.xinjing || 1) * 2;
  }

  get attack() {
    return Math.max(1, (this.stats.gongli || 1));
  }

  get defense() {
    return Math.max(1, (this.stats.tipo || 1));
  }

  get magicAttack() {
    return Math.max(1, (this.stats.xueshi || 1) + (this.stats.dunwu || 1));
  }

  toJSON() {
    return {
      day: this.day,
      stats: this.stats,
      completedRules: this.completedRules,
      completedToday: this.completedToday,
      streak: this.streak,
      completedDays: this.completedDays,
      history: this.history,
      totalResets: this.totalResets,
      level: this.level,
      exp: this.exp,
      achievements: this.achievements,
      adventures: this.adventures,
      chapterProgress: this.chapterProgress,
      storyWatched: this.storyWatched,
      stars: this.stars,
      totalStars: this.totalStars,
      nickname: this.nickname,
      avatar: this.avatar,
      startDate: this.startDate,
    };
  }
}
