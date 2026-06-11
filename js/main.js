import { STATUS } from './utils/constants.js';
import { SceneManager } from './systems/SceneManager.js';
import { GameLoop } from './systems/GameLoop.js';
import { InputManager } from './systems/InputManager.js';
import { AudioManager } from './systems/AudioManager.js';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import { ChallengeScene } from './scenes/ChallengeScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { BossScene } from './scenes/BossScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { HistoryScene } from './scenes/HistoryScene.js';

const canvas = wx.createCanvas();
const systemInfo = wx.getSystemInfoSync();

canvas.width = systemInfo.windowWidth;
canvas.height = systemInfo.windowHeight;

const sceneManager = new SceneManager();
sceneManager.init(canvas);

const scenes = {
  [STATUS.BOOT]: BootScene,
  [STATUS.TITLE]: TitleScene,
  [STATUS.HOME]: HomeScene,
  [STATUS.CHALLENGE]: ChallengeScene,
  [STATUS.BATTLE]: BattleScene,
  [STATUS.BOSS]: BossScene,
  [STATUS.GAME_OVER]: GameOverScene,
  [STATUS.HISTORY]: HistoryScene,
};

Object.entries(scenes).forEach(([status, SceneClass]) => {
  sceneManager.register(status, new SceneClass(sceneManager));
});

const audio = new AudioManager();
audio.init();

new InputManager(sceneManager);

const gameLoop = new GameLoop(sceneManager);
sceneManager.switchTo(STATUS.BOOT);
gameLoop.start();
