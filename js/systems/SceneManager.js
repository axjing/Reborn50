export class SceneManager {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.currentStatus = null;
    this.canvas = null;
    this.ctx = null;
    this.audio = null;
    this._transition = null;
  }

  init(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  register(status, scene) {
    this.scenes[status] = scene;
  }

  switchTo(status, data) {
    if (this.currentScene && this.currentScene.onExit) {
      this.currentScene.onExit();
    }
    this.currentStatus = status;
    this.currentScene = this.scenes[status];
    if (this.currentScene && this.currentScene.onEnter) {
      this.currentScene.onEnter(data);
    }
  }

  transitionTo(status, data) {
    if (this._transition) return;
    this._transition = {
      from: this.currentScene,
      toStatus: status,
      toData: data,
      alpha: 0,
      dir: 1,
    };
  }

  update(dt) {
    if (this._transition) {
      var t = this._transition;
      t.alpha += dt * 2.5 * t.dir;
      if (t.alpha >= 1) {
        t.alpha = 1;
        t.dir = -1;
        if (this.currentScene && this.currentScene.onExit) {
          this.currentScene.onExit();
        }
        this.currentStatus = t.toStatus;
        this.currentScene = this.scenes[t.toStatus];
        if (this.currentScene && this.currentScene.onEnter) {
          this.currentScene.onEnter(t.toData);
        }
      }
      if (t.alpha <= 0) {
        this._transition = null;
        return;
      }
    }
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update(dt);
    }
  }

  render() {
    if (!this.ctx) return;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render(this.ctx);
    }
    if (this._transition) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0,0,0,' + this._transition.alpha + ')';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }

  handleTap(x, y) {
    if (this._transition) return;
    if (this.currentScene && this.currentScene.handleTap) {
      this.currentScene.handleTap(x, y);
    }
  }

  handleDrag(x, y) {
    if (this._transition) return;
    if (this.currentScene && this.currentScene.handleDrag) {
      this.currentScene.handleDrag(x, y);
    }
  }

  handleDragEnd(x, y) {
    if (this._transition) return;
    if (this.currentScene && this.currentScene.handleDragEnd) {
      this.currentScene.handleDragEnd(x, y);
    }
  }

  handleWheel(dx, dy) {
    if (this._transition) return;
    if (this.currentScene && this.currentScene.handleWheel) {
      this.currentScene.handleWheel(dx, dy);
    }
  }
}
