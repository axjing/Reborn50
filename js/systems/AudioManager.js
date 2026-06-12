var PENTATONIC = [262, 294, 330, 392, 440, 524, 588, 660, 784, 880];

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this._lastNote = 0;
  }

  init() {
    try {
      this.ctx = wx.createWebAudioContext();
    } catch (e) {
      this.ctx = null;
    }
  }

  _play(freq, duration, type, vol) {
    if (!this.enabled || !this.ctx) return;
    vol = vol || 0.08;
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _pentatonicNote(i, dur, type) {
    var f = PENTATONIC[Math.abs(i) % PENTATONIC.length];
    this._play(f, dur, type || 'sine');
  }

  playTap() {
    this._pentatonicNote(0, 0.06, 'sine');
  }

  playComplete() {
    this._pentatonicNote(3, 0.1, 'sine');
    var self = this;
    setTimeout(function() { self._pentatonicNote(5, 0.1, 'sine'); }, 80);
    setTimeout(function() { self._pentatonicNote(7, 0.18, 'sine'); }, 160);
  }

  playReward() {
    var self = this;
    [0, 2, 4, 7].forEach(function(i, idx) {
      setTimeout(function() { self._pentatonicNote(i, 0.12, 'sine'); }, idx * 100);
    });
  }

  playLevelUp() {
    var self = this;
    [0, 4, 7, 12].forEach(function(i, idx) {
      setTimeout(function() { self._pentatonicNote(i, 0.15, 'sine'); }, idx * 120);
    });
  }

  playRealmUp() {
    var self = this;
    [0, 3, 7, 10, 14, 19].forEach(function(i, idx) {
      setTimeout(function() { self._pentatonicNote(i, 0.18, 'triangle'); }, idx * 150);
    });
  }

  playCardFlip() {
    this._play(350, 0.04, 'sine', 0.05);
  }

  playCardMatch() {
    var self = this;
    [5, 8].forEach(function(i, idx) {
      setTimeout(function() { self._pentatonicNote(i, 0.1, 'sine'); }, idx * 60);
    });
  }

  playCardFail() {
    this._play(180, 0.1, 'square', 0.03);
  }

  playMist() {
    this._play(180, 0.4, 'sine', 0.02);
  }
}
