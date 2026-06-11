export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    try {
      this.ctx = wx.createWebAudioContext();
    } catch (e) {
      this.ctx = null;
    }
  }

  _play(freq, duration, type) {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.1;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playComplete() {
    this._play(523, 0.1, 'square');
    setTimeout(() => this._play(659, 0.1, 'square'), 100);
    setTimeout(() => this._play(784, 0.2, 'square'), 200);
  }

  playClick() {
    this._play(440, 0.05, 'square');
  }

  playAttack() {
    this._play(220, 0.1, 'sawtooth');
  }

  playHit() {
    this._play(120, 0.15, 'square');
  }

  playVictory() {
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => this._play(f, 0.15, 'square'), i * 100);
    });
  }

  playLevelUp() {
    this._play(440, 0.1, 'square');
    setTimeout(() => this._play(880, 0.3, 'square'), 100);
  }

  playBossAppear() {
    this._play(180, 0.3, 'sawtooth');
    setTimeout(() => this._play(120, 0.5, 'sawtooth'), 300);
  }

  playGameOver() {
    const notes = [392, 349, 330, 262];
    notes.forEach((f, i) => {
      setTimeout(() => this._play(f, 0.3, 'square'), i * 200);
    });
  }
}
