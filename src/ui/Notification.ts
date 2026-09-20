import * as Phaser from 'phaser';

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

    const container = this.scene.add.container(640, -60);
    container.setDepth(300);

    const width = 460;
    const height = item.subtext ? 68 : 46;

    const bg = this.scene.add.rectangle(0, 0, width, height, 0x120e24, 0.94);
    bg.setStrokeStyle(2, 0x6c5ce7);

    const title = this.scene.add.text(0, item.subtext ? -12 : 0, item.text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: item.color,
      stroke: '#000000',
      strokeThickness: 2,
    });
    title.setOrigin(0.5);

    container.add([bg, title]);

    if (item.subtext) {
      const sub = this.scene.add.text(0, 14, item.subtext, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#dcdde1',
      });
      sub.setOrigin(0.5);
      container.add(sub);
    }

    // Slide down from top
    this.scene.tweens.add({
      targets: container,
      y: 60,
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
