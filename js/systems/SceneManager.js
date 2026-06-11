import { STATUS } from '../utils/constants.js';

export class SceneManager {
  constructor() {
    this.scenes = {};
    this.currentScene = null;
    this.currentStatus = STATUS.BOOT;
    this.canvas = null;
    this.ctx = null;
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

  update(dt) {
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
  }

  handleTap(x, y) {
    if (this.currentScene && this.currentScene.handleTap) {
      this.currentScene.handleTap(x, y);
    }
  }
}
