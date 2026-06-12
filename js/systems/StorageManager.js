import { STORAGE_KEY, SAVE_VERSION, TOTAL_DAYS } from '../utils/constants.js';
import { Player } from '../entities/Player.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

export class StorageManager {
  static save(player) {
    var data = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      player: player.toJSON(),
      lastActiveDate: _todayStr(),
    };
    wx.setStorageSync(STORAGE_KEY, data);
  }

  static load() {
    try {
      var raw = wx.getStorageSync(STORAGE_KEY);
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
    var raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw) return false;
    var lastDate = raw.lastActiveDate;
    var today = _todayStr();
    if (lastDate !== today) {
      player.completedToday = false;
      player.completedRules = [];
      StorageManager.save(player);
      return true;
    }
    return false;
  }

  static checkAchievements(player) {
    var unlocked = [];
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      if (!player.achievements.includes(a.id) && a.check(player)) {
        unlocked.push(a);
        player.achievements.push(a.id);
      }
    }
    if (unlocked.length > 0) {
      StorageManager.save(player);
    }
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
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

function _migrate(raw) {
  if (raw.version === 2 && raw.player) {
    var p = raw.player;
    p.achievements = p.achievements || [];
    p.adventures = p.adventures || [];
    p.chapterProgress = p.chapterProgress || 1;
    p.storyWatched = p.storyWatched || [];
    p.stars = p.stars || 0;
    p.totalStars = p.totalStars || 0;
    p.nickname = p.nickname || '修行者';
    p.avatar = p.avatar || '';
    return new Player(p);
  }
  return null;
}
