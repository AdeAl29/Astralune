import * as Phaser from 'phaser';
import { ENEMY_CONFIGS } from '../data/enemies';
import { EnemyStats } from '../types/game';
import { distance } from '../utils/math';
import { Player } from './Player';

export type EnemyState = 'IDLE' | 'PATROL' | 'CHASE' | 'ATTACK' | 'HURT' | 'DEAD';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public id: string;
  public enemyType: string;
  public stats: EnemyStats;
  public state: EnemyState = 'IDLE';
  public isDead: boolean = false;

  private spawnX: number;
  private spawnY: number;
  private lastAttackTime: number = 0;
  private stateTimer: number = 0;
  private patrolTarget: { x: number; y: number } | null = null;

  // Overhead Health Bar
  private hpBarGfx: Phaser.GameObjects.Graphics;

  public onAttackPlayer?: (enemy: Enemy) => void;
  public onDefeated?: (enemy: Enemy) => void;

  constructor(scene: Phaser.Scene, id: string, type: 'slime' | 'shadow_wolf' | 'ancient_guardian', x: number, y: number) {
    const config = ENEMY_CONFIGS[type];
    super(scene, x, y, config.textureKey);

    this.id = id;
    this.enemyType = type;
    this.stats = JSON.parse(JSON.stringify(config));
    this.spawnX = x;
    this.spawnY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (type === 'slime') {
      body.setSize(28, 24);
      body.setOffset(8, 14);
    } else if (type === 'shadow_wolf') {
      body.setSize(36, 28);
      body.setOffset(10, 16);
    } else {
      // Boss
      body.setSize(52, 60);
      body.setOffset(22, 36);
    }
    body.setCollideWorldBounds(true);

    this.hpBarGfx = scene.add.graphics();
    this.drawHealthBar();
  }

  public updateAI(player: Player, time: number, delta: number): void {
    if (this.isDead) return;

    this.hpBarGfx.setPosition(this.x, this.y);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.state === 'HURT') return;

    const distToPlayer = distance(this.x, this.y, player.x, player.y);

    // Check Chase / Attack condition
    if (!player.isDead && distToPlayer <= this.stats.detectionRadius) {
      if (distToPlayer <= this.stats.attackRadius) {
        // In attack range
        this.state = 'ATTACK';
        body.setVelocity(0, 0);

        if (time - this.lastAttackTime >= this.stats.attackCooldown) {
          this.lastAttackTime = time;
          this.performAttack(player);
        }
      } else {
        // Chase player
        this.state = 'CHASE';
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        body.setVelocity(Math.cos(angle) * this.stats.speed, Math.sin(angle) * this.stats.speed);

        // Flip sprite if moving left/right
        if (player.x < this.x) {
          this.setFlipX(true);
        } else {
          this.setFlipX(false);
        }
      }
    } else {
      // Idle / Patrol near spawn
      this.updatePatrol(delta);
    }
  }

  private updatePatrol(delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.stateTimer += delta;

    if (this.state === 'PATROL' && this.patrolTarget) {
      const dist = distance(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
      if (dist < 15 || this.stateTimer > 3000) {
        this.state = 'IDLE';
        this.stateTimer = 0;
        body.setVelocity(0, 0);
      }
    } else if (this.stateTimer > 2500) {
      // Pick random patrol point within 80px of spawn
      this.stateTimer = 0;
      if (Math.random() < 0.6) {
        this.state = 'PATROL';
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 70;
        this.patrolTarget = {
          x: this.spawnX + Math.cos(angle) * rad,
          y: this.spawnY + Math.sin(angle) * rad,
        };
        const moveAngle = Phaser.Math.Angle.Between(this.x, this.y, this.patrolTarget.x, this.patrolTarget.y);
        body.setVelocity(Math.cos(moveAngle) * (this.stats.speed * 0.5), Math.sin(moveAngle) * (this.stats.speed * 0.5));
      } else {
        this.state = 'IDLE';
        body.setVelocity(0, 0);
      }
    }
  }

  private performAttack(player: Player): void {
    // Quick lunge animation towards player
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(Math.cos(angle) * 120, Math.sin(angle) * 120);

    this.scene.time.delayedCall(150, () => {
      if (!this.isDead && this.state !== 'HURT') {
        body.setVelocity(0, 0);
        if (this.onAttackPlayer) {
          this.onAttackPlayer(this);
        }
      }
    });
  }

  public takeDamage(damage: number, isCrit: boolean, fromX: number, fromY: number, knockbackPower: number = 180): void {
    if (this.isDead) return;

    this.stats.hp = Math.max(0, this.stats.hp - damage);
    this.state = 'HURT';

    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y);
    body.setVelocity(Math.cos(angle) * knockbackPower, Math.sin(angle) * knockbackPower);

    // Flash white or red
    this.setTint(isCrit ? 0xff3838 : 0xffffff);
    this.drawHealthBar();

    this.scene.time.delayedCall(160, () => {
      this.clearTint();
      if (!this.isDead) {
        this.state = 'CHASE';
        body.setVelocity(0, 0);
      }
    });

    if (this.stats.hp <= 0) {
      this.die();
    }
  }

  private drawHealthBar(): void {
    this.hpBarGfx.clear();
    // Only show health bar if damaged and not dead
    if (this.isDead || this.stats.hp >= this.stats.maxHp) return;

    const barW = this.stats.isBoss ? 64 : 36;
    const barH = 5;
    const barY = this.stats.isBoss ? -55 : -28;
    const pct = Math.max(0, this.stats.hp / this.stats.maxHp);

    // Background
    this.hpBarGfx.fillStyle(0x1e1b2e, 0.8);
    this.hpBarGfx.fillRect(-barW / 2 - 1, barY - 1, barW + 2, barH + 2);

    // Health Fill
    this.hpBarGfx.fillStyle(pct > 0.3 ? 0x2ed573 : 0xff4757, 0.9);
    this.hpBarGfx.fillRect(-barW / 2, barY, barW * pct, barH);
  }

  private die(): void {
    this.isDead = true;
    this.state = 'DEAD';
    this.hpBarGfx.destroy();

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.checkCollision.none = true;

    // Death fade & shrink
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.2,
      duration: 350,
      ease: 'Back.easeIn',
      onComplete: () => {
        if (this.onDefeated) {
          this.onDefeated(this);
        }
        this.destroy();
      },
    });
  }

  public destroy(fromScene?: boolean): void {
    if (this.hpBarGfx && this.hpBarGfx.active) {
      this.hpBarGfx.destroy();
    }
    super.destroy(fromScene);
  }
}
