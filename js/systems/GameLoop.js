export class GameLoop {
  constructor(sm) {
    this.sm = sm;
    this.last = 0;
    this.running = false;
    this.id = null;
  }

  start() {
    this.running = true;
    this.last = Date.now();
    this.tick();
  }

  stop() {
    this.running = false;
    if (this.id) { cancelAnimationFrame(this.id); this.id = null; }
  }

  tick() {
    if (!this.running) return;
    var now = Date.now();
    var dt = (now - this.last) / 1000;
    this.last = now;
    this.sm.update(Math.min(dt, 0.05));
    this.sm.render();
    this.id = requestAnimationFrame(this.tick.bind(this));
  }
}
