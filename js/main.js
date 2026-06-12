import { STATUS } from './utils/constants.js';
import { SceneManager } from './systems/SceneManager.js';
import { GameLoop } from './systems/GameLoop.js';
import { InputManager } from './systems/InputManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import { ChallengeScene } from './scenes/ChallengeScene.js';
import { StoryScene } from './scenes/StoryScene.js';
import { AdventureScene } from './scenes/AdventureScene.js';
import { RealmScene } from './scenes/RealmScene.js';
import { MiniGameScene } from './scenes/MiniGameScene.js';
import { HistoryScene } from './scenes/HistoryScene.js';

var canvas = wx.createCanvas();
var systemInfo = wx.getSystemInfoSync();

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

var audio = new AudioManager();
audio.init();

var sceneManager = new SceneManager();
sceneManager.init(canvas);
sceneManager.audio = audio;

var scenes = {
  [STATUS.BOOT]: BootScene,
  [STATUS.TITLE]: TitleScene,
  [STATUS.HOME]: HomeScene,
  [STATUS.CULTIVATION]: ChallengeScene,
  [STATUS.STORY]: StoryScene,
  [STATUS.ADVENTURE]: AdventureScene,
  [STATUS.REALM]: RealmScene,
  [STATUS.MINIGAME]: MiniGameScene,
  [STATUS.HISTORY]: HistoryScene,
};

Object.entries(scenes).forEach(function(_a) {
  var status = _a[0];
  var SceneClass = _a[1];
  sceneManager.register(status, new SceneClass(sceneManager));
});

new InputManager(sceneManager);

var gameLoop = new GameLoop(sceneManager);
sceneManager.switchTo(STATUS.BOOT);
gameLoop.start();
