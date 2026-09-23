import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class IntroScene extends Phaser.Scene {
  private hasSkipped: boolean = false;

  constructor() {
    super('IntroScene');
  }

  public create(): void {
    this.hasSkipped = false;

    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    // Atmospheric deep cosmic gradient background
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0a0818, 0x0a0818, 0x14102c, 0x1c153c, 1);
    bgGfx.fillRect(0, 0, W, H);

    // Soft starry particles
    for (let i = 0; i < 35; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const star = this.add.circle(x, y, Math.random() * 2 + 1, 0x74b9ff, Math.random() * 0.5 + 0.2);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        yoyo: true,
        repeat: -1,
        duration: 1500 + Math.random() * 2000,
      });
    }

    const line1FontSize = IS_PORTRAIT ? '22px' : '28px';
    const line2FontSize = IS_PORTRAIT ? '26px' : '32px';

    const line1 = this.add.text(W / 2, H / 2 - 40, 'The world remembers everything.', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: line1FontSize,
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center',
      wordWrap: { width: W - 60 },
    }).setOrigin(0.5);

    const line2 = this.add.text(W / 2, H / 2 + 15, 'Except you.', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: line2FontSize,
      fontStyle: 'bold',
      color: '#00cec9',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Glowing Enter / Skip button
    const btnY = IS_PORTRAIT ? H / 2 + 130 : H / 2 + 110;
    const btnW = IS_PORTRAIT ? Math.min(280, W - 60) : 320;
    const enterBtn = this.add.container(W / 2, btnY);
    const btnBg = this.add.rectangle(0, 0, btnW, 44, 0x1e1938, 0.95);
    btnBg.setStrokeStyle(2, 0x6c5ce7);
    btnBg.setInteractive({ useHandCursor: true });

    const btnLabel = IS_PORTRAIT ? '▶ ENTER REALM' : '▶ ENTER REALM [SPACE]';
    const btnText = this.add.text(0, 0, btnLabel, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '14px' : '16px',
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
