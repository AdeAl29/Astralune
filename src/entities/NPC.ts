import * as Phaser from 'phaser';
import { NPCData } from '../types/game';
import { distance } from '../utils/math';
import { Player } from './Player';

export class NPC extends Phaser.Physics.Arcade.Sprite {
  public npcData: NPCData;
  private promptGfx: Phaser.GameObjects.Container;
  private isPlayerNearby: boolean = false;

  constructor(scene: Phaser.Scene, data: NPCData) {
    super(scene, data.x, data.y, data.spriteKey);
    this.npcData = data;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static physics body

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(32, 32);
    body.setOffset(8, 20);

    // Floating Interaction Prompt [E]
    this.promptGfx = scene.add.container(data.x, data.y - 42);

    const bg = scene.add.rectangle(0, 0, 56, 22, 0x131124, 0.85);
    bg.setStrokeStyle(1.5, 0x6c5ce7);
    const text = scene.add.text(0, 0, '[E] Talk', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#00cec9',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    this.promptGfx.add([bg, text]);
    this.promptGfx.setVisible(false);

    // Subtle breathing/bobbing tween
    scene.tweens.add({
      targets: this.promptGfx,
      y: data.y - 46,
      yoyo: true,
      repeat: -1,
      duration: 800,
    });
  }

  public updateInteraction(player: Player): void {
    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 70) {
      if (!this.isPlayerNearby) {
        this.isPlayerNearby = true;
        this.promptGfx.setVisible(true);
      }
    } else {
      if (this.isPlayerNearby) {
        this.isPlayerNearby = false;
        this.promptGfx.setVisible(false);
      }
    }
  }

  public canInteract(): boolean {
    return this.isPlayerNearby;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.promptGfx && this.promptGfx.active) {
      this.promptGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
