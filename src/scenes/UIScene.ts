import * as Phaser from 'phaser';
import { ARC_BURST_CONFIG, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
import { DialogBox } from '../ui/DialogBox';
import { NotificationManager } from '../ui/Notification';
import { PlayerStats } from '../types/game';
import { AudioSystem } from '../systems/AudioSystem';
import { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;
  private audio: AudioSystem;
  private isReady: boolean = false;

  // Top-Left Status Bars
  private nameText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private hpBarGfx!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private mpBarGfx!: Phaser.GameObjects.Graphics;
  private mpText!: Phaser.GameObjects.Text;
  private expBarGfx!: Phaser.GameObjects.Graphics;
  private expText!: Phaser.GameObjects.Text;

  // Top-Right Gold & Quest Tracker
  private coinsText!: Phaser.GameObjects.Text;
  private questTitleText!: Phaser.GameObjects.Text;
  private questObjectiveText!: Phaser.GameObjects.Text;

  // Boss Bar
  private bossBarContainer!: Phaser.GameObjects.Container;
  private bossBarFillGfx!: Phaser.GameObjects.Graphics;
  private bossHpText!: Phaser.GameObjects.Text;
  private bossPhaseText!: Phaser.GameObjects.Text;

  // Skill Cooldown Indicator
  private skillCdText!: Phaser.GameObjects.Text;

  // Dialog & Notifications
  public dialogBox!: DialogBox;
  public notifications!: NotificationManager;

  // Mobile Controls
  private touchContainer!: Phaser.GameObjects.Container;
  private joyThumb!: Phaser.GameObjects.Sprite;
  private isJoyDragging: boolean = false;
  private joyOrigin = { x: 120, y: GAME_HEIGHT - 120 };

  constructor() {
    super('UIScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    this.isReady = false;
    this.gameScene = this.scene.get('GameScene') as GameScene;

    this.createPlayerHUD();
    this.createTopRightHUD();
    this.createQuestTracker();
    this.createBossBar();
    this.createControlsHint();
    this.createMobileControls();

    // Dialog Box
    this.dialogBox = new DialogBox(this, GAME_WIDTH / 2, GAME_HEIGHT - 110);

    // Notifications
    this.notifications = new NotificationManager(this);

    this.isReady = true;

    // Emit event so GameScene knows we're ready
    this.events.emit('ui-ready');
  }

  private createPlayerHUD(): void {
    const px = 16; // panel left margin
    const py = 12; // panel top margin

    // Panel background - taller to fit everything
    const panelW = 270;
    const panelH = 130;
    const panel = this.add.rectangle(px + panelW / 2, py + panelH / 2, panelW, panelH, 0x0c0a18, 0.92);
    panel.setStrokeStyle(1.5, 0x3d3567);

    // ── Row 1: Name + Level ──
    this.nameText = this.add.text(px + 14, py + 10, 'Aster', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff',
    });

    this.levelText = this.add.text(px + panelW - 14, py + 12, 'LV. 1', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(1, 0);

    // Divider line under name
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x3d3567, 0.6);
    divider.lineBetween(px + 10, py + 34, px + panelW - 10, py + 34);

    // ── Row 2: HP Bar ──
    const barStartX = px + 42;
    const barW = 185;
    const barH = 14;
    const row2Y = py + 44;

    this.add.text(px + 14, row2Y, 'HP', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ff4757',
    });

    this.hpBarGfx = this.add.graphics();
    this.hpText = this.add.text(barStartX + barW / 2, row2Y + barH / 2, '100 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Row 3: MP Bar ──
    const row3Y = row2Y + barH + 8;

    this.add.text(px + 14, row3Y, 'MP', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#00cec9',
    });

    this.mpBarGfx = this.add.graphics();
    this.mpText = this.add.text(barStartX + barW / 2, row3Y + barH / 2, '100 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: '11px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Row 4: EXP Bar (thinner) ──
    const row4Y = row3Y + barH + 8;
    const expBarH = 10;

    this.add.text(px + 14, row4Y - 1, 'EXP', {
      fontFamily: 'Outfit, sans-serif', fontSize: '10px', fontStyle: 'bold', color: '#eccc68',
    });

    this.expBarGfx = this.add.graphics();
    this.expText = this.add.text(barStartX + barW / 2, row4Y + expBarH / 2, '0 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createTopRightHUD(): void {
    const coinBg = this.add.rectangle(GAME_WIDTH - 210, 36, 110, 34, 0x100d20, 0.88);
    coinBg.setStrokeStyle(1.5, 0xfdcb6e);

    this.add.text(GAME_WIDTH - 252, 26, '🪙', { fontSize: '16px' });
    this.coinsText = this.add.text(GAME_WIDTH - 230, 26, '50', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffd32a',
    });

    this.createHeaderButton(GAME_WIDTH - 125, 36, '🎒', () => {
      if (this.gameScene?.openInventory) this.gameScene.openInventory();
    });

    this.createHeaderButton(GAME_WIDTH - 78, 36, '📜', () => {
      if (this.gameScene?.openQuests) this.gameScene.openQuests();
    });

    this.createHeaderButton(GAME_WIDTH - 32, 36, '❚❚', () => {
      if (this.gameScene?.pauseGame) this.gameScene.pauseGame();
    });
  }

  private createHeaderButton(
    x: number, y: number, icon: string, onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 36, 34, 0x181432, 0.9);
    bg.setStrokeStyle(1.5, 0x6c5ce7);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(0, 0, icon, {
      fontFamily: 'Outfit, sans-serif', fontSize: '16px',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => { this.audio.playUiClick(); onClick(); });
    bg.on('pointerover', () => { bg.setFillStyle(0x341f97); container.setScale(1.08); });
    bg.on('pointerout', () => { bg.setFillStyle(0x181432); container.setScale(1.0); });

    container.add([bg, txt]);
    return container;
  }

  private createQuestTracker(): void {
    const questContainer = this.add.container(GAME_WIDTH - 140, 115);

    const bg = this.add.rectangle(0, 0, 240, 75, 0x100d20, 0.85);
    bg.setStrokeStyle(1.5, 0x3d3567);

    const header = this.add.text(-108, -28, 'ACTIVE QUEST', {
      fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#00cec9', letterSpacing: 1,
    });

    this.questTitleText = this.add.text(-108, -10, 'First Steps', {
      fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
    });

    this.questObjectiveText = this.add.text(-108, 10, 'Talk to Mira in Whispering Meadow', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', color: '#a4b0be', wordWrap: { width: 215 },
    });

    questContainer.add([bg, header, this.questTitleText, this.questObjectiveText]);
  }

  private createBossBar(): void {
    this.bossBarContainer = this.add.container(GAME_WIDTH / 2, 60);
    this.bossBarContainer.setVisible(false);

    const width = 540;
    const height = 24;

    const bg = this.add.rectangle(0, 0, width + 6, height + 6, 0x100d20, 0.95);
    bg.setStrokeStyle(2, 0xff4757);

    this.bossBarFillGfx = this.add.graphics();

    const bossTitle = this.add.text(0, -22, 'ANCIENT GUARDIAN', {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', fontStyle: 'bold',
      color: '#ffd32a', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.bossPhaseText = this.add.text(-width / 2 + 10, 0, 'PHASE 1', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#00cec9',
    }).setOrigin(0, 0.5);

    this.bossHpText = this.add.text(width / 2 - 10, 0, '250 / 250', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(1, 0.5);

    this.bossBarContainer.add([bg, this.bossBarFillGfx, bossTitle, this.bossPhaseText, this.bossHpText]);
  }

  private createControlsHint(): void {
    const hintContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 35);

    const bg = this.add.rectangle(0, 0, 420, 38, 0x100d20, 0.85);
    bg.setStrokeStyle(1.5, 0x3d3567);

    const txt = this.add.text(
      0, 0,
      '[J] Attack   [K] Arc Burst   [E] Interact   [I] Bag   [ESC] Pause',
      { fontFamily: 'Outfit, sans-serif', fontSize: '12px', color: '#dcdde1' }
    ).setOrigin(0.5);

    this.skillCdText = this.add.text(GAME_WIDTH / 2 - 230, GAME_HEIGHT - 35, '', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#00cec9',
    }).setOrigin(1, 0.5);

    hintContainer.add([bg, txt]);
  }

  private createMobileControls(): void {
    this.touchContainer = this.add.container(0, 0);

    const joyBase = this.add.sprite(this.joyOrigin.x, this.joyOrigin.y, 'ui_joy_base');
    joyBase.setInteractive();

    this.joyThumb = this.add.sprite(this.joyOrigin.x, this.joyOrigin.y, 'ui_joy_thumb');

    joyBase.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isJoyDragging = true;
      this.handleJoyMove(pointer.x, pointer.y);
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isJoyDragging) {
        this.handleJoyMove(pointer.x, pointer.y);
      }
    });

    const stopJoy = () => {
      if (this.isJoyDragging) {
        this.isJoyDragging = false;
        this.joyThumb.setPosition(this.joyOrigin.x, this.joyOrigin.y);
        if (this.gameScene?.inputSystem) {
          this.gameScene.inputSystem.setTouchJoystick(0, 0);
        }
      }
    };

    joyBase.on('pointerup', stopJoy);
    joyBase.on('pointerout', stopJoy);
    this.input.on('pointerup', stopJoy);

    const rightMargin = GAME_WIDTH - 90;
    const bottomMargin = GAME_HEIGHT - 85;

    this.createTouchActionButton(rightMargin - 65, bottomMargin - 15, 'ATK\n[J]', '#ff4757', () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchAttack();
    });

    this.createTouchActionButton(rightMargin, bottomMargin - 85, 'SKILL\n[K]', '#00cec9', () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchSkill();
    });

    this.createTouchActionButton(rightMargin - 130, bottomMargin - 80, 'USE\n[E]', '#ffd32a', () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchInteract();
    });

    this.touchContainer.add([joyBase, this.joyThumb]);

    // Show touch controls on touch devices or if setting is on
    const shouldShow =
      this.gameScene?.settings?.virtualControls ||
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0;

    this.touchContainer.setVisible(shouldShow);
  }

  private handleJoyMove(x: number, y: number): void {
    const maxRadius = 45;
    const dx = x - this.joyOrigin.x;
    const dy = y - this.joyOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= maxRadius) {
      this.joyThumb.setPosition(x, y);
      if (this.gameScene?.inputSystem) {
        this.gameScene.inputSystem.setTouchJoystick(dx / maxRadius, dy / maxRadius);
      }
    } else {
      const angle = Math.atan2(dy, dx);
      this.joyThumb.setPosition(
        this.joyOrigin.x + Math.cos(angle) * maxRadius,
        this.joyOrigin.y + Math.sin(angle) * maxRadius
      );
      if (this.gameScene?.inputSystem) {
        this.gameScene.inputSystem.setTouchJoystick(Math.cos(angle), Math.sin(angle));
      }
    }
  }

  private createTouchActionButton(
    x: number, y: number, label: string, color: string, onPress: () => void
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.circle(0, 0, 32, 0x181432, 0.85);
    bg.setStrokeStyle(2.5, Phaser.Display.Color.HexStringToColor(color).color);
    bg.setInteractive();

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffffff', align: 'center',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => { c.setScale(0.92); onPress(); });
    bg.on('pointerup', () => { c.setScale(1.0); });
    bg.on('pointerout', () => { c.setScale(1.0); });

    c.add([bg, txt]);
    this.touchContainer.add(c);
    return c;
  }

  public updateHUD(playerStats: PlayerStats, coins: number): void {
    if (!this.isReady || !playerStats) return;

    this.nameText.setText(playerStats.name);
    this.levelText.setText(`LV. ${playerStats.level}`);
    this.coinsText.setText(`${coins}`);

    // These must match the layout in createPlayerHUD
    const px = 16;
    const py = 12;
    const barStartX = px + 42;
    const barW = 185;
    const barH = 14;
    const row2Y = py + 44;
    const row3Y = row2Y + barH + 8;
    const row4Y = row3Y + barH + 8;
    const expBarH = 10;

    // HP Bar
    this.hpBarGfx.clear();
    this.hpBarGfx.fillStyle(0x2d3436, 0.8);
    this.hpBarGfx.fillRoundedRect(barStartX, row2Y, barW, barH, 3);
    const hpPct = Math.max(0, playerStats.hp / playerStats.maxHp);
    this.hpBarGfx.fillStyle(0xff4757, 1);
    this.hpBarGfx.fillRoundedRect(barStartX, row2Y, barW * hpPct, barH, 3);
    this.hpText.setText(`${playerStats.hp} / ${playerStats.maxHp}`);

    // MP Bar
    this.mpBarGfx.clear();
    this.mpBarGfx.fillStyle(0x2d3436, 0.8);
    this.mpBarGfx.fillRoundedRect(barStartX, row3Y, barW, barH, 3);
    const mpPct = Math.max(0, playerStats.mp / playerStats.maxMp);
    this.mpBarGfx.fillStyle(0x00cec9, 1);
    this.mpBarGfx.fillRoundedRect(barStartX, row3Y, barW * mpPct, barH, 3);
    this.mpText.setText(`${playerStats.mp} / ${playerStats.maxMp}`);

    // EXP Bar
    this.expBarGfx.clear();
    this.expBarGfx.fillStyle(0x2d3436, 0.8);
    this.expBarGfx.fillRoundedRect(barStartX, row4Y, barW, expBarH, 2);
    const expPct = Math.max(0, playerStats.exp / playerStats.requiredExp);
    this.expBarGfx.fillStyle(0xfdcb6e, 1);
    this.expBarGfx.fillRoundedRect(barStartX, row4Y, barW * expPct, expBarH, 2);
    this.expText.setText(`${playerStats.exp} / ${playerStats.requiredExp}`);

    // Skill cooldown
    if (this.gameScene?.player) {
      const lastSkill = this.gameScene.player.lastSkillTime || -9999;
      const cdElapsed = this.time.now - lastSkill;
      if (cdElapsed < ARC_BURST_CONFIG.cooldownMs) {
        const remainingSec = ((ARC_BURST_CONFIG.cooldownMs - cdElapsed) / 1000).toFixed(1);
        this.skillCdText.setText(`[K] CD: ${remainingSec}s`);
      } else {
        this.skillCdText.setText(playerStats.mp >= ARC_BURST_CONFIG.manaCost ? '[K] READY' : '[K] LOW MP');
      }
    }
  }

  public updateQuestTracker(title: string, objective: string, count: number, maxCount: number): void {
    if (!this.isReady || !this.questTitleText) return;
    this.questTitleText.setText(title);
    if (maxCount > 1) {
      this.questObjectiveText.setText(`${objective} (${count}/${maxCount})`);
    } else {
      this.questObjectiveText.setText(objective);
    }
  }

  public showBossBar(name: string, hp: number, maxHp: number, phase: number): void {
    if (!this.isReady || !this.bossBarContainer) return;
    this.bossBarContainer.setVisible(true);
    const width = 530;
    const height = 18;
    const pct = Math.max(0, hp / maxHp);

    this.bossBarFillGfx.clear();
    this.bossBarFillGfx.fillStyle(0xff3838, 1);
    this.bossBarFillGfx.fillRect(-width / 2, -height / 2, width * pct, height);

    this.bossHpText.setText(`${hp} / ${maxHp}`);
    this.bossPhaseText.setText(`PHASE ${phase}`);
  }

  public hideBossBar(): void {
    if (!this.isReady || !this.bossBarContainer) return;
    this.bossBarContainer.setVisible(false);
  }

  public setVirtualControlsVisible(visible: boolean): void {
    if (!this.isReady || !this.touchContainer) return;
    this.touchContainer.setVisible(visible);
  }
}
