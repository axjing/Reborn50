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
    player.lastActiveDate = _todayStr();
  }

  static load() {
    try {
      var raw = wx.getStorageSync(STORAGE_KEY);
      if (!raw) return null;
      if (raw.version !== SAVE_VERSION) {
        var migrated = _migrate(raw);
        if (!migrated) return null;
        return migrated;
      }
      var p = new Player(raw.player);
      p.lastActiveDate = raw.lastActiveDate || '';
      return p;
    } catch (e) {
      return null;
    }
  }

  static checkNewDay(player) {
    var raw = wx.getStorageSync(STORAGE_KEY);
    if (!raw) return { status: false };
    var lastDate = raw.lastActiveDate || player.lastActiveDate || '';
    var today = _todayStr();

    if (lastDate === today) return { status: false };

    var gap = _daysBetween(lastDate, today);

    if (gap > 1 && player.day < TOTAL_DAYS && player.day > 0) {
      var interruptedDay = player.day;
      var missed = [];
      var d = _dateFromStr(lastDate);
      d.setDate(d.getDate() + 1);
      var end = new Date();
      end.setHours(0, 0, 0, 0);
      while (d < end) {
        var ds = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        missed.push({ dateStr: ds, day: interruptedDay, attempt: player.currentAttempt });
        d.setDate(d.getDate() + 1);
      }
      player.missedDays = (player.missedDays || []).concat(missed);

      player.resetDay(true);
      StorageManager.save(player);
      return { status: 'interrupted', gap: gap, interruptedDay: interruptedDay };
    }

    player.completedToday = false;
    player.completedRules = [];
    StorageManager.save(player);
    return { status: 'new' };
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

function _dateFromStr(s) {
  if (!s) return new Date();
  var parts = s.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function _daysBetween(a, b) {
  var da = _dateFromStr(a);
  var db = _dateFromStr(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db - da) / 86400000);
}

function _migrate(raw) {
  var p = raw.player;
  if (!p) return null;

  if (raw.version === 2) {
    p.achievements = p.achievements || [];
    p.adventures = p.adventures || [];
    p.chapterProgress = p.chapterProgress || 1;
    p.storyWatched = p.storyWatched || [];
    p.stars = p.stars || 0;
    p.totalStars = p.totalStars || 0;
    p.nickname = p.nickname || '修行者';
    p.avatar = p.avatar || '';
    raw.version = 3;
  }

  if (raw.version === 3) {
    p.attempts = p.attempts || [];
    p.currentAttempt = p.currentAttempt || 1;
    p.missedDays = p.missedDays || [];
    p.calendarRange = p.calendarRange || 6;
    raw.version = 4;
  }

  if (raw.version !== SAVE_VERSION) return null;

  var player = new Player(p);
  player.lastActiveDate = raw.lastActiveDate || '';
  return player;
}
