import * as Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { AudioSystem } from '../systems/AudioSystem';
import { Item } from '../types/game';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
import { GameScene } from './GameScene';

export class InventoryScene extends Phaser.Scene {
  private audio: AudioSystem;
  private gameScene!: GameScene;

  private selectedItemId: string | null = null;
  private selectedSlotType: 'inventory' | 'equipment' | null = null;
  private selectedEquipSlot: 'weapon' | 'armor' | 'accessory' | null = null;

  // UI elements
  private itemsContainer!: Phaser.GameObjects.Container;
  private detailsContainer!: Phaser.GameObjects.Container;
  private equipmentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('InventoryScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // Dim background
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);
    backdrop.setInteractive();

    // Main window panel
    const mainPanel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 920, 560, 0x120f26, 0.96);
    mainPanel.setStrokeStyle(2.5, 0x6c5ce7);

    // Title
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 245, 'INVENTORY & EQUIPMENT', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.text(GAME_WIDTH / 2 + 420, GAME_HEIGHT / 2 - 245, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ff4757',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const closeAction = () => {
      this.audio.playUiClick();
      this.scene.stop('InventoryScene');
    };

    closeBtn.on('pointerdown', closeAction);
    this.input.keyboard?.on('keydown-I', closeAction);
    this.input.keyboard?.on('keydown-ESC', closeAction);

    // Containers
    this.itemsContainer = this.add.container(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2);
    this.equipmentContainer = this.add.container(GAME_WIDTH / 2 - 210, GAME_HEIGHT / 2 + 155);
    this.detailsContainer = this.add.container(GAME_WIDTH / 2 + 250, GAME_HEIGHT / 2);

    this.renderAll();
  }

  private renderAll(): void {
    this.renderInventoryGrid();
    this.renderEquipmentSlots();
    this.renderDetails();
  }

  private renderInventoryGrid(): void {
    this.itemsContainer.removeAll(true);

    const slots = this.gameScene.inventorySystem.getSlots();
    const cols = 6;
    const rows = 3;
    const slotSize = 64;
    const gap = 12;

    const startX = -((cols * (slotSize + gap) - gap) / 2) + slotSize / 2;
    const startY = -120;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const index = r * cols + c;
        const x = startX + c * (slotSize + gap);
        const y = startY + r * (slotSize + gap);

        const slotBg = this.add.rectangle(x, y, slotSize, slotSize, 0x1a1636, 0.9);
        slotBg.setStrokeStyle(1.5, 0x3d3567);
        slotBg.setInteractive({ useHandCursor: true });

        this.itemsContainer.add(slotBg);

        const itemSlot = slots[index];
        if (itemSlot) {
          const itemDef = ITEMS[itemSlot.itemId];
          if (itemDef) {
            // Icon
            const icon = this.add.sprite(x, y - 4, itemDef.iconKey);
            icon.setDisplaySize(38, 38);
            this.itemsContainer.add(icon);

            // Stack count
            if (itemSlot.quantity > 1) {
              const qty = this.add.text(x + 24, y + 16, `${itemSlot.quantity}`, {
                fontFamily: 'Outfit, sans-serif',
                fontSize: '11px',
                fontStyle: 'bold',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
              }).setOrigin(1, 1);
              this.itemsContainer.add(qty);
            }

            // Selection highlight
            if (this.selectedItemId === itemSlot.itemId && this.selectedSlotType === 'inventory') {
              slotBg.setStrokeStyle(2.5, 0x00cec9);
              slotBg.setFillStyle(0x2d2459);
            }

            slotBg.on('pointerdown', () => {
              this.audio.playUiClick();
              this.selectedItemId = itemSlot.itemId;
              this.selectedSlotType = 'inventory';
              this.selectedEquipSlot = null;
              this.renderAll();
            });
          }
        }
      }
    }
  }

  private renderEquipmentSlots(): void {
    this.equipmentContainer.removeAll(true);

    const equip = this.gameScene.inventorySystem.getEquipment();
    const slots: { label: string; key: 'weapon' | 'armor' | 'accessory'; id: string | null }[] = [
      { label: 'Weapon', key: 'weapon', id: equip.weapon },
      { label: 'Armor', key: 'armor', id: equip.armor },
      { label: 'Accessory', key: 'accessory', id: equip.accessory },
    ];

    const slotSize = 64;
    const gap = 36;
    const startX = -((slots.length * (slotSize + gap) - gap) / 2) + slotSize / 2;

    slots.forEach((s, i) => {
      const x = startX + i * (slotSize + gap);
      const y = 0;

      const label = this.add.text(x, y - 44, s.label, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#00cec9',
      }).setOrigin(0.5);
      this.equipmentContainer.add(label);

      const slotBg = this.add.rectangle(x, y, slotSize, slotSize, 0x1a1636, 0.9);
      slotBg.setStrokeStyle(1.5, s.id ? 0xfdcb6e : 0x3d3567);
      slotBg.setInteractive({ useHandCursor: true });
      this.equipmentContainer.add(slotBg);

      if (s.id) {
        const itemDef = ITEMS[s.id];
        if (itemDef) {
          const icon = this.add.sprite(x, y, itemDef.iconKey);
          icon.setDisplaySize(38, 38);
          this.equipmentContainer.add(icon);

          if (this.selectedItemId === s.id && this.selectedSlotType === 'equipment') {
            slotBg.setStrokeStyle(2.5, 0x00cec9);
          }

          slotBg.on('pointerdown', () => {
            this.audio.playUiClick();
            this.selectedItemId = s.id;
            this.selectedSlotType = 'equipment';
            this.selectedEquipSlot = s.key;
            this.renderAll();
          });
        }
      }
    });
  }

  private renderDetails(): void {
    this.detailsContainer.removeAll(true);

    const width = 340;
    const height = 440;

    const bg = this.add.rectangle(0, 0, width, height, 0x161230, 0.9);
    bg.setStrokeStyle(1.5, 0x3d3567);
    this.detailsContainer.add(bg);

    if (!this.selectedItemId) {
      const hint = this.add.text(0, 0, 'Select an item\nto view details', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '16px',
        color: '#718093',
        align: 'center',
      }).setOrigin(0.5);
      this.detailsContainer.add(hint);
      return;
    }

    const item: Item = ITEMS[this.selectedItemId];
    if (!item) return;

    // Item Icon Large
    const iconLarge = this.add.sprite(0, -145, item.iconKey);
    iconLarge.setDisplaySize(60, 60);

    // Item Name
    const name = this.add.text(0, -95, item.name, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    // Item Type
    const type = this.add.text(0, -70, item.type.toUpperCase(), {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#00cec9',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Description
    const desc = this.add.text(0, -10, item.description, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#dcdde1',
      wordWrap: { width: width - 40 },
      align: 'center',
      lineSpacing: 4,
    }).setOrigin(0.5);

    this.detailsContainer.add([iconLarge, name, type, desc]);

    // Action Buttons
    if (this.selectedSlotType === 'inventory') {
      if (item.type === 'consumable') {
        const useBtn = this.createActionButton(0, 80, 'USE ITEM', '#2ed573', () => {
          const used = this.gameScene.inventorySystem.useConsumable(item.id, this.gameScene.player.stats);
          if (used) {
            this.audio.playLevelUp();
            this.gameScene.syncStats();
            this.renderAll();
          }
        });
        this.detailsContainer.add(useBtn);
      } else if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
        const equipBtn = this.createActionButton(0, 80, 'EQUIP', '#00cec9', () => {
          this.gameScene.inventorySystem.equip(item.id);
          this.gameScene.syncStats();
          this.selectedSlotType = 'equipment';
          this.renderAll();
        });
        this.detailsContainer.add(equipBtn);
      }

      const dropBtn = this.createActionButton(0, 140, 'DISCARD (1)', '#ff4757', () => {
        this.gameScene.inventorySystem.removeItem(item.id, 1);
        this.selectedItemId = null;
        this.renderAll();
      });
      this.detailsContainer.add(dropBtn);
    } else if (this.selectedSlotType === 'equipment' && this.selectedEquipSlot) {
      const unequipBtn = this.createActionButton(0, 100, 'UNEQUIP', '#f1c40f', () => {
        this.gameScene.inventorySystem.unequip(this.selectedEquipSlot!);
        this.gameScene.syncStats();
        this.selectedSlotType = 'inventory';
        this.renderAll();
      });
      this.detailsContainer.add(unequipBtn);
    }
  }

  private createActionButton(x: number, y: number, text: string, color: string, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 190, 38, 0x1e1938, 0.95);
    bg.setStrokeStyle(1.5, Phaser.Display.Color.HexStringToColor(color).color);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => {
      this.audio.playUiClick();
      onClick();
    });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x341f97);
      c.setScale(1.03);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x1e1938);
      c.setScale(1.0);
    });

    c.add([bg, txt]);
    return c;
  }
}
