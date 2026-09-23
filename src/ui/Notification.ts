import * as Phaser from 'phaser';
import { GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class NotificationManager {
  private scene: Phaser.Scene;
  private queue: { text: string; color: string; subtext?: string }[] = [];
  private isShowing: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public show(text: string, color: string = '#ffd32a', subtext?: string): void {
    this.queue.push({ text, color, subtext });
    if (!this.isShowing) {
      this.displayNext();
    }
  }

  private displayNext(): void {
    if (this.queue.length === 0) {
      this.isShowing = false;
      return;
    }

    this.isShowing = true;
    const item = this.queue.shift()!;

    const centerX = GAME_WIDTH / 2;
    const container = this.scene.add.container(centerX, -60);
    container.setDepth(300);

    const width = IS_PORTRAIT ? Math.min(400, GAME_WIDTH - 40) : 460;
    const height = item.subtext ? 68 : 46;
    const fontSize = IS_PORTRAIT ? '15px' : '18px';
    const subFontSize = IS_PORTRAIT ? '11px' : '13px';

    const bg = this.scene.add.rectangle(0, 0, width, height, 0x120e24, 0.94);
    bg.setStrokeStyle(2, 0x6c5ce7);

    const title = this.scene.add.text(0, item.subtext ? -12 : 0, item.text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: fontSize,
      fontStyle: 'bold',
      color: item.color,
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: width - 30 },
      align: 'center',
    });
    title.setOrigin(0.5);

    container.add([bg, title]);

    if (item.subtext) {
      const sub = this.scene.add.text(0, 14, item.subtext, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: subFontSize,
        color: '#dcdde1',
        wordWrap: { width: width - 30 },
        align: 'center',
      });
      sub.setOrigin(0.5);
      container.add(sub);
    }

    // Slide down from top
    this.scene.tweens.add({
      targets: container,
      y: IS_PORTRAIT ? 50 : 60,
      duration: 350,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(2200, () => {
          this.scene.tweens.add({
            targets: container,
            y: -80,
            alpha: 0,
            duration: 300,
            ease: 'Cubic.easeIn',
            onComplete: () => {
              container.destroy();
              this.displayNext();
            },
          });
        });
      },
    });
  }
}
