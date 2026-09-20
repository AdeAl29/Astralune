import * as Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { GameSettings } from '../types/game';
import { ARC_BURST_CONFIG } from '../utils/constants';
import { calculateDamage, distance } from '../utils/math';
import { AudioSystem } from './AudioSystem';

export class CombatSystem {
  private scene: Phaser.Scene;
  private audio: AudioSystem;
  private settings: GameSettings;

  constructor(scene: Phaser.Scene, settings: GameSettings) {
    this.scene = scene;
    this.audio = AudioSystem.getInstance();
    this.settings = settings;
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
  }

  /**
   * Execute Player Basic Melee Attack
   */
  public performPlayerMelee(player: Player, enemies: Enemy[]): void {
    this.audio.playSlash();

    // Determine attack hitbox center in front of player
    const facing = player.facing;
    const range = 52;
    let hitX = player.x;
    let hitY = player.y;

    if (facing === 'down') hitY += range;
    else if (facing === 'up') hitY -= range;
    else if (facing === 'left') hitX -= range;
    else if (facing === 'right') hitX += range;

    // Visual slash effect
    const slash = this.scene.add.sprite(hitX, hitY, 'fx_slash');
    if (facing === 'left') slash.setAngle(180);
    else if (facing === 'up') slash.setAngle(-90);
    else if (facing === 'down') slash.setAngle(90);
    else slash.setAngle(0);

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 180,
      onComplete: () => slash.destroy(),
    });

    const playerTotalAtk = player.stats.attack + player.bonusStats.attack;
    const playerTotalCrit = player.stats.critChance + player.bonusStats.critChance;

    let hitCount = 0;

    for (const enemy of enemies) {
      if (!enemy.active || enemy.isDead) continue;

      const dist = distance(hitX, hitY, enemy.x, enemy.y);
      if (dist <= 50) {
        hitCount++;
        const { damage, isCrit } = calculateDamage(
          playerTotalAtk,
          enemy.stats.defense,
          playerTotalCrit,
          player.stats.critMultiplier
        );

        enemy.takeDamage(damage, isCrit, player.x, player.y);
        this.audio.playHit();
        this.spawnHitParticles(enemy.x, enemy.y);

        if (this.settings.showDamageNumbers) {
          this.showDamageNumber(enemy.x, enemy.y - 20, damage, isCrit ? '#ff4757' : '#ffffff', isCrit);
        }
      }
    }

    if (hitCount > 0 && this.settings.screenShake) {
      this.scene.cameras.main.shake(120, 0.005);
    }
  }

  /**
   * Execute Special Skill: Arc Burst
   */
  public performPlayerArcBurst(player: Player, enemies: Enemy[]): boolean {
    if (player.stats.mp < ARC_BURST_CONFIG.manaCost) {
      return false; // Not enough mana
    }

    // Deduct MP
    player.stats.mp -= ARC_BURST_CONFIG.manaCost;
    this.audio.playArcBurst();

    // Spawn Arc Burst Visual Effect
    const burst = this.scene.add.sprite(player.x, player.y, 'fx_arc_burst');
    burst.setScale(0.3);
    burst.setAlpha(0.9);

    this.scene.tweens.add({
      targets: burst,
      scale: 1.8,
      alpha: 0,
      duration: 350,
      ease: 'Cubic.easeOut',
      onComplete: () => burst.destroy(),
    });

    // Particle burst
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const spark = this.scene.add.sprite(player.x, player.y, 'fx_spark');
      const targetX = player.x + Math.cos(angle) * ARC_BURST_CONFIG.radius;
      const targetY = player.y + Math.sin(angle) * ARC_BURST_CONFIG.radius;

      this.scene.tweens.add({
        targets: spark,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 0.5,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }

    if (this.settings.screenShake) {
      this.scene.cameras.main.shake(200, 0.012);
    }

    const playerTotalAtk = player.stats.attack + player.bonusStats.attack;
    const playerTotalCrit = player.stats.critChance + player.bonusStats.critChance + 0.15; // Arc Burst has bonus crit

    for (const enemy of enemies) {
      if (!enemy.active || enemy.isDead) continue;

      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist <= ARC_BURST_CONFIG.radius) {
        const { damage, isCrit } = calculateDamage(
          playerTotalAtk,
          enemy.stats.defense,
          playerTotalCrit,
          player.stats.critMultiplier,
          ARC_BURST_CONFIG.damageMultiplier
        );

        enemy.takeDamage(damage, isCrit, player.x, player.y, 240);
        this.spawnHitParticles(enemy.x, enemy.y);

        if (this.settings.showDamageNumbers) {
          this.showDamageNumber(enemy.x, enemy.y - 25, damage, '#00cec9', true);
        }
      }
    }

    return true;
  }

  /**
   * Enemy hits Player
   */
  public performEnemyAttack(enemy: Enemy, player: Player): void {
    if (player.isInvulnerable || player.isDead) return;

    const totalDefense = player.stats.defense + player.bonusStats.defense;
    const { damage } = calculateDamage(enemy.stats.attack, totalDefense, 0.05, 1.2);

    player.takeDamage(damage, enemy.x, enemy.y);
    this.audio.playHit();
    this.spawnHitParticles(player.x, player.y);

    if (this.settings.showDamageNumbers) {
      this.showDamageNumber(player.x, player.y - 20, damage, '#ff3838', false);
    }

    if (this.settings.screenShake) {
      this.scene.cameras.main.shake(150, 0.008);
    }
  }

  private spawnHitParticles(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.sprite(x, y, 'fx_hit_dot');
      const randX = x + (Math.random() * 40 - 20);
      const randY = y + (Math.random() * 40 - 20);

      this.scene.tweens.add({
        targets: p,
        x: randX,
        y: randY,
        alpha: 0,
        duration: 200,
        onComplete: () => p.destroy(),
      });
    }
  }

  public showDamageNumber(x: number, y: number, amount: number, color: string, isCrit: boolean): void {
    const textStr = isCrit ? `CRIT! ${amount}` : `${amount}`;
    const text = this.scene.add.text(x, y, textStr, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: isCrit ? '22px' : '17px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5);

    this.scene.tweens.add({
      targets: text,
      y: y - 35,
      alpha: 0,
      scale: isCrit ? 1.3 : 1.1,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => text.destroy(),
    });
  }
}
