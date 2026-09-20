import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GameSettings } from '../types/game';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
import { GameScene } from './GameScene';
import { UIScene } from './UIScene';

export class SettingsScene extends Phaser.Scene {
  private audio: AudioSystem;
  private saveSystem: SaveSystem;
  private currentSettings: GameSettings;
  private returnToScene: string = 'MainMenuScene';

  constructor() {
    super('SettingsScene');
    this.audio = AudioSystem.getInstance();
    this.saveSystem = SaveSystem.getInstance();
    this.currentSettings = this.saveSystem.loadSettings();
  }

  public init(data: { returnTo?: string }): void {
    if (data && data.returnTo) {
      this.returnToScene = data.returnTo;
    }
    this.currentSettings = this.saveSystem.loadSettings();
  }

  public create(): void {
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
    backdrop.setInteractive();

    const panel = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 520, 0x120f26, 0.96);
    panel.setStrokeStyle(2.5, 0x6c5ce7);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 220, 'SETTINGS', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const startY = GAME_HEIGHT / 2 - 140;
    const spacing = 58;

    // 1. Master Volume
    this.createSliderRow(GAME_WIDTH / 2, startY, 'Master Volume', this.currentSettings.masterVolume, (val) => {
      this.currentSettings.masterVolume = val;
      this.applyAndSave();
    });

    // 2. Music Volume
    this.createSliderRow(GAME_WIDTH / 2, startY + spacing, 'Music Volume', this.currentSettings.musicVolume, (val) => {
      this.currentSettings.musicVolume = val;
      this.applyAndSave();
    });

    // 3. SFX Volume
    this.createSliderRow(GAME_WIDTH / 2, startY + spacing * 2, 'SFX Volume', this.currentSettings.sfxVolume, (val) => {
      this.currentSettings.sfxVolume = val;
      this.applyAndSave();
    });

    // 4. Screen Shake Toggle
    this.createToggleRow(GAME_WIDTH / 2, startY + spacing * 3, 'Screen Shake', this.currentSettings.screenShake, (val) => {
      this.currentSettings.screenShake = val;
      this.applyAndSave();
    });

    // 5. Show Damage Numbers
    this.createToggleRow(GAME_WIDTH / 2, startY + spacing * 4, 'Damage Numbers', this.currentSettings.showDamageNumbers, (val) => {
      this.currentSettings.showDamageNumbers = val;
      this.applyAndSave();
    });

    // 6. Virtual Controls
    this.createToggleRow(GAME_WIDTH / 2, startY + spacing * 5, 'Virtual Controls (Mobile)', this.currentSettings.virtualControls, (val) => {
      this.currentSettings.virtualControls = val;
      this.applyAndSave();
    });

    // Close / Back button
    const backBtn = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 220, '[ CLOSE & RETURN ]', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#00cec9',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const closeAction = () => {
      this.audio.playUiClick();
      this.scene.stop('SettingsScene');
    };

    backBtn.on('pointerdown', closeAction);
    this.input.keyboard?.on('keydown-ESC', closeAction);
  }

  private applyAndSave(): void {
    this.saveSystem.saveSettings(this.currentSettings);
    this.audio.updateSettings(this.currentSettings);

    // If game scene is running, update live settings
    const gameScene = this.scene.get('GameScene') as GameScene;
    if (gameScene && gameScene.scene.isActive()) {
      gameScene.updateSettings(this.currentSettings);
    }
    const uiScene = this.scene.get('UIScene') as UIScene;
    if (uiScene && uiScene.scene.isActive()) {
      uiScene.setVirtualControlsVisible(this.currentSettings.virtualControls);
    }
  }

  private createSliderRow(
    x: number,
    y: number,
    label: string,
    initialVal: number,
    onChange: (val: number) => void
  ): void {
    this.add.text(x - 220, y, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    const barW = 140;
    const barH = 10;
    const barX = x + 70;

    const bgBar = this.add.rectangle(barX, y, barW, barH, 0x2d3436).setInteractive({ useHandCursor: true });
    const fillBar = this.add.rectangle(barX - barW / 2, y, barW * initialVal, barH, 0x00cec9).setOrigin(0, 0.5);

    const valText = this.add.text(barX + barW / 2 + 30, y, `${Math.round(initialVal * 100)}%`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#ffd32a',
    }).setOrigin(0.5);

    const updateSlider = (pointerX: number) => {
      const localX = Phaser.Math.Clamp(pointerX - (barX - barW / 2), 0, barW);
      const ratio = localX / barW;
      fillBar.setSize(localX, barH);
      valText.setText(`${Math.round(ratio * 100)}%`);
      onChange(ratio);
    };

    bgBar.on('pointerdown', (pointer: Phaser.Input.Pointer) => updateSlider(pointer.x));
  }

  private createToggleRow(
    x: number,
    y: number,
    label: string,
    initialVal: boolean,
    onToggle: (val: boolean) => void
  ): void {
    this.add.text(x - 220, y, label, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    let isEnabled = initialVal;
    const btnW = 90;
    const btnH = 30;
    const btnX = x + 110;

    const btnBg = this.add.rectangle(btnX, y, btnW, btnH, isEnabled ? 0x20bf6b : 0x4b4b4b).setInteractive({ useHandCursor: true });
    btnBg.setStrokeStyle(1.5, isEnabled ? 0x2ed573 : 0x718093);

    const btnText = this.add.text(btnX, y, isEnabled ? 'ON' : 'OFF', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    btnBg.on('pointerdown', () => {
      this.audio.playUiClick();
      isEnabled = !isEnabled;
      btnBg.setFillStyle(isEnabled ? 0x20bf6b : 0x4b4b4b);
      btnBg.setStrokeStyle(1.5, isEnabled ? 0x2ed573 : 0x718093);
      btnText.setText(isEnabled ? 'ON' : 'OFF');
      onToggle(isEnabled);
    });
  }
}
