import * as Phaser from 'phaser';
import { distance } from '../utils/math';
import { Enemy } from './Enemy';
import { Player } from './Player';

export class BossEnemy extends Enemy {
  public phase: 1 | 2 | 3 = 1;
  private isSpecialCasting: boolean = false;
  private isPhaseInvulnerable: boolean = false;
  private specialCooldown: number = 5000;
  private lastSpecialTime: number = 0;
  private auraGfx: Phaser.GameObjects.Graphics;

  public onPhaseChange?: (newPhase: number) => void;

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, id, 'ancient_guardian', x, y);
    this.auraGfx = scene.add.graphics();
  }

  public override updateAI(player: Player, time: number, delta: number): void {
    if (this.isDead) {
      this.auraGfx.clear();
      return;
    }

    this.updatePhases();
    this.drawAura();

    // In Phase 2 & 3, perform Area Slam Slam attack
    if (this.phase >= 2 && !this.isSpecialCasting && time - this.lastSpecialTime > this.specialCooldown) {
      const dist = distance(this.x, this.y, player.x, player.y);
      if (dist < 220) {
        this.lastSpecialTime = time;
        this.performAreaSlam(player);
        return;
      }
    }

    if (!this.isSpecialCasting) {
      super.updateAI(player, time, delta);
    }
  }

  private updatePhases(): void {
    const hpRatio = this.stats.hp / this.stats.maxHp;

    if (hpRatio <= 0.25 && this.phase < 3) {
      this.phase = 3;
      this.stats.speed = 135; // Significantly faster
      this.stats.attack = 32; // Stronger
      this.stats.attackCooldown = 1100;
      this.specialCooldown = 3500;
      this.scene.cameras.main.shake(400, 0.015);
      if (this.onPhaseChange) this.onPhaseChange(3);
    } else if (hpRatio <= 0.6 && this.phase < 2) {
      this.phase = 2;
      this.stats.speed = 110;
      this.stats.attack = 28;
      this.stats.attackCooldown = 1300;
      this.specialCooldown = 4500;
      // Temporary phase shift invulnerability
      this.triggerPhaseShiftShield();
      if (this.onPhaseChange) this.onPhaseChange(2);
    }
  }

  private triggerPhaseShiftShield(): void {
    this.isPhaseInvulnerable = true;
    this.setTint(0x00d2d3);

    this.scene.time.delayedCall(1800, () => {
      this.isPhaseInvulnerable = false;
      this.clearTint();
    });
  }

  public override takeDamage(damage: number, isCrit: boolean, fromX: number, fromY: number): void {
    if (this.isPhaseInvulnerable) {
      // Deflected!
      return;
    }
    // Reduced knockback for massive boss
    super.takeDamage(damage, isCrit, fromX, fromY, 60);
  }

  private performAreaSlam(player: Player): void {
    this.isSpecialCasting = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    // Boss winds up, flashing golden
    this.setTint(0xffd32a);

    // Indicator circle on ground
    const slamCircle = this.scene.add.circle(this.x, this.y, 130, 0xff4757, 0.25);
    slamCircle.setStrokeStyle(2, 0xff4757, 0.8);

    this.scene.time.delayedCall(750, () => {
      if (this.isDead) {
        slamCircle.destroy();
        return;
      }
      this.clearTint();
      slamCircle.destroy();

      // Shockwave impact
      const shockwave = this.scene.add.circle(this.x, this.y, 140, 0x00d2d3, 0.45);
      this.scene.tweens.add({
        targets: shockwave,
        scale: 1.4,
        alpha: 0,
        duration: 300,
        onComplete: () => shockwave.destroy(),
      });

      this.scene.cameras.main.shake(250, 0.012);

      // Check player hit
      const dist = distance(this.x, this.y, player.x, player.y);
      if (dist <= 140) {
        if (this.onAttackPlayer) this.onAttackPlayer(this);
      }

      this.isSpecialCasting = false;
    });
  }

  private drawAura(): void {
    this.auraGfx.clear();
    if (this.isDead) return;

    if (this.phase === 3) {
      // Crimson Enrage Aura
      this.auraGfx.lineStyle(3, 0xff3838, 0.6);
      this.auraGfx.strokeCircle(this.x, this.y, 48 + Math.sin(this.scene.time.now * 0.01) * 6);
    } else if (this.phase === 2) {
      // Arcane Violet Aura
      this.auraGfx.lineStyle(2, 0xa29bfe, 0.5);
      this.auraGfx.strokeCircle(this.x, this.y, 44 + Math.cos(this.scene.time.now * 0.008) * 4);
    }
  }

  public override destroy(fromScene?: boolean): void {
    if (this.auraGfx && this.auraGfx.active) {
      this.auraGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
