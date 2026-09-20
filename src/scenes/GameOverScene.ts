import * as Phaser from 'phaser';
import { AudioSystem } from '../systems/AudioSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';

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
    const backdrop = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a050d, 0.85);
    backdrop.setInteractive();

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 130, 'YOU HAVE FALLEN', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#ff4757',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const sub = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 70, 'The forgotten realm claimed your vitality...', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      color: '#a4b0be',
    }).setOrigin(0.5);

    const startY = GAME_HEIGHT / 2;
    const spacing = 58;

    this.createBtn(GAME_WIDTH / 2, startY, 'RETRY', () => {
      this.scene.stop('GameOverScene');
      this.scene.start('GameScene', { mapId: this.returnMapId, respawn: true });
    });

    const hasSave = this.saveSystem.hasSave();
    this.createBtn(
      GAME_WIDTH / 2,
      startY + spacing,
      'LOAD SAVE',
      () => {
        if (!hasSave) return;
        const save = this.saveSystem.loadGame();
        this.scene.stop('GameOverScene');
        this.scene.start('GameScene', { loadFromSave: save });
      },
      !hasSave
    );

    this.createBtn(GAME_WIDTH / 2, startY + spacing * 2, 'MAIN MENU', () => {
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
    onClick: () => void,
    isDisabled: boolean = false
  ): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 240, 44, isDisabled ? 0x1e1e24 : 0x221326, 0.9);
    bg.setStrokeStyle(1.5, isDisabled ? 0x3d3544 : 0xff4757);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
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
