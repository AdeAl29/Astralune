import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

export class VictoryScene extends Phaser.Scene {
  private audio: AudioSystem;

  constructor() {
    super('VictoryScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x070b14, 0.9);
    backdrop.setInteractive();

    // Celebratory fireworks particles
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const p = this.add.sprite(x, y, 'fx_spark');
      p.setScale(Math.random() * 1.5 + 0.5);
      p.setAlpha(Math.random() * 0.7 + 0.3);

      this.tweens.add({
        targets: p,
        y: y - 80,
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        repeat: -1,
      });
    }

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, 'THE FORGOTTEN REALM\nHAS BEEN RESTORED', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5);

    const sub = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 - 40,
      'The ancient titan has fallen. Memories of the cosmos flow freely once more.',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '17px',
        color: '#00cec9',
        align: 'center',
      }
    ).setOrigin(0.5);

    const startY = GAME_HEIGHT / 2 + 50;

    this.createBtn(GAME_WIDTH / 2, startY, 'CONTINUE EXPLORING', () => {
      this.scene.stop('VictoryScene');
      this.scene.resume('GameScene');
    });

    this.createBtn(GAME_WIDTH / 2, startY + 65, 'MAIN MENU', () => {
      this.scene.stop('VictoryScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });
  }

  private createBtn(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 260, 46, 0x16203a, 0.92);
    bg.setStrokeStyle(2, 0x00cec9);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => {
      this.audio.playUiClick();
      onClick();
    });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x273c75);
      label.setColor('#ffd32a');
      c.setScale(1.03);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x16203a);
      label.setColor('#ffffff');
      c.setScale(1.0);
    });

    c.add([bg, label]);
    return c;
  }
}
