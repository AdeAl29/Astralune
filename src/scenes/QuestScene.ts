import * as Phaser from 'phaser';
import { ITEMS } from '../data/items';
import { AudioSystem } from '../systems/AudioSystem';
import { Quest } from '../types/game';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
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

    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65);
    backdrop.setInteractive();

    const mainPanel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 860, 540, 0x120f26, 0.96);
    mainPanel.setStrokeStyle(2.5, 0x6c5ce7);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 235, 'QUEST LOG', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const closeBtn = this.add.text(GAME_WIDTH / 2 + 390, GAME_HEIGHT / 2 - 235, '✕', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ff4757',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const closeAction = () => {
      this.audio.playUiClick();
      this.scene.stop('QuestScene');
    };

    closeBtn.on('pointerdown', closeAction);
    this.input.keyboard?.on('keydown-ESC', closeAction);

    this.contentContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    this.renderQuests();
  }

  private renderQuests(): void {
    this.contentContainer.removeAll(true);
    const quests = this.gameScene.questSystem.getQuests();

    const startY = -160;
    const cardH = 88;
    const spacing = 16;

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

      const cardBg = this.add.rectangle(0, 0, 800, cardH, 0x181434, 0.9);
      cardBg.setStrokeStyle(1.5, borderColor);

      const title = this.add.text(-380, -28, q.title, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#ffffff',
      });

      const badge = this.add.text(380, -28, `[ ${stateLabel} ]`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: stateColor,
      }).setOrigin(1, 0);

      const objCount = q.requiredCount > 1 ? ` (${q.currentCount}/${q.requiredCount})` : '';
      const objective = this.add.text(-380, -4, `Objective: ${q.objective}${objCount}`, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '13px',
        color: '#dcdde1',
      });

      let rewardText = `Rewards: +${q.reward.exp} EXP, +${q.reward.coins} Coins`;
      if (q.reward.item) {
        const itemDef = ITEMS[q.reward.item.itemId];
        rewardText += `, +${q.reward.item.quantity} ${itemDef ? itemDef.name : q.reward.item.itemId}`;
      }

      const rewards = this.add.text(-380, 18, rewardText, {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        color: '#ffd32a',
      });

      card.add([cardBg, title, badge, objective, rewards]);
      this.contentContainer.add(card);
    });
  }
}
