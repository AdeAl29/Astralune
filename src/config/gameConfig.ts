import * as Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { GameOverScene } from '../scenes/GameOverScene';
import { GameScene } from '../scenes/GameScene';
import { IntroScene } from '../scenes/IntroScene';
import { InventoryScene } from '../scenes/InventoryScene';
import { MainMenuScene } from '../scenes/MainMenuScene';
import { PauseScene } from '../scenes/PauseScene';
import { QuestScene } from '../scenes/QuestScene';
import { SettingsScene } from '../scenes/SettingsScene';
import { UIScene } from '../scenes/UIScene';
import { VictoryScene } from '../scenes/VictoryScene';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [
    BootScene,
    MainMenuScene,
    IntroScene,
    GameScene,
    UIScene,
    PauseScene,
    InventoryScene,
    QuestScene,
    SettingsScene,
    GameOverScene,
    VictoryScene,
  ],
};
