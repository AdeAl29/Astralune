import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

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

    // Rich cosmic fantasy gradient background
    const bgGfx = this.add.graphics();
    bgGfx.fillGradientStyle(0x0f0c1b, 0x0f0c1b, 0x1f1738, 0x2c1f4d, 1);
    bgGfx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Floating astral particles
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
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

    // Glowing Title Banner
    const titleGlow = this.add.text(GAME_WIDTH / 2, 170, 'ECHOES OF THE\nFORGOTTEN REALM', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#6c5ce7',
      align: 'center',
    });
    titleGlow.setOrigin(0.5);
    titleGlow.setAlpha(0.35);

    const title = this.add.text(GAME_WIDTH / 2, 168, 'ECHOES OF THE\nFORGOTTEN REALM', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '44px',
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#1e1b2e',
      strokeThickness: 6,
      align: 'center',
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, 250, '— 2D Action RPG Adventure —', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
      color: '#00cec9',
      letterSpacing: 3,
    });
    subtitle.setOrigin(0.5);

    // Menu Buttons
    const startY = 340;
    const spacing = 64;
    const hasSave = this.saveSystem.hasSave();

    this.createMenuButton(GAME_WIDTH / 2, startY, 'NEW GAME', () => {
      this.audio.playUiClick();
      this.scene.start('IntroScene');
    });

    this.createMenuButton(
      GAME_WIDTH / 2,
      startY + spacing,
      'CONTINUE',
      () => {
        if (!hasSave) return;
        this.audio.playUiClick();
        const save = this.saveSystem.loadGame();
        this.scene.start('GameScene', { loadFromSave: save });
      },
      !hasSave
    );

    this.createMenuButton(GAME_WIDTH / 2, startY + spacing * 2, 'SETTINGS', () => {
      this.audio.playUiClick();
      this.scene.launch('SettingsScene', { returnTo: 'MainMenuScene' });
    });

    this.createMenuButton(GAME_WIDTH / 2, startY + spacing * 3, 'CREDITS', () => {
      this.audio.playUiClick();
      this.showCreditsModal();
    });

    // Version Tag
    const ver = this.add.text(GAME_WIDTH - 20, GAME_HEIGHT - 20, 'v1.0.0 — Production Build', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#718093',
    });
    ver.setOrigin(1, 1);
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    onClick: () => void,
    isDisabled: boolean = false
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const width = 260;
    const height = 48;

    const bg = this.add.rectangle(0, 0, width, height, isDisabled ? 0x1a1a26 : 0x1e1938, isDisabled ? 0.4 : 0.85);
    bg.setStrokeStyle(2, isDisabled ? 0x3d3555 : 0x6c5ce7);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '18px',
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
    const modal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    modal.setDepth(100);

    const backdrop = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    backdrop.setInteractive();

    const panel = this.add.rectangle(0, 0, 520, 320, 0x131124, 0.96);
    panel.setStrokeStyle(2, 0x6c5ce7);

    const title = this.add.text(0, -110, 'CREDITS', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffd32a',
    });
    title.setOrigin(0.5);

    const desc = this.add.text(
      0,
      -10,
      'Echoes of the Forgotten Realm\n\nDeveloped with Phaser 4 & TypeScript\nGame Design & Audio Synthesis: AI Pair Programmer\nEngine: Phaser Arcade Physics & Web Audio API\nDedicated to Classic 2D Indie Action RPGs',
      {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '16px',
        color: '#dcdde1',
        align: 'center',
        lineSpacing: 6,
      }
    );
    desc.setOrigin(0.5);

    const closeBtn = this.add.text(0, 110, '[ CLOSE ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '17px',
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

    modal.add([backdrop, panel, title, desc, closeBtn]);
  }
}
