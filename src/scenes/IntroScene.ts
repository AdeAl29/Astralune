import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

export class IntroScene extends Phaser.Scene {
  private hasSkipped: boolean = false;

  constructor() {
    super('IntroScene');
  }

  public create(): void {
    this.hasSkipped = false;

    // Atmospheric deep cosmic gradient background (not pure pitch black)
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0818, 0x0a0818, 0x14102c, 0x1c153c, 1);
    bgGfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Soft starry particles
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const star = this.add.circle(x, y, Math.random() * 2 + 1, 0x74b9ff, Math.random() * 0.5 + 0.2);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 1500 + Math.random() * 2000,
      });
    }

    const line1 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'The world remembers everything.', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const line2 = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15, 'Except you.', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#00cec9',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Glowing Enter / Skip button
    const enterBtn = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 110);
    const btnBg = this.add.rectangle(0, 0, 320, 48, 0x1e1938, 0.95);
    btnBg.setStrokeStyle(2, 0x6c5ce7);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.add.text(0, 0, '▶ ENTER REALM [SPACE]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    enterBtn.add([btnBg, btnText]);

    this.tweens.add({
      targets: enterBtn,
      scale: 1.04,
      yoyo: true,
      repeat: -1,
      duration: 700,
    });

    const proceedToGame = () => {
      if (this.hasSkipped) return;
      this.hasSkipped = true;
      this.cameras.main.fade(200, 0, 0, 0);
      this.time.delayedCall(200, () => {
        this.scene.start('GameScene', {});
      });
    };

    btnBg.on('pointerdown', proceedToGame);
    this.input.keyboard?.on('keydown-SPACE', proceedToGame);
    this.input.keyboard?.on('keydown-ENTER', proceedToGame);
    this.input.on('pointerdown', proceedToGame);

    // Auto-advance after 3.2s
    this.time.delayedCall(3200, proceedToGame);
  }
}
