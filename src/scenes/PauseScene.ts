import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
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
    // Dimmed translucent overlay
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    backdrop.setInteractive();

    // Center Panel
    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 380, 480, 0x120f26, 0.96);
    panel.setStrokeStyle(2.5, 0x6c5ce7);

    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 185, 'PAUSED', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const startY = GAME_HEIGHT / 2 - 120;
    const spacing = 54;

    const gameScene = this.scene.get('GameScene') as GameScene;

    // Buttons
    this.createBtn(GAME_WIDTH / 2, startY, 'RESUME', () => {
      this.resume();
    });

    this.createBtn(GAME_WIDTH / 2, startY + spacing, 'INVENTORY', () => {
      this.scene.launch('InventoryScene');
    });

    this.createBtn(GAME_WIDTH / 2, startY + spacing * 2, 'QUESTS', () => {
      this.scene.launch('QuestScene');
    });

    this.createBtn(GAME_WIDTH / 2, startY + spacing * 3, 'SETTINGS', () => {
      this.scene.launch('SettingsScene', { returnTo: 'PauseScene' });
    });

    this.createBtn(GAME_WIDTH / 2, startY + spacing * 4, 'SAVE GAME', (label) => {
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

    this.createBtn(GAME_WIDTH / 2, startY + spacing * 5, 'MAIN MENU', () => {
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
    onClick: (label: Phaser.GameObjects.Text) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 260, 42, 0x1e1938, 0.9);
    bg.setStrokeStyle(1.5, 0x6c5ce7);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
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
