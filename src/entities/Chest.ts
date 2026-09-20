import * as Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { ChestData } from '../types/game';
import { distance } from '../utils/math';
import { Player } from './Player';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  public chestData: ChestData;
  public isOpened: boolean = false;
  private promptGfx: Phaser.GameObjects.Container;
  private isPlayerNearby: boolean = false;

  constructor(scene: Phaser.Scene, data: ChestData, isAlreadyOpened: boolean = false) {
    super(scene, data.x, data.y, isAlreadyOpened ? 'prop_chest_open' : 'prop_chest_closed');
    this.chestData = data;
    this.isOpened = isAlreadyOpened;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(36, 28);
    body.setOffset(4, 10);

    this.promptGfx = scene.add.container(data.x, data.y - 32);
    const bg = scene.add.rectangle(0, 0, 56, 20, 0x131124, 0.85);
    bg.setStrokeStyle(1.5, 0xfdcb6e);
    const text = scene.add.text(0, 0, '[E] Open', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '11px',
      color: '#ffd32a',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);

    this.promptGfx.add([bg, text]);
    this.promptGfx.setVisible(false);
  }

  public updateInteraction(player: Player): void {
    if (this.isOpened) {
      this.promptGfx.setVisible(false);
      this.isPlayerNearby = false;
      return;
    }

    const dist = distance(this.x, this.y, player.x, player.y);
    if (dist < 65) {
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
    return this.isPlayerNearby && !this.isOpened;
  }

  public open(): { itemId: string; quantity: number } | null {
    if (this.isOpened) return null;

    this.isOpened = true;
    this.setTexture('prop_chest_open');
    this.promptGfx.setVisible(false);

    // Sparkle burst
    for (let i = 0; i < 10; i++) {
      const p = this.scene.add.sprite(this.x, this.y - 10, 'fx_spark');
      const angle = (i / 10) * Math.PI * 2;
      const targetX = this.x + Math.cos(angle) * 35;
      const targetY = this.y - 10 + Math.sin(angle) * 35;

      this.scene.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 1.2,
        duration: 400,
        onComplete: () => p.destroy(),
      });
    }

    // Floating item text
    const itemDef = ITEMS[this.chestData.itemId];
    const itemName = itemDef ? itemDef.name : this.chestData.itemId;
    const itemPopup = this.scene.add.text(this.x, this.y - 30, `+${this.chestData.quantity} ${itemName}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#000000',
      strokeThickness: 3,
    });
    itemPopup.setOrigin(0.5);

    this.scene.tweens.add({
      targets: itemPopup,
      y: this.y - 65,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => itemPopup.destroy(),
    });

    return { itemId: this.chestData.itemId, quantity: this.chestData.quantity };
  }

  public override destroy(fromScene?: boolean): void {
    if (this.promptGfx && this.promptGfx.active) {
      this.promptGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
