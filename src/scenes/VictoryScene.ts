import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class VictoryScene extends Phaser.Scene {
  private audio: AudioSystem;

  constructor() {
    super('VictoryScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x070b14, 0.9);
    backdrop.setInteractive();

    // Celebratory fireworks particles
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
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

    const title = this.add.text(W / 2, H / 2 - (IS_PORTRAIT ? 180 : 140), 'THE FORGOTTEN REALM\nHAS BEEN RESTORED', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '26px' : '36px',
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#000000',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: W - 40 },
    }).setOrigin(0.5);

    const sub = this.add.text(
      W / 2,
      H / 2 - (IS_PORTRAIT ? 80 : 40),
      'The ancient titan has fallen. Memories of the cosmos flow freely once more.',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: IS_PORTRAIT ? '14px' : '17px',
        color: '#00cec9',
        align: 'center',
        wordWrap: { width: W - 60 },
      }
    ).setOrigin(0.5);

    const startY = H / 2 + 50;
    const btnW = IS_PORTRAIT ? Math.min(260, W - 60) : 260;

    this.createBtn(W / 2, startY, 'CONTINUE EXPLORING', btnW, () => {
      this.scene.stop('VictoryScene');
      this.scene.resume('GameScene');
    });

    this.createBtn(W / 2, startY + (IS_PORTRAIT ? 55 : 65), 'MAIN MENU', btnW, () => {
      this.scene.stop('VictoryScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });
  }

  private createBtn(x: number, y: number, text: string, width: number, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const height = IS_PORTRAIT ? 42 : 46;
    const bg = this.add.rectangle(0, 0, width, height, 0x16203a, 0.92);
    bg.setStrokeStyle(2, 0x00cec9);
    bg.setInteractive({ useHandCursor: true });

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '14px' : '16px',
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
