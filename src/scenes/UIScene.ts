import * as Phaser from 'phaser';
import { ARC_BURST_CONFIG, GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT, IS_TOUCH } from '../utils/constants';
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
  private joyOrigin = { x: 0, y: 0 };

  // HUD Layout Constants (computed once)
  private hudPx = 12;
  private hudPy = 10;
  private hudPanelW = 0;
  private hudPanelH = 0;
  private hudBarStartX = 0;
  private hudBarW = 0;
  private hudBarH = 12;
  private hudRow2Y = 0;
  private hudRow3Y = 0;
  private hudRow4Y = 0;
  private hudExpBarH = 9;

  constructor() {
    super('UIScene');
    this.audio = AudioSystem.getInstance();
  }

  public create(): void {
    this.isReady = false;
    this.gameScene = this.scene.get('GameScene') as GameScene;

    // Compute layout constants
    this.computeLayout();

    this.createPlayerHUD();
    this.createTopRightHUD();
    this.createQuestTracker();
    this.createBossBar();
    this.createControlsHint();
    this.createMobileControls();

    // Dialog Box
    this.dialogBox = new DialogBox(this, GAME_WIDTH / 2, GAME_HEIGHT - (IS_PORTRAIT ? 140 : 110));

    // Notifications
    this.notifications = new NotificationManager(this);

    this.isReady = true;

    // Emit event so GameScene knows we're ready
    this.events.emit('ui-ready');
  }

  private computeLayout(): void {
    if (IS_PORTRAIT) {
      this.hudPx = 10;
      this.hudPy = 8;
      this.hudPanelW = Math.min(320, GAME_WIDTH - 20);
      this.hudPanelH = 110;
      this.hudBarStartX = this.hudPx + 36;
      this.hudBarW = this.hudPanelW - 56;
      this.hudBarH = 12;
      this.hudRow2Y = this.hudPy + 38;
      this.hudRow3Y = this.hudRow2Y + this.hudBarH + 6;
      this.hudRow4Y = this.hudRow3Y + this.hudBarH + 6;
      this.hudExpBarH = 8;
    } else {
      this.hudPx = 16;
      this.hudPy = 12;
      this.hudPanelW = 270;
      this.hudPanelH = 130;
      this.hudBarStartX = this.hudPx + 42;
      this.hudBarW = 185;
      this.hudBarH = 14;
      this.hudRow2Y = this.hudPy + 44;
      this.hudRow3Y = this.hudRow2Y + this.hudBarH + 8;
      this.hudRow4Y = this.hudRow3Y + this.hudBarH + 8;
      this.hudExpBarH = 10;
    }

    // Joystick origin
    if (IS_PORTRAIT) {
      this.joyOrigin = { x: 110, y: GAME_HEIGHT - 180 };
    } else {
      this.joyOrigin = { x: 120, y: GAME_HEIGHT - 120 };
    }
  }

  private createPlayerHUD(): void {
    const px = this.hudPx;
    const py = this.hudPy;
    const panelW = this.hudPanelW;
    const panelH = this.hudPanelH;

    // Panel background
    const panel = this.add.rectangle(px + panelW / 2, py + panelH / 2, panelW, panelH, 0x0c0a18, 0.92);
    panel.setStrokeStyle(1.5, 0x3d3567);

    const nameFontSize = IS_PORTRAIT ? '15px' : '18px';
    const levelFontSize = IS_PORTRAIT ? '12px' : '14px';

    // ── Row 1: Name + Level ──
    this.nameText = this.add.text(px + 12, py + 8, 'Aster', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: nameFontSize,
      fontStyle: 'bold',
      color: '#ffffff',
    });

    this.levelText = this.add.text(px + panelW - 12, py + 10, 'LV. 1', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: levelFontSize,
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(1, 0);

    // Divider line under name
    const divider = this.add.graphics();
    divider.lineStyle(1, 0x3d3567, 0.6);
    divider.lineBetween(px + 8, py + 30, px + panelW - 8, py + 30);

    const labelFontSize = IS_PORTRAIT ? '10px' : '12px';
    const barValueFontSize = IS_PORTRAIT ? '10px' : '11px';
    const barStartX = this.hudBarStartX;
    const barW = this.hudBarW;
    const barH = this.hudBarH;
    const row2Y = this.hudRow2Y;
    const row3Y = this.hudRow3Y;
    const row4Y = this.hudRow4Y;
    const expBarH = this.hudExpBarH;

    // ── Row 2: HP Bar ──
    this.add.text(px + 12, row2Y, 'HP', {
      fontFamily: 'Outfit, sans-serif', fontSize: labelFontSize, fontStyle: 'bold', color: '#ff4757',
    });

    this.hpBarGfx = this.add.graphics();
    this.hpText = this.add.text(barStartX + barW / 2, row2Y + barH / 2, '100 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: barValueFontSize, color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Row 3: MP Bar ──
    this.add.text(px + 12, row3Y, 'MP', {
      fontFamily: 'Outfit, sans-serif', fontSize: labelFontSize, fontStyle: 'bold', color: '#00cec9',
    });

    this.mpBarGfx = this.add.graphics();
    this.mpText = this.add.text(barStartX + barW / 2, row3Y + barH / 2, '100 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: barValueFontSize, color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    // ── Row 4: EXP Bar (thinner) ──
    this.add.text(px + 12, row4Y - 1, 'EXP', {
      fontFamily: 'Outfit, sans-serif', fontSize: IS_PORTRAIT ? '9px' : '10px', fontStyle: 'bold', color: '#eccc68',
    });

    this.expBarGfx = this.add.graphics();
    this.expText = this.add.text(barStartX + barW / 2, row4Y + expBarH / 2, '0 / 100', {
      fontFamily: 'Outfit, sans-serif', fontSize: IS_PORTRAIT ? '9px' : '10px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private createTopRightHUD(): void {
    const btnSize = IS_PORTRAIT ? 32 : 36;
    const iconFontSize = IS_PORTRAIT ? '14px' : '16px';
    const coinFontSize = IS_PORTRAIT ? '14px' : '16px';

    // Coin display
    const coinBgW = IS_PORTRAIT ? 90 : 110;
    const coinBgX = GAME_WIDTH - (IS_PORTRAIT ? 170 : 210);
    const coinBgY = IS_PORTRAIT ? 30 : 36;

    const coinBg = this.add.rectangle(coinBgX, coinBgY, coinBgW, 30, 0x100d20, 0.88);
    coinBg.setStrokeStyle(1.5, 0xfdcb6e);

    this.add.text(coinBgX - coinBgW / 2 - 18, coinBgY - 10, '🪙', { fontSize: iconFontSize });
    this.coinsText = this.add.text(coinBgX - coinBgW / 2 + 2, coinBgY - 10, '50', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: coinFontSize,
      fontStyle: 'bold',
      color: '#ffd32a',
    });

    // Header buttons
    const btnY = coinBgY;
    const btnGap = IS_PORTRAIT ? 38 : 47;

    this.createHeaderButton(GAME_WIDTH - btnGap * 2 - 10, btnY, '🎒', () => {
      if (this.gameScene?.openInventory) this.gameScene.openInventory();
    });

    this.createHeaderButton(GAME_WIDTH - btnGap - 10, btnY, '📜', () => {
      if (this.gameScene?.openQuests) this.gameScene.openQuests();
    });

    this.createHeaderButton(GAME_WIDTH - 10 - btnSize / 2, btnY, '❚❚', () => {
      if (this.gameScene?.pauseGame) this.gameScene.pauseGame();
    });
  }

  private createHeaderButton(
    x: number, y: number, icon: string, onClick: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const size = IS_PORTRAIT ? 32 : 36;
    const bg = this.add.rectangle(0, 0, size, size - 2, 0x181432, 0.9);
    bg.setStrokeStyle(1.5, 0x6c5ce7);
    bg.setInteractive({ useHandCursor: true });

    const txt = this.add.text(0, 0, icon, {
      fontFamily: 'Outfit, sans-serif', fontSize: IS_PORTRAIT ? '14px' : '16px',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => { this.audio.playUiClick(); onClick(); });
    bg.on('pointerover', () => { bg.setFillStyle(0x341f97); container.setScale(1.08); });
    bg.on('pointerout', () => { bg.setFillStyle(0x181432); container.setScale(1.0); });

    container.add([bg, txt]);
    return container;
  }

  private createQuestTracker(): void {
    const trackerW = IS_PORTRAIT ? Math.min(280, GAME_WIDTH - 20) : 240;
    const trackerH = IS_PORTRAIT ? 60 : 75;
    const trackerX = IS_PORTRAIT ? GAME_WIDTH / 2 : GAME_WIDTH - 140;
    const trackerY = IS_PORTRAIT ? this.hudPy + this.hudPanelH + trackerH / 2 + 8 : 115;

    const questContainer = this.add.container(trackerX, trackerY);

    const bg = this.add.rectangle(0, 0, trackerW, trackerH, 0x100d20, 0.85);
    bg.setStrokeStyle(1.5, 0x3d3567);

    const headerFontSize = IS_PORTRAIT ? '9px' : '11px';
    const titleFontSize = IS_PORTRAIT ? '12px' : '14px';
    const objFontSize = IS_PORTRAIT ? '10px' : '12px';

    const header = this.add.text(-trackerW / 2 + 12, -trackerH / 2 + 6, 'ACTIVE QUEST', {
      fontFamily: 'Outfit, sans-serif', fontSize: headerFontSize, fontStyle: 'bold', color: '#00cec9', letterSpacing: 1,
    });

    this.questTitleText = this.add.text(-trackerW / 2 + 12, -trackerH / 2 + 20, 'First Steps', {
      fontFamily: 'Outfit, sans-serif', fontSize: titleFontSize, fontStyle: 'bold', color: '#ffffff',
    });

    this.questObjectiveText = this.add.text(-trackerW / 2 + 12, -trackerH / 2 + 36, 'Talk to Mira in Whispering Meadow', {
      fontFamily: 'Outfit, sans-serif', fontSize: objFontSize, color: '#a4b0be', wordWrap: { width: trackerW - 24 },
    });

    questContainer.add([bg, header, this.questTitleText, this.questObjectiveText]);
  }

  private createBossBar(): void {
    const bossBarY = IS_PORTRAIT ? (this.hudPy + this.hudPanelH + 85) : 60;
    this.bossBarContainer = this.add.container(GAME_WIDTH / 2, bossBarY);
    this.bossBarContainer.setVisible(false);

    const width = IS_PORTRAIT ? Math.min(500, GAME_WIDTH - 40) : 540;
    const height = 24;

    const bg = this.add.rectangle(0, 0, width + 6, height + 6, 0x100d20, 0.95);
    bg.setStrokeStyle(2, 0xff4757);

    this.bossBarFillGfx = this.add.graphics();

    const bossTitle = this.add.text(0, -22, 'ANCIENT GUARDIAN', {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: IS_PORTRAIT ? '14px' : '18px', fontStyle: 'bold',
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
    // Only show keyboard controls hint on desktop
    if (IS_TOUCH) return;

    const hintContainer = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 35);

    const bg = this.add.rectangle(0, 0, 420, 38, 0x100d20, 0.85);
    bg.setStrokeStyle(1.5, 0x3d3567);

    const txt = this.add.text(
      0, 0,
      '[J] Attack   [K] Arc Burst   [E] Interact   [I] Bag   [ESC] Pause',
      { fontFamily: 'Outfit, sans-serif', fontSize: '12px', color: '#dcdde1' }
    ).setOrigin(0.5);

    hintContainer.add([bg, txt]);

    this.skillCdText = this.add.text(GAME_WIDTH / 2 - 230, GAME_HEIGHT - 35, '', {
      fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontStyle: 'bold', color: '#00cec9',
    }).setOrigin(1, 0.5);
  }

  private createMobileControls(): void {
    this.touchContainer = this.add.container(0, 0);

    // Joystick Base
    const joyBase = this.add.sprite(this.joyOrigin.x, this.joyOrigin.y, 'ui_joy_base');
    joyBase.setInteractive();
    joyBase.setAlpha(0.7);

    this.joyThumb = this.add.sprite(this.joyOrigin.x, this.joyOrigin.y, 'ui_joy_thumb');
    this.joyThumb.setAlpha(0.8);

    // Make joystick bigger on portrait for easier touch
    if (IS_PORTRAIT) {
      joyBase.setScale(1.1);
      this.joyThumb.setScale(1.1);
    }

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
    // Don't stop on pointerout to avoid stuck joystick — only stop on global pointerup
    this.input.on('pointerup', stopJoy);

    // Action buttons — positioned for portrait layout
    const btnRadius = IS_PORTRAIT ? 36 : 32;
    let rightMargin: number;
    let bottomMargin: number;

    if (IS_PORTRAIT) {
      rightMargin = GAME_WIDTH - 100;
      bottomMargin = GAME_HEIGHT - 200;
    } else {
      rightMargin = GAME_WIDTH - 90;
      bottomMargin = GAME_HEIGHT - 85;
    }

    const atkBtnX = IS_PORTRAIT ? rightMargin - 50 : rightMargin - 65;
    const atkBtnY = IS_PORTRAIT ? bottomMargin + 20 : bottomMargin - 15;
    this.createTouchActionButton(atkBtnX, atkBtnY, 'ATK', '#ff4757', btnRadius, () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchAttack();
    });

    const skillBtnX = IS_PORTRAIT ? rightMargin + 20 : rightMargin;
    const skillBtnY = IS_PORTRAIT ? bottomMargin - 50 : bottomMargin - 85;
    this.createTouchActionButton(skillBtnX, skillBtnY, 'SKILL', '#00cec9', btnRadius, () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchSkill();
    });

    const useBtnX = IS_PORTRAIT ? rightMargin - 120 : rightMargin - 130;
    const useBtnY = IS_PORTRAIT ? bottomMargin - 45 : bottomMargin - 80;
    this.createTouchActionButton(useBtnX, useBtnY, 'USE', '#ffd32a', btnRadius, () => {
      if (this.gameScene?.inputSystem) this.gameScene.inputSystem.triggerTouchInteract();
    });

    // Skill cooldown text for mobile (positioned near skill button)
    if (IS_TOUCH) {
      this.skillCdText = this.add.text(skillBtnX, skillBtnY - btnRadius - 12, '', {
        fontFamily: 'Outfit, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#00cec9',
      }).setOrigin(0.5);
    }

    this.touchContainer.add([joyBase, this.joyThumb]);

    // Show touch controls on touch devices or if setting is on
    const shouldShow =
      this.gameScene?.settings?.virtualControls ||
      IS_TOUCH;

    this.touchContainer.setVisible(shouldShow);
  }

  private handleJoyMove(x: number, y: number): void {
    const maxRadius = IS_PORTRAIT ? 50 : 45;
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
    x: number, y: number, label: string, color: string, radius: number, onPress: () => void
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.circle(0, 0, radius, 0x181432, 0.8);
    bg.setStrokeStyle(2.5, Phaser.Display.Color.HexStringToColor(color).color);
    bg.setInteractive();

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Outfit, sans-serif', fontSize: IS_PORTRAIT ? '14px' : '13px', fontStyle: 'bold', color: '#ffffff', align: 'center',
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

    const barStartX = this.hudBarStartX;
    const barW = this.hudBarW;
    const barH = this.hudBarH;
    const row2Y = this.hudRow2Y;
    const row3Y = this.hudRow3Y;
    const row4Y = this.hudRow4Y;
    const expBarH = this.hudExpBarH;

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
    if (this.skillCdText && this.gameScene?.player) {
      const lastSkill = this.gameScene.player.lastSkillTime || -9999;
      const cdElapsed = this.time.now - lastSkill;
      if (cdElapsed < ARC_BURST_CONFIG.cooldownMs) {
        const remainingSec = ((ARC_BURST_CONFIG.cooldownMs - cdElapsed) / 1000).toFixed(1);
        this.skillCdText.setText(`CD: ${remainingSec}s`);
      } else {
        this.skillCdText.setText(playerStats.mp >= ARC_BURST_CONFIG.manaCost ? 'READY' : 'LOW MP');
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
    const width = IS_PORTRAIT ? Math.min(490, GAME_WIDTH - 50) : 530;
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
