import { STORAGE_KEY, SAVE_VERSION, TOTAL_DAYS } from '../utils/constants.js';
import { Player } from '../entities/Player.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

export class StorageManager {
  static save(player) {
    const data = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player: player.toJSON(),
      lastActiveDate: _todayStr(),
    };
    wx.setStorageSync(STORAGE_KEY, data);
  }

  static load() {
    try {
      const raw = wx.getStorageSync(STORAGE_KEY);
      if (!raw) return null;
      if (raw.version !== SAVE_VERSION) {
        return _migrate(raw);
      }
      return new Player(raw.player);
    } catch (e) {
      return null;
    }
  }

  static checkNewDay(player) {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw) return false;
    const lastDate = raw.lastActiveDate;
    const today = _todayStr();
    if (lastDate !== today) {
      player.completedToday = false;
      if (player.completedRules.length === 0) {
        StorageManager.save(player);
      } else if (player.isAllRulesDone()) {
        player.completedRules = [];
        StorageManager.save(player);
      } else {
        player.resetDay();
        StorageManager.save(player);
        return true;
      }
    }
    return false;
  }

  static checkAchievements(player) {
    const unlocked = [];
    ACHIEVEMENTS.forEach(a => {
      if (a.check(player)) {
        unlocked.push(a);
      }
    });
    return unlocked;
  }

  static hasSave() {
    try {
      return !!wx.getStorageSync(STORAGE_KEY);
    } catch (e) {
      return false;
    }
  }

  static getHistory(player) {
    return player.history || [];
  }
}

function _todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function _migrate(raw) {
  if (raw.version === 1 && raw.player) {
    const p = raw.player;
    p.history = p.history || [];
    return new Player(p);
  }
  return null;
}
