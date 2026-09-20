import * as Phaser from 'phaser';

/**
 * Procedural Asset Generator
 * Generates stylized anime-inspired sprites, tiles, portraits, icons, and effects
 * directly onto HTML5 canvases and registers them into Phaser's TextureManager.
 */
export class AssetGenerator {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public generateAll(): void {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateNPCSprites();
    this.generatePortraits();
    this.generateEnvironmentProps();
    this.generateItemIcons();
    this.generateCombatEffects();
    this.generateUIElements();
  }

  private createCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  private addTexture(key: string, canvas: HTMLCanvasElement): void {
    if (this.scene.textures.exists(key)) {
      this.scene.textures.remove(key);
    }
    this.scene.textures.addCanvas(key, canvas);
  }

  // ==========================================
  // PLAYER SPRITES (Aster)
  // ==========================================
  private generatePlayerSprites(): void {
    const directions: ('down' | 'up' | 'left' | 'right')[] = ['down', 'up', 'left', 'right'];

    for (const dir of directions) {
      // Idle frame
      const { canvas: idleCanvas, ctx: idleCtx } = this.createCanvas(48, 56);
      this.drawPlayerFrame(idleCtx, dir, 0, false);
      this.addTexture(`player_${dir}`, idleCanvas);

      // Walk frame 1
      const { canvas: walk1Canvas, ctx: walk1Ctx } = this.createCanvas(48, 56);
      this.drawPlayerFrame(walk1Ctx, dir, -1, false);
      this.addTexture(`player_walk_${dir}_1`, walk1Canvas);

      // Walk frame 2
      const { canvas: walk2Canvas, ctx: walk2Ctx } = this.createCanvas(48, 56);
      this.drawPlayerFrame(walk2Ctx, dir, 1, false);
      this.addTexture(`player_walk_${dir}_2`, walk2Canvas);

      // Attack frame
      const { canvas: atkCanvas, ctx: atkCtx } = this.createCanvas(64, 64);
      this.drawPlayerAttackFrame(atkCtx, dir);
      this.addTexture(`player_attack_${dir}`, atkCanvas);
    }
  }

  private drawPlayerFrame(ctx: CanvasRenderingContext2D, dir: string, walkOffset: number, _isAttacking: boolean): void {
    ctx.save();
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.ellipse(24, 52, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legBob = Math.abs(walkOffset) * 2;
    const yOffset = legBob;

    // Legs / Boots
    ctx.fillStyle = '#2c2d3a';
    if (walkOffset <= 0) {
      ctx.fillRect(18, 40 - yOffset, 5, 12 + yOffset);
    } else {
      ctx.fillRect(18, 42, 5, 10);
    }
    if (walkOffset >= 0) {
      ctx.fillRect(25, 40 - yOffset, 5, 12 + yOffset);
    } else {
      ctx.fillRect(25, 42, 5, 10);
    }

    // Body / Tunic (Indigo blue with gold trim)
    ctx.fillStyle = '#3a4f7c';
    ctx.fillRect(16, 26, 16, 16);
    ctx.fillStyle = '#f1c40f'; // Gold belt / trim
    ctx.fillRect(16, 38, 16, 3);
    ctx.fillRect(22, 26, 4, 12);

    // Arms
    ctx.fillStyle = '#4b6584';
    if (dir === 'left') {
      ctx.fillRect(14, 28, 4, 10);
    } else if (dir === 'right') {
      ctx.fillRect(30, 28, 4, 10);
    } else {
      ctx.fillRect(13, 28, 4, 10);
      ctx.fillRect(31, 28, 4, 10);
    }

    // Scarf / Capelet (Crimson anime scarf)
    ctx.fillStyle = '#eb3b5a';
    ctx.fillRect(15, 23, 18, 5);
    if (dir === 'left') {
      ctx.fillRect(28, 25, 6, 8);
    } else if (dir === 'right') {
      ctx.fillRect(14, 25, 6, 8);
    } else {
      ctx.fillRect(28, 25, 5, 8);
    }

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Anime peach skin
    ctx.fillRect(17, 12, 14, 12);

    // Eyes
    if (dir === 'down') {
      ctx.fillStyle = '#22a6b3'; // Bright teal eyes
      ctx.fillRect(19, 16, 3, 4);
      ctx.fillRect(26, 16, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(19, 16, 1, 1);
      ctx.fillRect(26, 16, 1, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#22a6b3';
      ctx.fillRect(18, 16, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(18, 16, 1, 1);
    } else if (dir === 'right') {
      ctx.fillStyle = '#22a6b3';
      ctx.fillRect(27, 16, 3, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(27, 16, 1, 1);
    }

    // Hair (Anime silver-cyan spiky locks)
    ctx.fillStyle = '#dff9fb';
    ctx.fillRect(16, 8, 16, 6);
    ctx.fillStyle = '#c7ecee';
    // Bangs and spikes
    if (dir === 'down') {
      ctx.beginPath();
      ctx.moveTo(15, 12);
      ctx.lineTo(19, 16);
      ctx.lineTo(22, 12);
      ctx.lineTo(25, 17);
      ctx.lineTo(29, 12);
      ctx.lineTo(33, 14);
      ctx.lineTo(32, 7);
      ctx.lineTo(16, 7);
      ctx.fill();
    } else if (dir === 'up') {
      ctx.fillRect(15, 9, 18, 14); // Back of hair
    } else if (dir === 'left') {
      ctx.fillRect(18, 9, 14, 10);
      ctx.beginPath();
      ctx.moveTo(15, 14);
      ctx.lineTo(20, 17);
      ctx.lineTo(22, 10);
      ctx.fill();
    } else if (dir === 'right') {
      ctx.fillRect(16, 9, 14, 10);
      ctx.beginPath();
      ctx.moveTo(33, 14);
      ctx.lineTo(28, 17);
      ctx.lineTo(26, 10);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawPlayerAttackFrame(ctx: CanvasRenderingContext2D, dir: string): void {
    ctx.save();
    // Shift slightly to center in 64x64
    ctx.translate(8, 4);
    this.drawPlayerFrame(ctx, dir, 0, true);

    // Draw weapon slash trail
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(0, 210, 211, 0.4)';
    ctx.beginPath();

    if (dir === 'right') {
      ctx.arc(32, 28, 22, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(34, 26, 14, 4); // Sword blade
    } else if (dir === 'left') {
      ctx.arc(16, 28, 22, Math.PI * 0.6, Math.PI * 1.4);
      ctx.stroke();
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(0, 26, 14, 4);
    } else if (dir === 'down') {
      ctx.arc(24, 40, 22, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(22, 40, 4, 14);
    } else if (dir === 'up') {
      ctx.arc(24, 16, 22, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = '#dfe4ea';
      ctx.fillRect(22, -2, 4, 14);
    }

    ctx.restore();
  }

  // ==========================================
  // ENEMIES
  // ==========================================
  private generateEnemySprites(): void {
    // 1. Meadow Slime
    const { canvas: slimeCanvas, ctx: slimeCtx } = this.createCanvas(44, 40);
    // Shadow
    slimeCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    slimeCtx.beginPath();
    slimeCtx.ellipse(22, 34, 16, 5, 0, 0, Math.PI * 2);
    slimeCtx.fill();

    // Body Gradient
    const slimeGrad = slimeCtx.createRadialGradient(18, 16, 4, 22, 24, 20);
    slimeGrad.addColorStop(0, '#55efc4');
    slimeGrad.addColorStop(0.7, '#00b894');
    slimeGrad.addColorStop(1, '#009470');

    slimeCtx.fillStyle = slimeGrad;
    slimeCtx.beginPath();
    slimeCtx.moveTo(6, 32);
    slimeCtx.bezierCurveTo(4, 14, 14, 8, 22, 8);
    slimeCtx.bezierCurveTo(30, 8, 40, 14, 38, 32);
    slimeCtx.bezierCurveTo(32, 36, 12, 36, 6, 32);
    slimeCtx.fill();

    // Specular Highlight
    slimeCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    slimeCtx.beginPath();
    slimeCtx.ellipse(16, 15, 5, 3, -Math.PI / 4, 0, Math.PI * 2);
    slimeCtx.fill();

    // Cute Angry Eyes
    slimeCtx.fillStyle = '#0f271d';
    slimeCtx.fillRect(14, 20, 4, 6);
    slimeCtx.fillRect(26, 20, 4, 6);
    slimeCtx.fillStyle = '#ffffff';
    slimeCtx.fillRect(14, 20, 2, 2);
    slimeCtx.fillRect(26, 20, 2, 2);

    this.addTexture('enemy_slime', slimeCanvas);

    // 2. Shadow Wolf
    const { canvas: wolfCanvas, ctx: wolfCtx } = this.createCanvas(56, 48);
    wolfCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    wolfCtx.beginPath();
    wolfCtx.ellipse(28, 42, 20, 6, 0, 0, Math.PI * 2);
    wolfCtx.fill();

    // Wolf body
    wolfCtx.fillStyle = '#2d1c4d';
    wolfCtx.beginPath();
    wolfCtx.ellipse(28, 26, 20, 13, 0, 0, Math.PI * 2);
    wolfCtx.fill();

    // Head
    wolfCtx.beginPath();
    wolfCtx.arc(16, 20, 11, 0, Math.PI * 2);
    wolfCtx.fill();

    // Snout
    wolfCtx.beginPath();
    wolfCtx.moveTo(12, 22);
    wolfCtx.lineTo(4, 24);
    wolfCtx.lineTo(12, 27);
    wolfCtx.fill();

    // Pointy Ears
    wolfCtx.beginPath();
    wolfCtx.moveTo(14, 12);
    wolfCtx.lineTo(18, 4);
    wolfCtx.lineTo(21, 13);
    wolfCtx.fill();

    // Fluffy Tail
    wolfCtx.fillStyle = '#442377';
    wolfCtx.beginPath();
    wolfCtx.moveTo(44, 26);
    wolfCtx.quadraticCurveTo(56, 16, 52, 34);
    wolfCtx.lineTo(44, 30);
    wolfCtx.fill();

    // Legs
    wolfCtx.fillStyle = '#1c1032';
    wolfCtx.fillRect(16, 32, 5, 12);
    wolfCtx.fillRect(24, 32, 5, 12);
    wolfCtx.fillRect(33, 32, 5, 12);
    wolfCtx.fillRect(40, 32, 5, 12);

    // Glowing Violet Eyes & Marks
    wolfCtx.fillStyle = '#e056fd';
    wolfCtx.fillRect(12, 17, 4, 3);
    wolfCtx.shadowColor = '#be2edd';
    wolfCtx.shadowBlur = 6;
    wolfCtx.fillStyle = '#f0932b';
    wolfCtx.fillRect(8, 25, 2, 2); // Glowing fang tip
    wolfCtx.shadowBlur = 0;

    this.addTexture('enemy_shadow_wolf', wolfCanvas);

    // 3. Ancient Guardian (Boss)
    const { canvas: bossCanvas, ctx: bossCtx } = this.createCanvas(96, 104);
    // Dark ominous shadow
    bossCtx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    bossCtx.beginPath();
    bossCtx.ellipse(48, 92, 36, 12, 0, 0, Math.PI * 2);
    bossCtx.fill();

    // Stone Colossus Body
    bossCtx.fillStyle = '#3c4055';
    bossCtx.fillRect(32, 42, 32, 38);

    // Runic Chest Plate
    bossCtx.fillStyle = '#4a506b';
    bossCtx.fillRect(36, 46, 24, 28);

    // Glowing Arcane Core
    const coreGrad = bossCtx.createRadialGradient(48, 58, 2, 48, 58, 12);
    coreGrad.addColorStop(0, '#00d2d3');
    coreGrad.addColorStop(0.5, '#0984e3');
    coreGrad.addColorStop(1, 'transparent');
    bossCtx.fillStyle = coreGrad;
    bossCtx.beginPath();
    bossCtx.arc(48, 58, 12, 0, Math.PI * 2);
    bossCtx.fill();

    // Runic symbols on chest
    bossCtx.strokeStyle = '#54a0ff';
    bossCtx.lineWidth = 2;
    bossCtx.beginPath();
    bossCtx.moveTo(48, 50);
    bossCtx.lineTo(48, 66);
    bossCtx.moveTo(40, 58);
    bossCtx.lineTo(56, 58);
    bossCtx.stroke();

    // Massive Stone Shoulders
    bossCtx.fillStyle = '#2e3346';
    bossCtx.fillRect(16, 36, 20, 20);
    bossCtx.fillRect(60, 36, 20, 20);
    // Gold trims
    bossCtx.fillStyle = '#e1b12c';
    bossCtx.fillRect(16, 34, 20, 4);
    bossCtx.fillRect(60, 34, 20, 4);

    // Floating Stone Hands
    bossCtx.fillStyle = '#3c4055';
    bossCtx.fillRect(12, 60, 16, 20);
    bossCtx.fillRect(68, 60, 16, 20);
    bossCtx.fillStyle = '#00d2d3';
    bossCtx.fillRect(16, 68, 8, 4);
    bossCtx.fillRect(72, 68, 8, 4);

    // Stone Legs
    bossCtx.fillStyle = '#222533';
    bossCtx.fillRect(34, 76, 11, 20);
    bossCtx.fillRect(51, 76, 11, 20);

    // Head / Helm
    bossCtx.fillStyle = '#4b526d';
    bossCtx.fillRect(36, 16, 24, 24);
    // Horned Crest
    bossCtx.fillStyle = '#e1b12c';
    bossCtx.beginPath();
    bossCtx.moveTo(34, 20);
    bossCtx.lineTo(26, 6);
    bossCtx.lineTo(38, 16);
    bossCtx.moveTo(62, 20);
    bossCtx.lineTo(70, 6);
    bossCtx.lineTo(58, 16);
    bossCtx.fill();

    // Visor / Monocular Arcane Eye
    bossCtx.fillStyle = '#10121a';
    bossCtx.fillRect(40, 24, 16, 8);
    bossCtx.fillStyle = '#ff3838'; // Glowing red/crimson boss eye
    bossCtx.beginPath();
    bossCtx.arc(48, 28, 4, 0, Math.PI * 2);
    bossCtx.fill();

    this.addTexture('enemy_ancient_guardian', bossCanvas);
  }

  // ==========================================
  // NPCS
  // ==========================================
  private generateNPCSprites(): void {
    // 1. Mira (Village Guide / Celestial Maiden)
    const { canvas: miraCanvas, ctx: miraCtx } = this.createCanvas(48, 56);
    
    // Ground Shadow
    miraCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    miraCtx.beginPath();
    miraCtx.ellipse(24, 52, 13, 5, 0, 0, Math.PI * 2);
    miraCtx.fill();

    // Shoes
    miraCtx.fillStyle = '#2c1e4a';
    miraCtx.fillRect(19, 48, 4, 3);
    miraCtx.fillRect(25, 48, 4, 3);

    // Dress / Robe (White fantasy gown with violet trim)
    miraCtx.fillStyle = '#f5f6fa';
    miraCtx.beginPath();
    miraCtx.moveTo(18, 27);
    miraCtx.lineTo(30, 27);
    miraCtx.lineTo(34, 48);
    miraCtx.lineTo(14, 48);
    miraCtx.fill();

    // Dress folds and violet lower trim
    miraCtx.fillStyle = '#dcdde1';
    miraCtx.fillRect(22, 33, 4, 15);
    miraCtx.fillStyle = '#7158e2';
    miraCtx.fillRect(14, 46, 20, 2);

    // Dark celestial cloak / mantle draped over shoulders
    miraCtx.fillStyle = '#1c132b';
    miraCtx.beginPath();
    miraCtx.moveTo(16, 26);
    miraCtx.lineTo(32, 26);
    miraCtx.lineTo(35, 40);
    miraCtx.lineTo(31, 41);
    miraCtx.lineTo(24, 32);
    miraCtx.lineTo(17, 41);
    miraCtx.lineTo(13, 40);
    miraCtx.fill();

    // Glowing purple cloak edge
    miraCtx.strokeStyle = '#c56cf0';
    miraCtx.lineWidth = 1;
    miraCtx.beginPath();
    miraCtx.moveTo(13, 39);
    miraCtx.lineTo(17, 41);
    miraCtx.lineTo(24, 32);
    miraCtx.lineTo(31, 41);
    miraCtx.lineTo(35, 39);
    miraCtx.stroke();

    // Frilled translucent star collar & choker
    miraCtx.fillStyle = '#be2edd';
    miraCtx.fillRect(20, 24, 8, 3);
    miraCtx.fillStyle = '#ff9ff3';
    miraCtx.fillRect(18, 26, 12, 2);

    // Star pendant brooch at chest
    miraCtx.fillStyle = '#ffd32a';
    miraCtx.fillRect(23, 27, 2, 2);

    // Back Hood / Veil (falling behind head)
    miraCtx.fillStyle = '#160e24';
    miraCtx.fillRect(12, 10, 24, 22);

    // Glowing purple accents on veil
    miraCtx.fillStyle = '#e056fd';
    miraCtx.fillRect(11, 8, 3, 4); // left ear peak accent
    miraCtx.fillRect(34, 8, 3, 4); // right ear peak accent

    // Face
    miraCtx.fillStyle = '#fed7aa';
    miraCtx.fillRect(17, 13, 14, 12);

    // Cheeks blush
    miraCtx.fillStyle = '#ff7675';
    miraCtx.fillRect(18, 20, 3, 2);
    miraCtx.fillRect(27, 20, 3, 2);

    // Sparkling anime purple eyes
    miraCtx.fillStyle = '#8854d0';
    miraCtx.fillRect(19, 16, 3, 4);
    miraCtx.fillRect(26, 16, 3, 4);
    // Eye shine white dot
    miraCtx.fillStyle = '#ffffff';
    miraCtx.fillRect(19, 16, 1, 2);
    miraCtx.fillRect(26, 16, 1, 2);
    // Eye lower violet sparkle
    miraCtx.fillStyle = '#e056fd';
    miraCtx.fillRect(20, 18, 2, 2);
    miraCtx.fillRect(27, 18, 2, 2);

    // Cute mouth
    miraCtx.fillStyle = '#eb4d4b';
    miraCtx.fillRect(23, 22, 2, 1);

    // Dark indigo hair (base)
    miraCtx.fillStyle = '#241433';
    miraCtx.fillRect(16, 10, 16, 6); // forehead
    miraCtx.fillRect(15, 14, 3, 10); // left side strand
    miraCtx.fillRect(30, 14, 3, 10); // right side strand

    // Bangs
    miraCtx.fillRect(18, 14, 3, 4);
    miraCtx.fillRect(23, 14, 2, 3);
    miraCtx.fillRect(27, 14, 3, 4);

    // Magenta / Pink ombre gradient tips on hair
    miraCtx.fillStyle = '#e056fd';
    miraCtx.fillRect(15, 21, 3, 4); // left tip
    miraCtx.fillRect(30, 21, 3, 4); // right tip
    miraCtx.fillRect(18, 17, 3, 1); // bang highlight
    miraCtx.fillRect(27, 17, 3, 1); // bang highlight
    miraCtx.fillStyle = '#ff79cd';
    miraCtx.fillRect(15, 24, 3, 2); // left end highlight
    miraCtx.fillRect(30, 24, 3, 2); // right end highlight

    // Hood / Veil upper drape and peaks
    miraCtx.fillStyle = '#1c132b';
    miraCtx.fillRect(14, 6, 20, 6);
    miraCtx.fillRect(12, 8, 4, 4); // left peak
    miraCtx.fillRect(32, 8, 4, 4); // right peak
    miraCtx.fillStyle = '#2f1b4a';
    miraCtx.fillRect(16, 7, 16, 2); // hood fold highlight

    // Glowing neon purple trim on hood rim
    miraCtx.fillStyle = '#e056fd';
    miraCtx.fillRect(14, 11, 2, 1);
    miraCtx.fillRect(32, 11, 2, 1);
    miraCtx.fillRect(12, 7, 2, 2);
    miraCtx.fillRect(34, 7, 2, 2);

    this.addTexture('npc_mira', miraCanvas);

    // 2. Rowan (Frontier Guard)
    const { canvas: rowanCanvas, ctx: rowanCtx } = this.createCanvas(48, 56);
    rowanCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    rowanCtx.beginPath();
    rowanCtx.ellipse(24, 52, 13, 5, 0, 0, Math.PI * 2);
    rowanCtx.fill();

    // Guard armor (Steel and royal blue mantle)
    rowanCtx.fillStyle = '#718093';
    rowanCtx.fillRect(16, 26, 16, 16);
    rowanCtx.fillStyle = '#2e86de';
    rowanCtx.fillRect(16, 26, 16, 4);
    rowanCtx.fillRect(14, 28, 3, 14); // Royal blue cape
    rowanCtx.fillRect(18, 42, 5, 10);
    rowanCtx.fillRect(25, 42, 5, 10);

    // Face & Dark brown hair
    rowanCtx.fillStyle = '#fed7aa';
    rowanCtx.fillRect(17, 12, 14, 12);
    rowanCtx.fillStyle = '#2f3542';
    rowanCtx.fillRect(16, 8, 16, 7);
    // Silver circlet
    rowanCtx.fillStyle = '#dfe4ea';
    rowanCtx.fillRect(16, 13, 16, 2);

    this.addTexture('npc_rowan', rowanCanvas);

    // 3. Elder Oron
    const { canvas: elderCanvas, ctx: elderCtx } = this.createCanvas(48, 56);
    elderCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    elderCtx.beginPath();
    elderCtx.ellipse(24, 52, 14, 5, 0, 0, Math.PI * 2);
    elderCtx.fill();

    // Celestial Robe
    elderCtx.fillStyle = '#1e272e';
    elderCtx.fillRect(15, 25, 18, 25);
    elderCtx.fillStyle = '#f5cd79'; // Golden runes on hem
    elderCtx.fillRect(15, 47, 18, 3);

    // Face & Long white beard
    elderCtx.fillStyle = '#fcd5b5';
    elderCtx.fillRect(17, 12, 14, 12);
    elderCtx.fillStyle = '#dcdde1'; // White beard
    elderCtx.fillRect(17, 20, 14, 14);
    elderCtx.fillRect(19, 34, 10, 6);
    // Wizard cowl
    elderCtx.fillStyle = '#2f3542';
    elderCtx.fillRect(15, 8, 18, 8);

    this.addTexture('npc_elder', elderCanvas);
  }

  // ==========================================
  // PORTRAITS (96x96 Anime Busts)
  // ==========================================
  private generatePortraits(): void {
    // If high-res anime portraits are already loaded via Phaser Loader, preserve them!
    if (!this.scene.textures.exists('portrait_mira')) {
      // 1. Mira Portrait Fallback
    const { canvas: pMiraCanvas, ctx: pMiraCtx } = this.createCanvas(96, 96);
    // Background gradient frame
    const miraBg = pMiraCtx.createLinearGradient(0, 0, 96, 96);
    miraBg.addColorStop(0, '#26de81');
    miraBg.addColorStop(1, '#0fb9b1');
    pMiraCtx.fillStyle = miraBg;
    pMiraCtx.fillRect(0, 0, 96, 96);
    pMiraCtx.strokeStyle = '#fed330';
    pMiraCtx.lineWidth = 4;
    pMiraCtx.strokeRect(2, 2, 92, 92);

    // Shoulders / Dress
    pMiraCtx.fillStyle = '#20bf6b';
    pMiraCtx.beginPath();
    pMiraCtx.moveTo(20, 96);
    pMiraCtx.lineTo(48, 70);
    pMiraCtx.lineTo(76, 96);
    pMiraCtx.fill();

    // Neck & Head
    pMiraCtx.fillStyle = '#fed7aa';
    pMiraCtx.fillRect(42, 60, 12, 16);
    pMiraCtx.beginPath();
    pMiraCtx.ellipse(48, 46, 20, 22, 0, 0, Math.PI * 2);
    pMiraCtx.fill();

    // Eyes
    pMiraCtx.fillStyle = '#0fbcf9';
    pMiraCtx.fillRect(36, 42, 7, 9);
    pMiraCtx.fillRect(53, 42, 7, 9);
    pMiraCtx.fillStyle = '#ffffff';
    pMiraCtx.fillRect(37, 43, 3, 3);
    pMiraCtx.fillRect(54, 43, 3, 3);
    // Blush
    pMiraCtx.fillStyle = 'rgba(255, 107, 129, 0.4)';
    pMiraCtx.fillRect(34, 52, 6, 3);
    pMiraCtx.fillRect(56, 52, 6, 3);

    // Hair
    pMiraCtx.fillStyle = '#b7791f';
    pMiraCtx.beginPath();
    pMiraCtx.arc(48, 38, 24, Math.PI, 0);
    pMiraCtx.fill();
    pMiraCtx.fillRect(24, 38, 10, 40);
    pMiraCtx.fillRect(62, 38, 10, 40);
    // Bangs
    pMiraCtx.beginPath();
    pMiraCtx.moveTo(28, 38);
    pMiraCtx.lineTo(40, 46);
    pMiraCtx.lineTo(48, 36);
    pMiraCtx.lineTo(56, 46);
    pMiraCtx.lineTo(68, 38);
    pMiraCtx.fill();
    // Flower
    pMiraCtx.fillStyle = '#ff4757';
    pMiraCtx.fillRect(24, 28, 10, 10);
    pMiraCtx.fillStyle = '#ffa502';
    pMiraCtx.fillRect(27, 31, 4, 4);

    this.addTexture('portrait_mira', pMiraCanvas);
    }

    // 2. Rowan Portrait
    if (!this.scene.textures.exists('portrait_rowan')) {
    const { canvas: pRowanCanvas, ctx: pRowanCtx } = this.createCanvas(96, 96);
    const rowanBg = pRowanCtx.createLinearGradient(0, 0, 96, 96);
    rowanBg.addColorStop(0, '#eb4d4b');
    rowanBg.addColorStop(1, '#686de0');
    pRowanCtx.fillStyle = rowanBg;
    pRowanCtx.fillRect(0, 0, 96, 96);
    pRowanCtx.strokeStyle = '#dfe4ea';
    pRowanCtx.lineWidth = 4;
    pRowanCtx.strokeRect(2, 2, 92, 92);

    // Guard Armor
    pRowanCtx.fillStyle = '#718093';
    pRowanCtx.fillRect(16, 72, 64, 24);
    pRowanCtx.fillStyle = '#eb2f06';
    pRowanCtx.fillRect(36, 72, 24, 24);

    // Face
    pRowanCtx.fillStyle = '#fed7aa';
    pRowanCtx.fillRect(34, 34, 28, 34);

    // Determined Eyes
    pRowanCtx.fillStyle = '#2f3542';
    pRowanCtx.fillRect(38, 44, 7, 5);
    pRowanCtx.fillRect(51, 44, 7, 5);

    // Hair & Headband
    pRowanCtx.fillStyle = '#573d2a';
    pRowanCtx.fillRect(30, 22, 36, 16);
    pRowanCtx.fillStyle = '#e84118';
    pRowanCtx.fillRect(30, 32, 36, 7);

    this.addTexture('portrait_rowan', pRowanCanvas);
    }

    // 3. Elder Oron Portrait
    if (!this.scene.textures.exists('portrait_elder')) {
    const { canvas: pElderCanvas, ctx: pElderCtx } = this.createCanvas(96, 96);
    const elderBg = pElderCtx.createLinearGradient(0, 0, 96, 96);
    elderBg.addColorStop(0, '#3867d6');
    elderBg.addColorStop(1, '#20bf6b');
    pElderCtx.fillStyle = elderBg;
    pElderCtx.fillRect(0, 0, 96, 96);
    pElderCtx.strokeStyle = '#f7b731';
    pElderCtx.lineWidth = 4;
    pElderCtx.strokeRect(2, 2, 92, 92);

    // Robes
    pElderCtx.fillStyle = '#1e272e';
    pElderCtx.fillRect(14, 70, 68, 26);

    // Head
    pElderCtx.fillStyle = '#fcd5b5';
    pElderCtx.fillRect(34, 32, 28, 30);

    // Wise Eyes
    pElderCtx.fillStyle = '#0fbcf9';
    pElderCtx.fillRect(39, 42, 6, 4);
    pElderCtx.fillRect(51, 42, 6, 4);

    // Long Beard & White Hair
    pElderCtx.fillStyle = '#dcdde1';
    pElderCtx.fillRect(32, 48, 32, 36);
    pElderCtx.fillRect(36, 84, 24, 12);
    pElderCtx.fillRect(28, 18, 40, 18);

    // Star Amulet Brooch
    pElderCtx.fillStyle = '#f5cd79';
    pElderCtx.beginPath();
    pElderCtx.arc(48, 76, 6, 0, Math.PI * 2);
    pElderCtx.fill();

    this.addTexture('portrait_elder', pElderCanvas);
    }
  }

  // ==========================================
  // ENVIRONMENT PROPS & TILES
  // ==========================================
  private generateEnvironmentProps(): void {
    // 1. Meadow Tree (Lush Anime Canopy)
    const { canvas: treeCanvas, ctx: treeCtx } = this.createCanvas(96, 110);
    // Tree Shadow
    treeCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    treeCtx.beginPath();
    treeCtx.ellipse(48, 98, 36, 10, 0, 0, Math.PI * 2);
    treeCtx.fill();

    // Trunk
    treeCtx.fillStyle = '#6d4c41';
    treeCtx.fillRect(40, 64, 16, 36);
    treeCtx.fillStyle = '#4e342e';
    treeCtx.fillRect(48, 64, 8, 36);

    // Lush Canopy layers
    const leafGrad = treeCtx.createRadialGradient(42, 35, 10, 48, 45, 45);
    leafGrad.addColorStop(0, '#6ab04c');
    leafGrad.addColorStop(0.7, '#badc58');
    leafGrad.addColorStop(1, '#487e36');

    treeCtx.fillStyle = leafGrad;
    treeCtx.beginPath();
    treeCtx.arc(48, 45, 38, 0, Math.PI * 2);
    treeCtx.fill();

    // Highlights
    treeCtx.fillStyle = 'rgba(249, 202, 36, 0.3)';
    treeCtx.beginPath();
    treeCtx.arc(40, 35, 18, 0, Math.PI * 2);
    treeCtx.fill();

    this.addTexture('prop_tree_meadow', treeCanvas);

    // 2. Forest Tree (Dark Mystical Pine)
    const { canvas: fTreeCanvas, ctx: fTreeCtx } = this.createCanvas(96, 120);
    fTreeCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    fTreeCtx.beginPath();
    fTreeCtx.ellipse(48, 108, 34, 10, 0, 0, Math.PI * 2);
    fTreeCtx.fill();

    fTreeCtx.fillStyle = '#3e2723';
    fTreeCtx.fillRect(42, 80, 12, 30);

    // Tiered Indigo/Teal Pine
    const pineColors = ['#1e3799', '#273c75', '#192a56'];
    for (let i = 0; i < 3; i++) {
      fTreeCtx.fillStyle = pineColors[i];
      fTreeCtx.beginPath();
      fTreeCtx.moveTo(48, 15 + i * 22);
      fTreeCtx.lineTo(20 + i * 5, 55 + i * 20);
      fTreeCtx.lineTo(76 - i * 5, 55 + i * 20);
      fTreeCtx.fill();
    }
    // Glowing bioluminescent motes
    fTreeCtx.fillStyle = '#00d2d3';
    fTreeCtx.fillRect(36, 45, 3, 3);
    fTreeCtx.fillRect(58, 62, 3, 3);
    fTreeCtx.fillRect(44, 78, 3, 3);

    this.addTexture('prop_tree_forest', fTreeCanvas);

    // 3. Rock / Boulder
    const { canvas: rockCanvas, ctx: rockCtx } = this.createCanvas(64, 54);
    rockCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    rockCtx.beginPath();
    rockCtx.ellipse(32, 46, 26, 7, 0, 0, Math.PI * 2);
    rockCtx.fill();

    rockCtx.fillStyle = '#7f8c8d';
    rockCtx.beginPath();
    rockCtx.moveTo(10, 44);
    rockCtx.lineTo(16, 20);
    rockCtx.lineTo(34, 12);
    rockCtx.lineTo(54, 24);
    rockCtx.lineTo(56, 44);
    rockCtx.fill();

    // Shading facet
    rockCtx.fillStyle = '#95a5a6';
    rockCtx.beginPath();
    rockCtx.moveTo(16, 20);
    rockCtx.lineTo(34, 12);
    rockCtx.lineTo(38, 44);
    rockCtx.lineTo(10, 44);
    rockCtx.fill();

    this.addTexture('prop_rock', rockCanvas);

    // 4. Village Cottage
    const { canvas: houseCanvas, ctx: houseCtx } = this.createCanvas(180, 150);
    // Ground Shadow
    houseCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    houseCtx.beginPath();
    houseCtx.ellipse(90, 140, 80, 12, 0, 0, Math.PI * 2);
    houseCtx.fill();

    // Main Walls (Timber / plaster)
    houseCtx.fillStyle = '#f5f6fa';
    houseCtx.fillRect(30, 60, 120, 80);
    // Timber beams
    houseCtx.fillStyle = '#795548';
    houseCtx.fillRect(30, 60, 8, 80);
    houseCtx.fillRect(142, 60, 8, 80);
    houseCtx.fillRect(30, 60, 120, 8);
    houseCtx.fillRect(30, 132, 120, 8);

    // Door
    houseCtx.fillStyle = '#5d4037';
    houseCtx.fillRect(75, 88, 30, 52);
    houseCtx.fillStyle = '#f1c40f'; // Brass knob
    houseCtx.fillRect(78, 114, 4, 4);

    // Windows with warm amber light
    houseCtx.fillStyle = '#f39c12';
    houseCtx.fillRect(44, 85, 20, 20);
    houseCtx.fillRect(116, 85, 20, 20);
    houseCtx.strokeStyle = '#4e342e';
    houseCtx.lineWidth = 2;
    houseCtx.strokeRect(44, 85, 20, 20);
    houseCtx.strokeRect(116, 85, 20, 20);

    // Pitched Thatched/Tiled Roof
    houseCtx.fillStyle = '#c0392b';
    houseCtx.beginPath();
    houseCtx.moveTo(16, 64);
    houseCtx.lineTo(90, 10);
    houseCtx.lineTo(164, 64);
    houseCtx.fill();
    // Chimney
    houseCtx.fillStyle = '#7f8c8d';
    houseCtx.fillRect(124, 18, 16, 26);

    this.addTexture('prop_cottage', houseCanvas);

    // 5. Ancient Stone Pillar
    const { canvas: pillarCanvas, ctx: pillarCtx } = this.createCanvas(70, 110);
    pillarCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    pillarCtx.beginPath();
    pillarCtx.ellipse(35, 102, 26, 8, 0, 0, Math.PI * 2);
    pillarCtx.fill();

    pillarCtx.fillStyle = '#636e72';
    pillarCtx.fillRect(18, 20, 34, 80);
    // Base & Capital
    pillarCtx.fillStyle = '#b2bec3';
    pillarCtx.fillRect(12, 12, 46, 12);
    pillarCtx.fillRect(12, 92, 46, 14);

    // Glowing cyan runes
    pillarCtx.strokeStyle = '#00d2d3';
    pillarCtx.lineWidth = 2;
    pillarCtx.beginPath();
    pillarCtx.moveTo(35, 30);
    pillarCtx.lineTo(35, 85);
    pillarCtx.moveTo(25, 45);
    pillarCtx.lineTo(45, 45);
    pillarCtx.moveTo(25, 68);
    pillarCtx.lineTo(45, 68);
    pillarCtx.stroke();

    this.addTexture('prop_pillar', pillarCanvas);

    // 6. Ancient Wall Segment
    const { canvas: wallCanvas, ctx: wallCtx } = this.createCanvas(100, 60);
    wallCtx.fillStyle = '#2d3436';
    wallCtx.fillRect(0, 0, 100, 60);
    wallCtx.strokeStyle = '#636e72';
    wallCtx.lineWidth = 2;
    // Brick lines
    wallCtx.strokeRect(2, 2, 96, 56);
    wallCtx.strokeRect(4, 4, 46, 24);
    wallCtx.strokeRect(52, 4, 44, 24);
    wallCtx.strokeRect(4, 30, 46, 26);
    wallCtx.strokeRect(52, 30, 44, 26);
    this.addTexture('prop_wall', wallCanvas);

    // 7. Chests (Closed & Open)
    const { canvas: chestCCanvas, ctx: chestCCtx } = this.createCanvas(44, 38);
    chestCCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    chestCCtx.beginPath();
    chestCCtx.ellipse(22, 34, 18, 5, 0, 0, Math.PI * 2);
    chestCCtx.fill();

    // Body
    chestCCtx.fillStyle = '#8b5a2b';
    chestCCtx.fillRect(6, 12, 32, 22);
    // Gold Bands
    chestCCtx.fillStyle = '#f1c40f';
    chestCCtx.fillRect(6, 12, 5, 22);
    chestCCtx.fillRect(33, 12, 5, 22);
    chestCCtx.fillRect(6, 20, 32, 3);
    // Clasp
    chestCCtx.fillStyle = '#e74c3c';
    chestCCtx.fillRect(20, 19, 5, 6);
    this.addTexture('prop_chest_closed', chestCCanvas);

    const { canvas: chestOCanvas, ctx: chestOCtx } = this.createCanvas(44, 46);
    chestOCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    chestOCtx.beginPath();
    chestOCtx.ellipse(22, 42, 18, 5, 0, 0, Math.PI * 2);
    chestOCtx.fill();

    // Open lid tilted back
    chestOCtx.fillStyle = '#6d451e';
    chestOCtx.fillRect(6, 4, 32, 14);
    chestOCtx.fillStyle = '#f1c40f';
    chestOCtx.fillRect(6, 4, 5, 14);
    chestOCtx.fillRect(33, 4, 5, 14);

    // Chest Body
    chestOCtx.fillStyle = '#8b5a2b';
    chestOCtx.fillRect(6, 20, 32, 22);
    // Golden glow inside
    chestOCtx.fillStyle = '#ffeaa7';
    chestOCtx.fillRect(9, 18, 26, 6);
    this.addTexture('prop_chest_open', chestOCanvas);
  }

  // ==========================================
  // ITEM ICONS (36x36)
  // ==========================================
  private generateItemIcons(): void {
    // 1. Health Potion
    const { canvas: hpCanvas, ctx: hpCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(hpCtx);
    // Bottle neck & Cork
    hpCtx.fillStyle = '#bdc581';
    hpCtx.fillRect(16, 6, 4, 4);
    // Glass flask
    hpCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    hpCtx.beginPath();
    hpCtx.arc(18, 22, 10, 0, Math.PI * 2);
    hpCtx.fill();
    // Crimson liquid
    hpCtx.fillStyle = '#ff4757';
    hpCtx.beginPath();
    hpCtx.arc(18, 23, 8, 0, Math.PI * 2);
    hpCtx.fill();
    // Specular shine
    hpCtx.fillStyle = '#ffffff';
    hpCtx.fillRect(14, 18, 3, 3);
    this.addTexture('icon_health_potion', hpCanvas);

    // 2. Mana Potion
    const { canvas: mpCanvas, ctx: mpCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(mpCtx);
    mpCtx.fillStyle = '#bdc581';
    mpCtx.fillRect(16, 6, 4, 4);
    mpCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    mpCtx.beginPath();
    mpCtx.arc(18, 22, 10, 0, Math.PI * 2);
    mpCtx.fill();
    mpCtx.fillStyle = '#2ed573';
    mpCtx.beginPath();
    mpCtx.arc(18, 23, 8, 0, Math.PI * 2);
    mpCtx.fill();
    mpCtx.fillStyle = '#ffffff';
    mpCtx.fillRect(14, 18, 3, 3);
    this.addTexture('icon_mana_potion', mpCanvas);

    // 3. Forest Herb
    const { canvas: herbCanvas, ctx: herbCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(herbCtx);
    herbCtx.fillStyle = '#26de81';
    herbCtx.beginPath();
    herbCtx.ellipse(18, 18, 6, 12, Math.PI / 4, 0, Math.PI * 2);
    herbCtx.ellipse(18, 18, 6, 12, -Math.PI / 4, 0, Math.PI * 2);
    herbCtx.fill();
    herbCtx.strokeStyle = '#20bf6b';
    herbCtx.lineWidth = 1.5;
    herbCtx.stroke();
    this.addTexture('icon_forest_herb', herbCanvas);

    // 4. Ancient Coin
    const { canvas: coinCanvas, ctx: coinCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(coinCtx);
    coinCtx.fillStyle = '#ffd32a';
    coinCtx.beginPath();
    coinCtx.arc(18, 18, 11, 0, Math.PI * 2);
    coinCtx.fill();
    coinCtx.strokeStyle = '#ffa801';
    coinCtx.lineWidth = 2;
    coinCtx.stroke();
    // Star emblem
    coinCtx.fillStyle = '#d35400';
    coinCtx.fillRect(16, 12, 4, 12);
    coinCtx.fillRect(12, 16, 12, 4);
    this.addTexture('icon_ancient_coin', coinCanvas);

    // 5. Guardian Core
    const { canvas: coreCanvas, ctx: coreCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(coreCtx);
    coreCtx.fillStyle = '#00d2d3';
    coreCtx.beginPath();
    coreCtx.moveTo(18, 6);
    coreCtx.lineTo(28, 18);
    coreCtx.lineTo(18, 30);
    coreCtx.lineTo(8, 18);
    coreCtx.fill();
    coreCtx.strokeStyle = '#54a0ff';
    coreCtx.lineWidth = 2;
    coreCtx.stroke();
    this.addTexture('icon_guardian_core', coreCanvas);

    // 6. Iron Sword
    const { canvas: isCanvas, ctx: isCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(isCtx);
    isCtx.save();
    isCtx.translate(18, 18);
    isCtx.rotate(Math.PI / 4);
    isCtx.fillStyle = '#dfe4ea'; // Blade
    isCtx.fillRect(-2, -14, 4, 18);
    isCtx.fillStyle = '#f1c40f'; // Guard
    isCtx.fillRect(-6, 4, 12, 3);
    isCtx.fillStyle = '#57606f'; // Hilt
    isCtx.fillRect(-2, 7, 4, 6);
    isCtx.restore();
    this.addTexture('icon_iron_sword', isCanvas);

    // 7. Moon Blade
    const { canvas: mbCanvas, ctx: mbCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(mbCtx);
    mbCtx.save();
    mbCtx.translate(18, 18);
    mbCtx.rotate(Math.PI / 4);
    mbCtx.fillStyle = '#70a1ff';
    mbCtx.beginPath();
    mbCtx.moveTo(-3, -15);
    mbCtx.quadraticCurveTo(6, -4, 0, 6);
    mbCtx.lineTo(-4, 6);
    mbCtx.fill();
    mbCtx.fillStyle = '#eccc68';
    mbCtx.fillRect(-6, 6, 12, 3);
    mbCtx.fillStyle = '#2f3542';
    mbCtx.fillRect(-2, 9, 4, 6);
    mbCtx.restore();
    this.addTexture('icon_moon_blade', mbCanvas);

    // 8. Guardian Armor
    const { canvas: gaCanvas, ctx: gaCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(gaCtx);
    gaCtx.fillStyle = '#57606f';
    gaCtx.fillRect(10, 10, 16, 16);
    gaCtx.fillStyle = '#00d2d3';
    gaCtx.fillRect(16, 14, 4, 8);
    gaCtx.fillStyle = '#ffa502';
    gaCtx.fillRect(8, 8, 20, 3);
    this.addTexture('icon_guardian_armor', gaCanvas);

    // 9. Astral Amulet
    const { canvas: aaCanvas, ctx: aaCtx } = this.createCanvas(36, 36);
    this.drawIconBacking(aaCtx);
    aaCtx.strokeStyle = '#eccc68';
    aaCtx.lineWidth = 2;
    aaCtx.beginPath();
    aaCtx.arc(18, 14, 6, 0, Math.PI);
    aaCtx.stroke();
    // Star
    aaCtx.fillStyle = '#70a1ff';
    aaCtx.beginPath();
    aaCtx.arc(18, 22, 6, 0, Math.PI * 2);
    aaCtx.fill();
    this.addTexture('icon_star_amulet', aaCanvas);
  }

  private drawIconBacking(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#1e1b2e';
    ctx.fillRect(0, 0, 36, 36);
    ctx.strokeStyle = '#3d3567';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 34, 34);
  }

  // ==========================================
  // COMBAT & VFX PARTICLES
  // ==========================================
  private generateCombatEffects(): void {
    // 1. Crescent Slash
    const { canvas: slashCanvas, ctx: slashCtx } = this.createCanvas(64, 64);
    slashCtx.strokeStyle = '#00cec9';
    slashCtx.lineWidth = 6;
    slashCtx.lineCap = 'round';
    slashCtx.beginPath();
    slashCtx.arc(32, 32, 24, -Math.PI * 0.4, Math.PI * 0.4);
    slashCtx.stroke();
    slashCtx.strokeStyle = '#ffffff';
    slashCtx.lineWidth = 2;
    slashCtx.stroke();
    this.addTexture('fx_slash', slashCanvas);

    // 2. Arc Burst Ring
    const { canvas: arcCanvas, ctx: arcCtx } = this.createCanvas(120, 120);
    const radGrad = arcCtx.createRadialGradient(60, 60, 20, 60, 60, 56);
    radGrad.addColorStop(0, 'rgba(0, 206, 201, 0.8)');
    radGrad.addColorStop(0.7, 'rgba(108, 92, 231, 0.5)');
    radGrad.addColorStop(1, 'transparent');
    arcCtx.fillStyle = radGrad;
    arcCtx.beginPath();
    arcCtx.arc(60, 60, 56, 0, Math.PI * 2);
    arcCtx.fill();
    // Ring rim
    arcCtx.strokeStyle = '#81ecec';
    arcCtx.lineWidth = 4;
    arcCtx.stroke();
    this.addTexture('fx_arc_burst', arcCanvas);

    // 3. Sparkle Particle
    const { canvas: sparkCanvas, ctx: sparkCtx } = this.createCanvas(16, 16);
    sparkCtx.fillStyle = '#ffeaa7';
    sparkCtx.beginPath();
    sparkCtx.moveTo(8, 0);
    sparkCtx.lineTo(10, 6);
    sparkCtx.lineTo(16, 8);
    sparkCtx.lineTo(10, 10);
    sparkCtx.lineTo(8, 16);
    sparkCtx.lineTo(6, 10);
    sparkCtx.lineTo(0, 8);
    sparkCtx.lineTo(6, 6);
    sparkCtx.fill();
    this.addTexture('fx_spark', sparkCanvas);

    // 4. Hit Dot Particle
    const { canvas: dotCanvas, ctx: dotCtx } = this.createCanvas(10, 10);
    dotCtx.fillStyle = '#ff7675';
    dotCtx.beginPath();
    dotCtx.arc(5, 5, 4, 0, Math.PI * 2);
    dotCtx.fill();
    this.addTexture('fx_hit_dot', dotCanvas);
  }

  // ==========================================
  // UI ELEMENTS
  // ==========================================
  private generateUIElements(): void {
    // 1. Virtual Joystick Base
    const { canvas: joyBaseCanvas, ctx: joyBaseCtx } = this.createCanvas(120, 120);
    joyBaseCtx.fillStyle = 'rgba(30, 27, 46, 0.6)';
    joyBaseCtx.beginPath();
    joyBaseCtx.arc(60, 60, 56, 0, Math.PI * 2);
    joyBaseCtx.fill();
    joyBaseCtx.strokeStyle = 'rgba(108, 92, 231, 0.8)';
    joyBaseCtx.lineWidth = 4;
    joyBaseCtx.stroke();
    this.addTexture('ui_joy_base', joyBaseCanvas);

    // 2. Virtual Joystick Thumb
    const { canvas: joyThumbCanvas, ctx: joyThumbCtx } = this.createCanvas(60, 60);
    joyThumbCtx.fillStyle = 'rgba(108, 92, 231, 0.85)';
    joyThumbCtx.beginPath();
    joyThumbCtx.arc(30, 30, 24, 0, Math.PI * 2);
    joyThumbCtx.fill();
    joyThumbCtx.strokeStyle = '#a29bfe';
    joyThumbCtx.lineWidth = 3;
    joyThumbCtx.stroke();
    this.addTexture('ui_joy_thumb', joyThumbCanvas);

    // 3. Action Button (Round Touch Button)
    const { canvas: btnCanvas, ctx: btnCtx } = this.createCanvas(72, 72);
    btnCtx.fillStyle = 'rgba(25, 20, 42, 0.75)';
    btnCtx.beginPath();
    btnCtx.arc(36, 36, 32, 0, Math.PI * 2);
    btnCtx.fill();
    btnCtx.strokeStyle = '#6c5ce7';
    btnCtx.lineWidth = 3;
    btnCtx.stroke();
    this.addTexture('ui_action_btn', btnCanvas);
  }
}
