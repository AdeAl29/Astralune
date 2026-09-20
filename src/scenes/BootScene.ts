import * as Phaser from 'phaser';
import { AssetGenerator } from '../utils/AssetGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    // Preload anime character portraits
    this.load.image('portrait_mira', 'assets/portrait_mira.jpg');
    this.load.image('portrait_rowan', 'assets/portrait_rowan.jpg');
    this.load.image('portrait_elder', 'assets/portrait_elder.jpg');
  }

  public create(): void {
    // Generate all procedural game textures into TextureManager
    const generator = new AssetGenerator(this);
    generator.generateAll();

    // Proceed to MainMenuScene
    this.scene.start('MainMenuScene');
  }
}
