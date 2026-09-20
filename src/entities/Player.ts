import * as Phaser from 'phaser';
import { Direction, PlayerStats } from '../types/game';
import { INITIAL_PLAYER_STATS } from '../utils/constants';
import { calculateRequiredExp } from '../utils/math';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public stats: PlayerStats;
  public bonusStats = {
    attack: 0,
    defense: 0,
    critChance: 0,
    speed: 0,
  };
  public facing: Direction = 'down';
  public isAttacking: boolean = false;
  public isHurt: boolean = false;
  public isDead: boolean = false;
  public isInvulnerable: boolean = false;
  public lastSkillTime: number = -9999;

  private walkTimer: number = 0;
  private walkFrameIndex: number = 1;

  public onLevelUp?: (newLevel: number) => void;
  public onDeath?: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, initialStats?: PlayerStats) {
    super(scene, x, y, 'player_down');

    this.stats = initialStats ? JSON.parse(JSON.stringify(initialStats)) : { ...INITIAL_PLAYER_STATS };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set Arcade Physics Body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 24);
    body.setOffset(12, 28);
    body.setCollideWorldBounds(true);
  }

  public updateMovement(dx: number, dy: number, delta: number): void {
    if (this.isDead || this.isHurt || this.isAttacking) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const totalSpeed = this.stats.speed + this.bonusStats.speed;

    if (dx !== 0 || dy !== 0) {
      // Normalize diagonal speed
      const len = Math.sqrt(dx * dx + dy * dy);
      const normX = dx / len;
      const normY = dy / len;

      body.setVelocity(normX * totalSpeed, normY * totalSpeed);

      // Determine facing direction
      if (Math.abs(dx) > Math.abs(dy)) {
        this.facing = dx > 0 ? 'right' : 'left';
      } else {
        this.facing = dy > 0 ? 'down' : 'up';
      }

      // Procedural walking animation toggle
      this.walkTimer += delta;
      if (this.walkTimer > 180) {
        this.walkTimer = 0;
        this.walkFrameIndex = this.walkFrameIndex === 1 ? 2 : 1;
      }
      this.setTexture(`player_walk_${this.facing}_${this.walkFrameIndex}`);
    } else {
      body.setVelocity(0, 0);
      this.setTexture(`player_${this.facing}`);
    }
  }

  public triggerAttackAnimation(): void {
    this.isAttacking = true;
    this.setTexture(`player_attack_${this.facing}`);

    this.scene.time.delayedCall(220, () => {
      this.isAttacking = false;
      this.setTexture(`player_${this.facing}`);
    });
  }

  public takeDamage(damage: number, fromX: number, fromY: number): void {
    if (this.isDead || this.isInvulnerable) return;

    this.stats.hp = Math.max(0, this.stats.hp - damage);
    this.isHurt = true;
    this.isInvulnerable = true;

    // Knockback
    const body = this.body as Phaser.Physics.Arcade.Body;
    const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y);
    body.setVelocity(Math.cos(angle) * 180, Math.sin(angle) * 180);

    // Red tint flash
    this.setTint(0xff7675);

    this.scene.time.delayedCall(160, () => {
      if (!this.isDead) {
        this.isHurt = false;
        body.setVelocity(0, 0);
      }
    });

    // Flickering invulnerability
    const flickerTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      yoyo: true,
      repeat: 4,
      duration: 100,
      onComplete: () => {
        this.alpha = 1;
        this.clearTint();
        this.isInvulnerable = false;
      },
    });

    if (this.stats.hp <= 0) {
      flickerTween.stop();
      this.die();
    }
  }

  public die(): void {
    this.isDead = true;
    this.setTint(0x636e72);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);

    this.scene.tweens.add({
      targets: this,
      angle: 90,
      alpha: 0.7,
      duration: 500,
      onComplete: () => {
        if (this.onDeath) this.onDeath();
      },
    });
  }

  public gainExp(amount: number): void {
    this.stats.exp += amount;

    while (this.stats.exp >= this.stats.requiredExp) {
      this.stats.exp -= this.stats.requiredExp;
      this.levelUp();
    }
  }

  public gainCoins(amount: number): void {
    this.stats.coins += amount;
  }

  public levelUp(): void {
    this.stats.level += 1;
    this.stats.maxHp += 20;
    this.stats.hp = this.stats.maxHp;
    this.stats.maxMp += 10;
    this.stats.mp = this.stats.maxMp;
    this.stats.attack += 3;
    this.stats.defense += 2;
    this.stats.requiredExp = calculateRequiredExp(this.stats.level);

    // Sparkle fireworks effect
    for (let i = 0; i < 16; i++) {
      const p = this.scene.add.sprite(this.x, this.y, 'fx_spark');
      const angle = (i / 16) * Math.PI * 2;
      const targetX = this.x + Math.cos(angle) * 70;
      const targetY = this.y + Math.sin(angle) * 70;

      this.scene.tweens.add({
        targets: p,
        x: targetX,
        y: targetY,
        alpha: 0,
        scale: 1.4,
        duration: 500,
        onComplete: () => p.destroy(),
      });
    }

    if (this.onLevelUp) {
      this.onLevelUp(this.stats.level);
    }
  }
}
