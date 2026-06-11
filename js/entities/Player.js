import { RULES } from '../data/rules.js';
import { RULES_COUNT } from '../utils/constants.js';

const BASE_STATS = { wil: 3, spi: 3, str: 3, int: 3, skl: 3, vit: 3, mnd: 3 };

export class Player {
  constructor(data) {
    this.day = data.day || 1;
    this.stats = data.stats ? { ...data.stats } : { ...BASE_STATS };
    this.hp = data.hp !== undefined ? data.hp : this.maxHP;
    this.sp = data.sp !== undefined ? data.sp : this.maxSP;
    this.completedRules = data.completedRules || [];
    this.inventory = data.inventory || [];
    this.equipment = data.equipment || {};
    this.defeatedBosses = data.defeatedBosses || [];
    this.streak = data.streak || 0;
    this.completedDays = data.completedDays || 0;
    this.totalResets = data.totalResets || 0;
    this.exp = data.exp || 0;
    this.level = data.level || 1;
    this.history = data.history || [];
    this.completedToday = data.completedToday || false;
  }

  get maxHP() {
    return 20 + this.stats.vit * 8;
  }

  get maxSP() {
    return 10 + this.stats.spi * 3;
  }

  get attack() {
    return this.stats.str;
  }

  get magicAttack() {
    return this.stats.int;
  }

  get defense() {
    return this.stats.skl;
  }

  get critChance() {
    return Math.min(this.stats.mnd / 100, 0.3);
  }

  getStat(stat) {
    return this.stats[stat] || 0;
  }

  applyRule(ruleId) {
    if (this.completedRules.includes(ruleId)) return false;
    this.completedRules.push(ruleId);
    const rule = RULES[ruleId];
    if (rule) this.stats[rule.stat] = (this.stats[rule.stat] || 0) + 1;
    return true;
  }

  isAllRulesDone() {
    return this.completedRules.length >= RULES_COUNT;
  }

  completeDay() {
    const prevLevel = this.level;
    const record = {
      day: this.day,
      timestamp: Date.now(),
      completedRules: [...this.completedRules],
      stats: { ...this.stats },
      streak: this.streak + 1,
      level: this.level,
    };
    this.history.push(record);
    this.day++;
    this.completedDays++;
    this.streak++;
    this.exp += 10;
    this.checkLevelUp();
    this.completedRules = [];
    this.completedToday = true;
    this.hp = this.maxHP;
    this.sp = this.maxSP;
    return this.level > prevLevel;
  }

  resetDay() {
    const record = {
      day: this.day,
      timestamp: Date.now(),
      completedRules: [...this.completedRules],
      stats: { ...this.stats },
      failed: true,
      streak: 0,
    };
    this.history.push(record);
    this.day = 1;
    this.streak = 0;
    this.totalResets++;
    this.completedRules = [];
    this.completedToday = false;
    Object.keys(BASE_STATS).forEach(k => {
      this.stats[k] = Math.max(1, (this.stats[k] || 0) - 1);
    });
    this.hp = this.maxHP;
    this.sp = this.maxSP;
  }

  checkLevelUp() {
    const needed = this.level * 20;
    if (this.exp >= needed) {
      this.exp -= needed;
      this.level++;
      return true;
    }
    return false;
  }

  takeDamage(dmg) {
    const actual = Math.max(1, dmg - this.defense);
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  isAlive() {
    return this.hp > 0;
  }

  toJSON() {
    return {
      day: this.day,
      stats: this.stats,
      hp: this.hp,
      sp: this.sp,
      completedRules: this.completedRules,
      inventory: this.inventory,
      equipment: this.equipment,
      defeatedBosses: this.defeatedBosses,
      streak: this.streak,
      completedDays: this.completedDays,
      totalResets: this.totalResets,
      exp: this.exp,
      level: this.level,
      history: this.history,
      completedToday: this.completedToday,
    };
  }
}
