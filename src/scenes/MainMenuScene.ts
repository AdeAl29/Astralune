import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class MainMenuScene extends Phaser.Scene {
  private audio: AudioSystem;
  private saveSystem: SaveSystem;

  constructor() {
    super('MainMenuScene');
    this.audio = AudioSystem.getInstance();
    this.saveSystem = SaveSystem.getInstance();
  }

  public create(): void {
    this.audio.playBgm('menu');

    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    // Rich cosmic fantasy gradient background
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0f0c1b, 0x0f0c1b, 0x1f1738, 0x2c1f4d, 1);
    bgGfx.fillRect(0, 0, W, H);

    // Floating astral particles
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const size = Math.random() * 3 + 1;
      const alpha = Math.random() * 0.6 + 0.2;

      const star = this.add.circle(x, y, size, 0x74b9ff, alpha);

      this.tweens.add({
        targets: star,
        y: y - 40 - Math.random() * 50,
        alpha: { from: alpha, to: 0.1 },
        yoyo: true,
        repeat: -1,
        duration: 2500 + Math.random() * 3000,
      });
    }

    // Title positioning
    const titleY = IS_PORTRAIT ? H * 0.18 : 170;
    const titleFontSize = IS_PORTRAIT ? '32px' : '44px';
    const subtitleFontSize = IS_PORTRAIT ? '14px' : '18px';

    // Glowing Title Banner
    const titleGlow = this.add.text(W / 2, titleY + 2, 'ECHOES OF THE\nFORGOTTEN REALM', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: titleFontSize,
      fontStyle: 'bold',
      color: '#6c5ce7',
      align: 'center',
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.35);

    const title = this.add.text(W / 2, titleY, 'ECHOES OF THE\nFORGOTTEN REALM', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: titleFontSize,
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#1e1b2e',
      strokeThickness: 6,
      align: 'center',
    });
    title.setOrigin(0.5);

    const subtitleY = IS_PORTRAIT ? titleY + 70 : 250;
    const subtitle = this.add.text(W / 2, subtitleY, '— 2D Action RPG Adventure —', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: subtitleFontSize,
      color: '#00cec9',
      letterSpacing: 3,
    });
    subtitle.setOrigin(0.5);

    // Menu Buttons
    const startY = IS_PORTRAIT ? H * 0.38 : 340;
    const spacing = IS_PORTRAIT ? 56 : 64;
    const hasSave = this.saveSystem.hasSave();
    const btnW = IS_PORTRAIT ? Math.min(280, W - 60) : 260;

    this.createMenuButton(W / 2, startY, 'NEW GAME', btnW, () => {
      this.audio.playUiClick();
      this.scene.start('IntroScene');
    });

    this.createMenuButton(
      W / 2,
      startY + spacing,
      'CONTINUE',
      btnW,
      () => {
        if (!hasSave) return;
        this.audio.playUiClick();
        const save = this.saveSystem.loadGame();
        this.scene.start('GameScene', { loadFromSave: save });
      },
      !hasSave
    );

    this.createMenuButton(W / 2, startY + spacing * 2, 'SETTINGS', btnW, () => {
      this.audio.playUiClick();
      this.scene.launch('SettingsScene', { returnTo: 'MainMenuScene' });
    });

    this.createMenuButton(W / 2, startY + spacing * 3, 'CREDITS', btnW, () => {
      this.audio.playUiClick();
      this.showCreditsModal();
    });

    // Version Tag
    const ver = this.add.text(W - 16, H - 16, 'v1.0.0 — Production Build', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '11px' : '13px',
      color: '#718093',
    });
    ver.setOrigin(1, 1);
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    width: number,
    onClick: () => void,
    isDisabled: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const height = IS_PORTRAIT ? 44 : 48;

    const bg = this.add.rectangle(0, 0, width, height, isDisabled ? 0x1a1a26 : 0x1e1938, isDisabled ? 0.4 : 0.85);
    bg.setStrokeStyle(2, isDisabled ? 0x3d3555 : 0x6c5ce7);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '16px' : '18px',
      fontStyle: 'bold',
      color: isDisabled ? '#57606f' : '#ffffff',
    });
    label.setOrigin(0.5);

    container.add([bg, label]);

    if (!isDisabled) {
      bg.setInteractive({ useHandCursor: true });

      bg.on('pointerover', () => {
        bg.setFillStyle(0x341f97, 0.95);
        bg.setStrokeStyle(2.5, 0x00cec9);
        label.setColor('#ffd32a');
        container.setScale(1.04);
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(0x1e1938, 0.85);
        bg.setStrokeStyle(2, 0x6c5ce7);
        label.setColor('#ffffff');
        container.setScale(1.0);
      });

      bg.on('pointerdown', () => {
        container.setScale(0.97);
        onClick();
      });
    }

    return container;
  }

  private showCreditsModal(): void {
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;
    const modal = this.add.container(W / 2, H / 2);
    modal.setDepth(100);

    const backdrop = this.add.rectangle(0, 0, W, H, 0x000000, 0.7);
    backdrop.setInteractive();

    const panelW = IS_PORTRAIT ? Math.min(460, W - 40) : 520;
    const panelH = IS_PORTRAIT ? 300 : 320;

    const panel = this.add.rectangle(0, 0, panelW, panelH, 0x131124, 0.96);
    panel.setStrokeStyle(2, 0x6c5ce7);

    const creditTitle = this.add.text(0, -panelH / 2 + 30, 'CREDITS', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '22px' : '26px',
      fontStyle: 'bold',
      color: '#ffd32a',
    });
    creditTitle.setOrigin(0.5);

    const desc = this.add.text(
      0,
      0,
      'Echoes of the Forgotten Realm\n\nDeveloped with Phaser 4 & TypeScript\nGame Design & Audio Synthesis: AI Pair Programmer\nEngine: Phaser Arcade Physics & Web Audio API\nDedicated to Classic 2D Indie Action RPGs',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: IS_PORTRAIT ? '13px' : '16px',
        color: '#dcdde1',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: panelW - 50 },
      }
    );
    desc.setOrigin(0.5);

    const closeBtn = this.add.text(0, panelH / 2 - 30, '[ CLOSE ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '15px' : '17px',
      fontStyle: 'bold',
      color: '#00cec9',
    });
    closeBtn.setOrigin(0.5);
    closeBtn.setInteractive({ useHandCursor: true });

    const closeAction = () => {
      this.audio.playUiClick();
      modal.destroy();
    };

    closeBtn.on('pointerdown', closeAction);
    backdrop.on('pointerdown', closeAction);

    modal.add([backdrop, panel, creditTitle, desc, closeBtn]);
  }
}
