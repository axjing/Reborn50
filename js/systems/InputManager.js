export class InputManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this._lastTap = null;
    this._bind();
  }

  _bind() {
    wx.onTouchStart(e => {
      try {
        let touch;
        if (e.touches && e.touches.length > 0) {
          touch = e.touches[0];
        } else if (e.changedTouches && e.changedTouches.length > 0) {
          touch = e.changedTouches[0];
        } else {
          touch = e;
        }
        if (!touch) return;
        const x = touch.clientX !== undefined ? touch.clientX : touch.x;
        const y = touch.clientY !== undefined ? touch.clientY : touch.y;
        if (x === undefined || y === undefined) return;
        this._lastTap = { x, y, time: Date.now() };
        this.sceneManager.handleTap(x, y);
      } catch (err) {
        console.error('InputManager error:', err);
      }
    });

    wx.onTouchMove(e => {
      try {
        let touch;
        if (e.touches && e.touches.length > 0) {
          touch = e.touches[0];
        } else {
          touch = e;
        }
        if (!touch) return;
        const x = touch.clientX !== undefined ? touch.clientX : touch.x;
        const y = touch.clientY !== undefined ? touch.clientY : touch.y;
        if (x === undefined || y === undefined) return;
        this.sceneManager.handleDrag(x, y);
      } catch (err) {
        console.error('InputManager drag error:', err);
      }
    });

    wx.onTouchEnd(e => {
      try {
        let touch;
        if (e.changedTouches && e.changedTouches.length > 0) {
          touch = e.changedTouches[0];
        } else {
          touch = e;
        }
        if (!touch) return;
        const x = touch.clientX !== undefined ? touch.clientX : touch.x;
        const y = touch.clientY !== undefined ? touch.clientY : touch.y;
        if (x === undefined || y === undefined) return;
        this.sceneManager.handleDragEnd(x, y);
      } catch (err) {
        console.error('InputManager dragEnd error:', err);
      }
    });
  }
}
