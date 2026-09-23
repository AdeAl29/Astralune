import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { DialogueLine } from '../types/game';
import { GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class DialogBox extends Phaser.GameObjects.Container {
  private panelBg: Phaser.GameObjects.Rectangle;
  private portraitBorderGlow: Phaser.GameObjects.Rectangle;
  private portraitBorder: Phaser.GameObjects.Rectangle;
  private portraitImg: Phaser.GameObjects.Sprite;
  private nameBadge: Phaser.GameObjects.Rectangle;
  private speakerText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;

  private currentLines: DialogueLine[] = [];
  private currentLineIndex: number = 0;
  private isTyping: boolean = false;
  private typeTimer: Phaser.Time.TimerEvent | null = null;
  private fullText: string = '';
  private displayedLength: number = 0;

  private onFinishCallback?: (lastLine?: DialogueLine) => void;
  private audio: AudioSystem;

  // Layout dimensions
  private boxWidth: number;
  private boxHeight: number;
  private portraitSize: number;
  private portraitX: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.audio = AudioSystem.getInstance();

    // Responsive dimensions
    this.boxWidth = IS_PORTRAIT ? Math.min(680, GAME_WIDTH - 30) : 880;
    this.boxHeight = IS_PORTRAIT ? 140 : 160;
    this.portraitSize = IS_PORTRAIT ? 90 : 114;
    this.portraitX = -this.boxWidth / 2 + (IS_PORTRAIT ? 60 : 82);

    const width = this.boxWidth;
    const height = this.boxHeight;
    const textStartX = -width / 2 + (IS_PORTRAIT ? 130 : 160);

    // Outer Glow / Border Panel
    this.panelBg = scene.add.rectangle(0, 0, width, height, 0x100d22, 0.94);
    this.panelBg.setStrokeStyle(2.5, 0x6c5ce7);
    this.panelBg.setInteractive();

    // Portrait Frame Background & Glow
    this.portraitBorderGlow = scene.add.rectangle(this.portraitX, 0, this.portraitSize + 6, this.portraitSize + 6);
    this.portraitBorderGlow.setStrokeStyle(1.5, 0xa29bfe, 0.6);

    this.portraitBorder = scene.add.rectangle(this.portraitX, 0, this.portraitSize, this.portraitSize, 0x191238, 0.95);
    this.portraitBorder.setStrokeStyle(2.5, 0xffd32a);

    // Portrait Sprite
    this.portraitImg = scene.add.sprite(this.portraitX, 0, 'portrait_mira');
    this.portraitImg.setDisplaySize(this.portraitSize - 6, this.portraitSize - 6);

    // Speaker Name Plate / Badge
    const badgeX = textStartX + (IS_PORTRAIT ? 50 : 65);
    this.nameBadge = scene.add.rectangle(badgeX, -height / 2 + 22, 140, 24, 0x221345, 0.9);
    this.nameBadge.setStrokeStyle(1.5, 0xffd32a, 0.9);

    // Speaker Name Tag
    this.speakerText = scene.add.text(textStartX + 10, -height / 2 + 12, 'Mira', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '15px' : '18px',
      fontStyle: 'bold',
      color: '#ffd32a',
      stroke: '#000000',
      strokeThickness: 2,
    });

    // Content Dialogue Text
    this.contentText = scene.add.text(textStartX, -height / 2 + 42, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '14px' : '17px',
      color: '#f5f6fa',
      wordWrap: { width: width - (IS_PORTRAIT ? 160 : 200), useAdvancedWrap: true },
      lineSpacing: 4,
    });

    // Advance Prompt
    const promptLabel = IS_PORTRAIT ? '▼ Tap to Continue' : '▼ [SPACE] / Click to Continue';
    this.promptText = scene.add.text(width / 2 - 15, height / 2 - 16, promptLabel, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '11px' : '13px',
      fontStyle: 'bold',
      color: '#00cec9',
    });
    this.promptText.setOrigin(1, 1);

    // Prompt Pulse
    scene.tweens.add({
      targets: this.promptText,
      alpha: 0.3,
      yoyo: true,
      repeat: -1,
      duration: 500,
    });

    this.add([
      this.panelBg,
      this.portraitBorderGlow,
      this.portraitBorder,
      this.portraitImg,
      this.nameBadge,
      this.speakerText,
      this.contentText,
      this.promptText,
    ]);
    this.setDepth(200);
    this.setVisible(false);

    // Click to advance
    this.panelBg.on('pointerdown', () => {
      this.advance();
    });

    scene.add.existing(this);
  }

  public show(lines: DialogueLine[], onFinish?: (lastLine?: DialogueLine) => void): void {
    if (!lines || lines.length === 0) return;

    this.currentLines = lines;
    this.currentLineIndex = 0;
    this.onFinishCallback = onFinish;
    this.setVisible(true);

    this.displayCurrentLine();
  }

  private displayCurrentLine(): void {
    const line = this.currentLines[this.currentLineIndex];
    if (!line) {
      this.close();
      return;
    }

    this.speakerText.setText(line.speaker);
    const speakerWidth = Math.max(100, this.speakerText.width + 26);
    this.nameBadge.setSize(speakerWidth, 24);
    const textStartX = -this.boxWidth / 2 + (IS_PORTRAIT ? 130 : 160);
    this.nameBadge.setPosition(textStartX + speakerWidth / 2, -this.boxHeight / 2 + 22);

    if (line.portraitKey && this.scene.textures.exists(line.portraitKey)) {
      this.portraitImg.setTexture(line.portraitKey);
      this.portraitImg.setDisplaySize(this.portraitSize - 6, this.portraitSize - 6);
      this.portraitImg.setVisible(true);
      this.portraitBorder.setVisible(true);
      this.portraitBorderGlow.setVisible(true);

      // Speaking pop/bounce animation
      const baseScaleX = this.portraitImg.scaleX;
      const baseScaleY = this.portraitImg.scaleY;
      this.scene.tweens.add({
        targets: this.portraitImg,
        scaleX: baseScaleX * 1.05,
        scaleY: baseScaleY * 1.05,
        duration: 120,
        yoyo: true,
        ease: 'Quad.easeInOut',
      });
    } else {
      this.portraitImg.setVisible(false);
      this.portraitBorder.setVisible(false);
      this.portraitBorderGlow.setVisible(false);
    }

    this.fullText = line.text;
    this.displayedLength = 0;
    this.contentText.setText('');
    this.isTyping = true;

    if (this.typeTimer) {
      this.typeTimer.remove();
    }

    // Typewriter effect
    this.typeTimer = this.scene.time.addEvent({
      delay: 24,
      repeat: this.fullText.length - 1,
      callback: () => {
        this.displayedLength++;
        this.contentText.setText(this.fullText.slice(0, this.displayedLength));

        if (this.displayedLength % 3 === 0) {
          this.audio.playDialogueBlip();
        }

        if (this.displayedLength >= this.fullText.length) {
          this.isTyping = false;
        }
      },
    });
  }

  public advance(): void {
    if (!this.visible) return;

    if (this.isTyping) {
      // Instant skip typing
      if (this.typeTimer) this.typeTimer.remove();
      this.contentText.setText(this.fullText);
      this.isTyping = false;
      return;
    }

    const currentLine = this.currentLines[this.currentLineIndex];
    this.currentLineIndex++;

    if (this.currentLineIndex < this.currentLines.length) {
      this.displayCurrentLine();
    } else {
      this.close(currentLine);
    }
  }

  public close(lastLine?: DialogueLine): void {
    if (this.typeTimer) {
      this.typeTimer.remove();
      this.typeTimer = null;
    }
    this.setVisible(false);
    if (this.onFinishCallback) {
      this.onFinishCallback(lastLine);
      this.onFinishCallback = undefined;
    }
  }

  public isOpen(): boolean {
    return this.visible;
  }
}
