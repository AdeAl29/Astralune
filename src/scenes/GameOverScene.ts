import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH, IS_PORTRAIT } from '../utils/constants';

export class GameOverScene extends Phaser.Scene {
  private audio: AudioSystem;
  private saveSystem: SaveSystem;
  private returnMapId: string = 'whispering_meadow';

  constructor() {
    super('GameOverScene');
    this.audio = AudioSystem.getInstance();
    this.saveSystem = SaveSystem.getInstance();
  }

  public init(data: { mapId?: string }): void {
    if (data && data.mapId) {
      this.returnMapId = data.mapId;
    }
  }

  public create(): void {
    const W = GAME_WIDTH;
    const H = GAME_HEIGHT;

    const backdrop = this.add.rectangle(W / 2, H / 2, W, H, 0x0a050d, 0.85);
    backdrop.setInteractive();

    const title = this.add.text(W / 2, H / 2 - (IS_PORTRAIT ? 160 : 130), 'YOU HAVE FALLEN', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: IS_PORTRAIT ? '30px' : '38px',
      fontStyle: 'bold',
      color: '#ff4757',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const sub = this.add.text(W / 2, H / 2 - (IS_PORTRAIT ? 110 : 70), 'The forgotten realm claimed your vitality...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '13px' : '16px',
      color: '#a4b0be',
      wordWrap: { width: W - 60 },
      align: 'center',
    }).setOrigin(0.5);

    const startY = H / 2;
    const spacing = IS_PORTRAIT ? 52 : 58;
    const btnW = IS_PORTRAIT ? Math.min(240, W - 60) : 240;

    this.createBtn(W / 2, startY, 'RETRY', btnW, () => {
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene', { mapId: this.returnMapId, respawn: true });
    });

    const hasSave = this.saveSystem.hasSave();
    this.createBtn(
      W / 2,
      startY + spacing,
      'LOAD SAVE',
      btnW,
      () => {
        if (!hasSave) return;
        const save = this.saveSystem.loadGame();
        this.scene.stop('GameOverScene');
        this.scene.start('GameScene', { loadFromSave: save });
      },
      !hasSave
    );

    this.createBtn(W / 2, startY + spacing * 2, 'MAIN MENU', btnW, () => {
      this.scene.stop('GameOverScene');
      this.scene.stop('UIScene');
      this.scene.stop('GameScene');
      this.scene.start('MainMenuScene');
    });
  }

  private createBtn(
    x: number,
    y: number,
    text: string,
    width: number,
    onClick: () => void,
    isDisabled: boolean = false
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const height = IS_PORTRAIT ? 40 : 44;
    const bg = this.add.rectangle(0, 0, width, height, isDisabled ? 0x1e1e24 : 0x221326, 0.9);
    bg.setStrokeStyle(1.5, isDisabled ? 0x3d3544 : 0xff4757);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: IS_PORTRAIT ? '14px' : '16px',
      fontStyle: 'bold',
      color: isDisabled ? '#57606f' : '#ffffff',
    }).setOrigin(0.5);

    c.add([bg, label]);

    if (!isDisabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => {
        this.audio.playUiClick();
        onClick();
      });
      bg.on('pointerover', () => {
        bg.setFillStyle(0x781f2f);
        c.setScale(1.03);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x221326);
        c.setScale(1.0);
      });
    }

    return c;
  }
}
