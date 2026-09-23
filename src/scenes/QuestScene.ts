import * as Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { AudioSystem } from '../systems/AudioSystem';
import { Quest } from '../types/game';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';
import { GameScene } from './GameScene';

export class QuestScene extends Phaser.Scene {
  private audio: AudioSystem;
  private gameScene!: GameScene;
  private contentContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('QuestScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    this.gameScene = this.scene.get('GameScene') as GameScene;

    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.65);
    backdrop.setInteractive();

    const panelW = IS_PORTRAIT ? Math.min(680, W - 20) : 860;
    const panelH = IS_PORTRAIT ? Math.min(1000, H - 60) : 540;
    const mainPanel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x120f26, 0.96);
    mainPanel.setStrokeStyle(2.5, 0x6c5ce7);

    this.add.text(W / 2, H / 2 - panelH / 2 + 30, 'QUEST LOG', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '20px' : '24px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const closeBtn = this.add.text(W / 2 + panelW / 2 - 25, H / 2 - panelH / 2 + 30, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '20px' : '24px',
      fontStyle: 'bold',
      color: '#ff4757',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const closeAction = () => {
      this.audio.playUiClick();
      this.scene.stop('QuestScene');
    };

    closeBtn.on('pointerdown', closeAction);
    this.input.keyboard?.on('keydown-ESC', closeAction);

    this.contentContainer = this.add.container(W / 2, H / 2);
    this.renderQuests();
  }

  private renderQuests(): void {
    this.contentContainer.removeAll(true);
    const quests = this.gameScene.questSystem.getQuests();

    const cardW = IS_PORTRAIT ? Math.min(640, GAME_WIDTH - 50) : 800;
    const cardH = IS_PORTRAIT ? 80 : 88;
    const spacing = IS_PORTRAIT ? 12 : 16;

    const startY = -((quests.length * (cardH + spacing) - spacing) / 2) + cardH / 2;

    quests.forEach((q: Quest, i: number) => {
      const y = startY + i * (cardH + spacing);
      const card = this.add.container(0, y);

      let borderColor = 0x3d3567;
      let stateLabel = 'LOCKED';
      let stateColor = '#718093';

      if (q.state === 'ACTIVE') {
        borderColor = 0x00cec9;
        stateLabel = 'ACTIVE';
        stateColor = '#00cec9';
      } else if (q.state === 'COMPLETED') {
        borderColor = 0x2ed573;
        stateLabel = 'COMPLETED';
        stateColor = '#2ed573';
      }

      const cardBg = this.add.rectangle(0, 0, cardW, cardH, 0x181434, 0.9);
      cardBg.setStrokeStyle(1.5, borderColor);

      const titleFontSize = IS_PORTRAIT ? '14px' : '17px';
      const badgeFontSize = IS_PORTRAIT ? '11px' : '13px';
      const objFontSize = IS_PORTRAIT ? '11px' : '13px';
      const rewardFontSize = IS_PORTRAIT ? '10px' : '12px';
      const pad = cardW / 2 - 15;

      const title = this.add.text(-pad, -cardH / 2 + 8, q.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: titleFontSize,
        fontStyle: 'bold',
        color: '#ffffff',
      });

      const badge = this.add.text(pad, -cardH / 2 + 8, `[ ${stateLabel} ]`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: badgeFontSize,
        fontStyle: 'bold',
        color: stateColor,
      }).setOrigin(1, 0);

      const objCount = q.requiredCount > 1 ? ` (${q.currentCount}/${q.requiredCount})` : '';
      const objective = this.add.text(-pad, -cardH / 2 + 28, `Objective: ${q.objective}${objCount}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: objFontSize,
        color: '#dcdde1',
        wordWrap: { width: cardW - 30 },
      });

      let rewardText = `Rewards: +${q.reward.exp} EXP, +${q.reward.coins} Coins`;
      if (q.reward.item) {
        const itemDef = ITEMS[q.reward.item.itemId];
        rewardText += `, +${q.reward.item.quantity} ${itemDef ? itemDef.name : q.reward.item.itemId}`;
      }

      const rewards = this.add.text(-pad, -cardH / 2 + 48, rewardText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: rewardFontSize,
        color: '#ffd32a',
        wordWrap: { width: cardW - 30 },
      });

      card.add([cardBg, title, badge, objective, rewards]);
      this.contentContainer.add(card);
    });
  }
}
