import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';
import { GameScene } from './GameScene';

export class PauseScene extends Phaser.Scene {
  private audio: AudioSystem;
  private saveSystem: SaveSystem;

  constructor() {
    super('PauseScene');
    this.audio = AudioSystem.getInstance();
    this.saveSystem = SaveSystem.getInstance();
  }

  public create(): void {
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    // Dimmed translucent overlay
    const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.7);
    backdrop.setInteractive();

    // Center Panel
    const panelW = IS_PORTRAIT ? Math.min(340, W - 40) : 380;
    const panelH = IS_PORTRAIT ? 440 : 480;
    const panel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x120f26, 0.96);
    panel.setStrokeStyle(2.5, 0x6c5ce7);

    // Title
    this.add.text(W / 2, H / 2 - panelH / 2 + 35, 'PAUSED', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '24px' : '28px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const startY = H / 2 - panelH / 2 + 90;
    const spacing = IS_PORTRAIT ? 48 : 54;
    const btnW = IS_PORTRAIT ? Math.min(240, panelW - 30) : 260;

    const gameScene = this.scene.get('GameScene') as GameScene;

    // Buttons
    this.createBtn(W / 2, startY, 'RESUME', btnW, () => {
      this.resume();
    });

    this.createBtn(W / 2, startY + spacing, 'INVENTORY', btnW, () => {
      this.scene.launch('InventoryScene');
    });

    this.createBtn(W / 2, startY + spacing * 2, 'QUESTS', btnW, () => {
      this.scene.launch('QuestScene');
    });

    this.createBtn(W / 2, startY + spacing * 3, 'SETTINGS', btnW, () => {
      this.scene.launch('SettingsScene', { returnTo: 'PauseScene' });
    });

    this.createBtn(W / 2, startY + spacing * 4, 'SAVE GAME', btnW, (label) => {
      const saved = gameScene.saveCurrentState();
      if (saved) {
        label.setText('GAME SAVED!');
        label.setColor('#2ed573');
        this.time.delayedCall(1500, () => {
          label.setText('SAVE GAME');
          label.setColor('#ffffff');
        });
      }
    });

    this.createBtn(W / 2, startY + spacing * 5, 'MAIN MENU', btnW, () => {
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.stop('PauseScene');
      this.scene.start('MainMenuScene');
    });

    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => {
      this.resume();
    });
  }

  private resume(): void {
    this.audio.playUiClick();
    this.scene.resume('GameScene');
    this.scene.stop('PauseScene');
  }

  private createBtn(
    x: number,
    y: number,
    text: string,
    width: number,
    onClick: (label: Phaser.GameObjects.Text) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const height = IS_PORTRAIT ? 38 : 42;
    const bg = this.add.rectangle(0, 0, width, height, 0x1e1938, 0.9);
    bg.setStrokeStyle(1.5, 0x6c5ce7);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '14px' : '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => {
      this.audio.playUiClick();
      container.setScale(0.97);
      onClick(label);
    });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x341f97);
      label.setColor('#ffd32a');
      container.setScale(1.03);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x1e1938);
      label.setColor('#ffffff');
      container.setScale(1.0);
    });

    container.add([bg, label]);
    return container;
  }
}
