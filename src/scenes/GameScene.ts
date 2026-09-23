import * as Phaser from 'phaser';
import { DIALOGUES } from '../data/dialogues';
import { ITEMS } from '../data/items';
import { MAPS } from '../data/maps';
import { BossEnemy } from '../entities/BossEnemy';
import { Chest } from '../entities/Chest';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { Player } from '../entities/Player';
import { AudioSystem } from '../systems/AudioSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { InputSystem } from '../systems/InputSystem';
import { InventorySystem } from '../systems/InventorySystem';
import { QuestSystem } from '../systems/QuestSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { GameSettings, MapData, SaveData } from '../types/game';
import { ARC_BURST_CONFIG, DEFAULT_SETTINGS } from '../utils/constants';
import { UIScene } from './UIScene';

export class GameScene extends Phaser.Scene {
  public player!: Player;
  public inputSystem!: InputSystem;
  public combatSystem!: CombatSystem;
  public inventorySystem!: InventorySystem;
  public questSystem!: QuestSystem;
  public audio: AudioSystem;
  public saveSystem: SaveSystem;
  public settings: GameSettings;

  public currentMapId: string = 'whispering_meadow';
  private currentMap!: MapData;

  public enemies: Enemy[] = [];
  public npcs: NPC[] = [];
  public chests: Chest[] = [];
  private obstaclesGroup!: Phaser.Physics.Arcade.StaticGroup;
  private transitionZones: { rect: Phaser.Geom.Rectangle; targetMap: string; targetX: number; targetY: number }[] = [];

  private openedChests: Set<string> = new Set();
  public defeatedBoss: boolean = false;
  private isTransitioning: boolean = false;

  private uiScene!: UIScene;

  constructor() {
    super('GameScene');
    this.audio = AudioSystem.getInstance();
    this.saveSystem = SaveSystem.getInstance();
    this.settings = this.saveSystem.loadSettings();
  }

  public init(data?: { loadFromSave?: SaveData | null; mapId?: string; targetX?: number; targetY?: number; respawn?: boolean }): void {
    const safeData = data || {};
    this.isTransitioning = false;
    this.settings = this.saveSystem.loadSettings();

    if (safeData.loadFromSave) {
      const save = safeData.loadFromSave;
      this.currentMapId = save.player.mapId || 'whispering_meadow';
      this.inventorySystem = new InventorySystem(save.inventory, save.equipment);
      this.questSystem = new QuestSystem(save.quests);
      this.openedChests = new Set(save.openedChests || []);
      this.defeatedBoss = !!save.defeatedBoss;
    } else {
      if (!this.inventorySystem) this.inventorySystem = new InventorySystem();
      if (!this.questSystem) this.questSystem = new QuestSystem();
      if (safeData.mapId) this.currentMapId = safeData.mapId;
    }
  }

  public create(data?: { loadFromSave?: SaveData | null; targetX?: number; targetY?: number; respawn?: boolean }): void {
    const safeData = data || {};

    // Load Map Config
    this.currentMap = MAPS[this.currentMapId] || MAPS.whispering_meadow;

    // Set World and Camera Bounds
    this.physics.world.setBounds(0, 0, this.currentMap.width, this.currentMap.height);
    this.cameras.main.setBounds(0, 0, this.currentMap.width, this.currentMap.height);

    // Play map BGM
    this.audio.playBgm(this.currentMap.theme);

    // Systems
    this.inputSystem = new InputSystem(this);
    this.combatSystem = new CombatSystem(this, this.settings);

    // Render environment tiles & obstacles
    this.buildEnvironment();

    // Spawn Player
    let spawnX = this.currentMap.spawnPoint.x;
    let spawnY = this.currentMap.spawnPoint.y;

    if (safeData.targetX && safeData.targetY) {
      spawnX = safeData.targetX;
      spawnY = safeData.targetY;
    } else if (safeData.loadFromSave) {
      spawnX = safeData.loadFromSave.player.x;
      spawnY = safeData.loadFromSave.player.y;
    }

    const initialStats = safeData.loadFromSave ? safeData.loadFromSave.player.stats : undefined;
    this.player = new Player(this, spawnX, spawnY, initialStats);

    if (safeData.respawn) {
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.mp = this.player.stats.maxMp;
    }

    // Camera follow player
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Sync equipment bonuses to player stats
    this.syncStats();

    // Spawn interactables & monsters
    this.spawnNPCs();
    this.spawnChests();
    this.spawnEnemies();
    this.setupTransitions();

    // Register Collisions
    this.physics.add.collider(this.player, this.obstaclesGroup);
    this.physics.add.collider(this.enemies, this.obstaclesGroup);
    this.npcs.forEach((npc) => {
      this.physics.add.collider(this.player, npc);
      this.physics.add.collider(this.enemies, npc);
    });
    this.chests.forEach((chest) => {
      this.physics.add.collider(this.player, chest);
    });

    // Player Level-Up & Death Listeners
    this.player.onLevelUp = (lvl) => {
      this.audio.playLevelUp();
      if (this.uiScene?.notifications) {
        this.uiScene.notifications.show(`LEVEL UP! REACHED LEVEL ${lvl}`, '#ffd32a', 'HP & MP restored! Stats increased!');
      }
      this.syncStats();
    };

    this.player.onDeath = () => {
      this.audio.playHit();
      this.scene.launch('GameOverScene', { mapId: this.currentMapId });
      this.scene.pause('GameScene');
    };

    // Quest progression listener
    this.questSystem.onQuestChange((quest, event) => {
      if (event === 'started') {
        if (this.uiScene?.notifications) {
          this.uiScene.notifications.show(`NEW QUEST: ${quest.title}`, '#00cec9', quest.objective);
        }
      } else if (event === 'completed') {
        this.audio.playLevelUp();
        if (this.uiScene?.notifications) {
          this.uiScene.notifications.show(`QUEST COMPLETED: ${quest.title}!`, '#2ed573', `+${quest.reward.exp} EXP, +${quest.reward.coins} Coins`);
        }
        this.player.gainExp(quest.reward.exp);
        this.player.gainCoins(quest.reward.coins);
        if (quest.reward.item) {
          this.inventorySystem.addItem(quest.reward.item.itemId, quest.reward.item.quantity);
        }
        this.syncStats();
      }
      this.updateActiveQuestTracker();
    });

    // Launch UIScene AFTER everything else is ready
    // Stop any previous UIScene first
    if (this.scene.isActive('UIScene')) {
      this.scene.stop('UIScene');
    }

    // Get UIScene reference and listen for its ready event
    this.uiScene = this.scene.get('UIScene') as UIScene;
    this.uiScene.events.once('ui-ready', () => {
      this.updateActiveQuestTracker();
    });

    this.scene.launch('UIScene');
  }

  private buildEnvironment(): void {
    // Map Ground Graphics
    const groundGfx = this.add.graphics();
    groundGfx.fillStyle(this.currentMap.bgColor);
    groundGfx.fillRect(0, 0, this.currentMap.width, this.currentMap.height);

    // Decorative ground patches (cobblestone trails & grass variations)
    groundGfx.fillStyle(this.currentMap.theme === 'meadow' ? 0x3d662c : this.currentMap.theme === 'forest' ? 0x141b2c : 0x1b1625);
    for (let x = 0; x < this.currentMap.width; x += 120) {
      for (let y = 0; y < this.currentMap.height; y += 120) {
        if ((x + y) % 240 === 0) {
          groundGfx.fillCircle(x + 40, y + 40, 24);
        }
      }
    }

    // Cobblestone Main Path
    if (this.currentMap.theme === 'meadow') {
      groundGfx.fillStyle(0x7f8c8d, 0.4);
      groundGfx.fillRect(350, 600, 1650, 50);
      groundGfx.fillRect(1000, 420, 50, 230);
    } else if (this.currentMap.theme === 'forest') {
      groundGfx.fillStyle(0x2f3640, 0.5);
      groundGfx.fillRect(40, 680, 2100, 60);
    } else if (this.currentMap.theme === 'ruins') {
      // Runic circle in center of boss arena
      groundGfx.lineStyle(4, 0x00cec9, 0.4);
      groundGfx.strokeCircle(1000, 700, 260);
      groundGfx.strokeCircle(1000, 700, 140);
    }

    // Static Obstacles Group
    this.obstaclesGroup = this.physics.add.staticGroup();

    this.currentMap.obstacles.forEach((obs) => {
      if (obs.spriteKey) {
        const sprite = this.add.sprite(obs.x, obs.y, obs.spriteKey);
        this.obstaclesGroup.add(sprite);
        const b = sprite.body as Phaser.Physics.Arcade.StaticBody;
        b.setSize(obs.width, obs.height * 0.7);
        b.setOffset(0, obs.height * 0.3);
      } else if (obs.type === 'tree') {
        const treeKey = this.currentMap.theme === 'meadow' ? 'prop_tree_meadow' : 'prop_tree_forest';
        const sprite = this.add.sprite(obs.x, obs.y, treeKey);
        this.obstaclesGroup.add(sprite);
        const b = sprite.body as Phaser.Physics.Arcade.StaticBody;
        b.setSize(40, 30);
        b.setOffset(28, 70);
      } else if (obs.type === 'rock') {
        const sprite = this.add.sprite(obs.x, obs.y, 'prop_rock');
        this.obstaclesGroup.add(sprite);
        const b = sprite.body as Phaser.Physics.Arcade.StaticBody;
        b.setSize(50, 36);
        b.setOffset(7, 12);
      } else if (obs.type === 'pillar') {
        const sprite = this.add.sprite(obs.x, obs.y, 'prop_pillar');
        this.obstaclesGroup.add(sprite);
        const b = sprite.body as Phaser.Physics.Arcade.StaticBody;
        b.setSize(38, 30);
        b.setOffset(16, 70);
      } else if (obs.type === 'wall') {
        const sprite = this.add.sprite(obs.x, obs.y, 'prop_wall');
        this.obstaclesGroup.add(sprite);
        const b = sprite.body as Phaser.Physics.Arcade.StaticBody;
        b.setSize(obs.width, obs.height);
      }
    });
  }

  private spawnNPCs(): void {
    this.npcs = [];
    this.currentMap.npcs.forEach((data) => {
      const npc = new NPC(this, data);
      this.npcs.push(npc);
    });
  }

  private spawnChests(): void {
    this.chests = [];
    this.currentMap.chests.forEach((data) => {
      const isAlreadyOpened = this.openedChests.has(data.id);
      const chest = new Chest(this, data, isAlreadyOpened);
      this.chests.push(chest);
    });
  }

  private spawnEnemies(): void {
    this.enemies = [];
    this.currentMap.enemies.forEach((data) => {
      if (data.type === 'ancient_guardian') {
        if (this.defeatedBoss) return; // Don't respawn defeated boss!

        const boss = new BossEnemy(this, data.id, data.x, data.y);
        boss.onAttackPlayer = () => this.combatSystem.performEnemyAttack(boss, this.player);
        boss.onPhaseChange = (phase) => {
          this.uiScene?.showBossBar('ANCIENT GUARDIAN', boss.stats.hp, boss.stats.maxHp, phase);
          this.uiScene?.notifications?.show(`ANCIENT GUARDIAN ENTERED PHASE ${phase}!`, '#ff3838', 'Watch out for heavy shockwaves!');
        };
        boss.onDefeated = () => {
          this.audio.playLevelUp();
          this.defeatedBoss = true;
          this.player.gainExp(boss.stats.exp);
          this.player.gainCoins(boss.stats.coins);
          this.inventorySystem.addItem('guardian_core', 1);
          this.questSystem.advanceObjective('ancient_guardian', 1);
          this.uiScene?.hideBossBar();

          this.saveCurrentState();

          this.time.delayedCall(800, () => {
            this.scene.launch('VictoryScene');
            this.scene.pause('GameScene');
          });
        };
        this.enemies.push(boss);
        this.uiScene?.showBossBar('ANCIENT GUARDIAN', boss.stats.hp, boss.stats.maxHp, 1);
      } else {
        const enemy = new Enemy(this, data.id, data.type, data.x, data.y);
        enemy.onAttackPlayer = () => this.combatSystem.performEnemyAttack(enemy, this.player);
        enemy.onDefeated = () => {
          this.audio.playCoin();
          this.player.gainExp(enemy.stats.exp);
          this.player.gainCoins(enemy.stats.coins);

          // Check quest objective advancement
          if (enemy.enemyType === 'slime') {
            this.questSystem.advanceObjective('slime', 1);
          } else if (enemy.enemyType === 'shadow_wolf') {
            this.questSystem.advanceObjective('shadow_wolf', 1);
          }

          // Random item drop chance (20%)
          if (Math.random() < 0.25) {
            const dropId = enemy.enemyType === 'slime' ? 'forest_herb' : 'health_potion';
            this.inventorySystem.addItem(dropId, 1);
            const def = ITEMS[dropId];
            this.combatSystem.showDamageNumber(enemy.x, enemy.y - 15, 1, '#ffd32a', false);
            this.uiScene?.notifications?.show(`Looted ${def.name}!`, '#ffd32a');
          }

          this.syncStats();
        };
        this.enemies.push(enemy);
      }
    });
  }

  private setupTransitions(): void {
    this.transitionZones = [];
    this.currentMap.transitions.forEach((t) => {
      const rect = new Phaser.Geom.Rectangle(t.x, t.y, t.width, t.height);
      this.transitionZones.push({
        rect,
        targetMap: t.targetMap,
        targetX: t.targetX,
        targetY: t.targetY,
      });

      // Glowing Portal Aura Graphic
      const portalGfx = this.add.graphics();
      portalGfx.fillStyle(0x6c5ce7, 0.3);
      portalGfx.fillRoundedRect(t.x + 10, t.y + 10, t.width - 20, t.height - 20, 16);
      portalGfx.lineStyle(3, 0x00cec9, 0.85);
      portalGfx.strokeRoundedRect(t.x + 10, t.y + 10, t.width - 20, t.height - 20, 16);

      // Portal Pulse Tween
      this.tweens.add({
        targets: portalGfx,
        alpha: 0.35,
        yoyo: true,
        repeat: -1,
        duration: 800,
        ease: 'Sine.easeInOut',
      });

      // Visual indicator label with glowing badge
      const tag = this.add
        .text(t.x + t.width / 2, t.y + t.height / 2, t.label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#ffd32a',
          stroke: '#000000',
          strokeThickness: 3,
          backgroundColor: '#100d28ee',
          padding: { x: 12, y: 7 },
        })
        .setOrigin(0.5);

      this.tweens.add({
        targets: tag,
        y: tag.y - 6,
        yoyo: true,
        repeat: -1,
        duration: 900,
        ease: 'Sine.easeInOut',
      });
    });

    // Helpful road signpost in Whispering Meadow near start road
    if (this.currentMapId === 'whispering_meadow') {
      const signBg = this.add.rectangle(560, 565, 230, 32, 0x191030, 0.85);
      signBg.setStrokeStyle(1.5, 0x00cec9);
      const signText = this.add.text(560, 565, '➔ Follow East Road to Forest', {
        fontFamily: 'Outfit, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#00cec9',
      }).setOrigin(0.5);
    }
  }

  public override update(time: number, delta: number): void {
    if (this.isTransitioning) return;

    const input = this.inputSystem.getState();

    // Check Pause
    if (input.pausePressed) {
      this.pauseGame();
      return;
    }

    // Check Inventory Shortcut [I]
    if (input.inventoryPressed) {
      this.openInventory();
      return;
    }

    // Check Debug Keys
    this.handleDebugInputs();

    // If dialogue is active, forward advance key
    if (this.uiScene?.dialogBox?.isOpen()) {
      if (input.dialogueAdvancePressed) {
        this.uiScene.dialogBox.advance();
      }
      this.player.updateMovement(0, 0, delta);
      return;
    }

    // Player Movement
    this.player.updateMovement(input.dx, input.dy, delta);

    // Basic Attack [J]
    if (input.attackPressed && !this.player.isAttacking && !this.player.isDead) {
      this.player.triggerAttackAnimation();
      this.combatSystem.performPlayerMelee(this.player, this.enemies);
      this.syncStats();
    }

    // Special Skill Arc Burst [K]
    if (input.skillPressed && !this.player.isDead) {
      const elapsed = time - this.player.lastSkillTime;
      if (elapsed >= ARC_BURST_CONFIG.cooldownMs) {
        const success = this.combatSystem.performPlayerArcBurst(this.player, this.enemies);
        if (success) {
          this.player.lastSkillTime = time;
          this.syncStats();
        }
      }
    }

    // Interaction [E]
    if (input.interactPressed && !this.player.isDead) {
      this.handleInteract();
    }

    // Update NPCs & Chests proximity
    this.npcs.forEach((npc) => npc.updateInteraction(this.player));
    this.chests.forEach((chest) => chest.updateInteraction(this.player));

    // Update Enemy AIs
    this.enemies.forEach((enemy) => {
      if (enemy.active && !enemy.isDead) {
        enemy.updateAI(this.player, time, delta);
      }
    });

    // Check Map Transitions
    this.checkTransitions();

    // Update HUD
    if (this.uiScene && this.uiScene.scene.isActive()) {
      this.uiScene.updateHUD(this.player.stats, this.player.stats.coins);
    }
  }

  public handleInteract(): void {
    // 1. Check nearby Chests
    for (const chest of this.chests) {
      if (chest.canInteract()) {
        const loot = chest.open();
        if (loot) {
          this.audio.playChestOpen();
          this.inventorySystem.addItem(loot.itemId, loot.quantity);
          this.openedChests.add(chest.chestData.id);
          const itemDef = ITEMS[loot.itemId];
          this.uiScene?.notifications?.show(`Found ${loot.quantity}x ${itemDef ? itemDef.name : loot.itemId}!`, '#ffd32a');
          this.syncStats();
          return;
        }
      }
    }

    // 2. Check nearby NPCs
    for (const npc of this.npcs) {
      if (npc.canInteract()) {
        this.openNPCDialogue(npc);
        return;
      }
    }
  }

  private openNPCDialogue(npc: NPC): void {
    let lines = DIALOGUES[npc.npcData.dialogueId] || DIALOGUES.mira_default;

    // Dynamic dialogue conditions based on quest state
    if (npc.npcData.id === 'rowan') {
      const q2 = this.questSystem.getQuest('quest_2');
      if (q2 && q2.state === 'COMPLETED') {
        lines = DIALOGUES.rowan_default;
      } else if (q2 && q2.currentCount >= q2.requiredCount) {
        lines = DIALOGUES.rowan_complete;
      }
    } else if (npc.npcData.id === 'elder') {
      if (this.defeatedBoss) {
        lines = DIALOGUES.elder_victory;
      } else if (this.currentMapId === 'ancient_ruins' || this.questSystem.isCompleted('quest_3')) {
        lines = DIALOGUES.elder_ruins;
      }
    }

    if (!this.uiScene?.dialogBox) return;
    this.uiScene.dialogBox.show(lines, (lastLine) => {
      if (lastLine) {
        if (lastLine.completeQuestId) {
          this.questSystem.completeQuest(lastLine.completeQuestId);
        }
        if (lastLine.triggerQuestId) {
          this.questSystem.startQuest(lastLine.triggerQuestId);
        }
      }
    });
  }

  private checkTransitions(): void {
    const playerBounds = this.player.getBounds();

    for (const t of this.transitionZones) {
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, t.rect)) {
        this.transitionToMap(t.targetMap, t.targetX, t.targetY);
        break;
      }
    }
  }

  public transitionToMap(targetMap: string, targetX: number, targetY: number): void {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.audio.playUiClick();

    // Check Quest 3 (Reach Moonlit Forest)
    if (targetMap === 'moonlit_forest') {
      this.questSystem.advanceObjective('moonlit_forest', 1);
    }

    this.currentMapId = targetMap;

    // Auto-save on map transition with new map and coordinates
    this.saveCurrentState(targetMap, targetX, targetY);

    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.time.delayedCall(350, () => {
      this.scene.restart({ mapId: targetMap, targetX, targetY });
    });
  }

  public syncStats(): void {
    const bonus = this.inventorySystem.getEquipmentBonus();
    this.player.bonusStats = bonus;
  }

  private updateActiveQuestTracker(): void {
    const active = this.questSystem.getActiveQuests();
    if (active.length > 0) {
      const q = active[0];
      this.uiScene.updateQuestTracker(q.title, q.objective, q.currentCount, q.requiredCount);
    } else {
      this.uiScene.updateQuestTracker('All Quests Complete', 'Explore the forgotten realm freely!', 0, 0);
    }
  }

  public pauseGame(): void {
    this.audio.playUiClick();
    this.scene.launch('PauseScene');
    this.scene.pause('GameScene');
  }

  public openInventory(): void {
    this.audio.playUiClick();
    this.scene.launch('InventoryScene');
  }

  public openQuests(): void {
    this.audio.playUiClick();
    this.scene.launch('QuestScene');
  }

  public saveCurrentState(overrideMapId?: string, overrideX?: number, overrideY?: number): boolean {
    const data: SaveData = {
      version: 1,
      timestamp: Date.now(),
      player: {
        stats: this.player.stats,
        x: overrideX !== undefined ? Math.round(overrideX) : Math.round(this.player.x),
        y: overrideY !== undefined ? Math.round(overrideY) : Math.round(this.player.y),
        facing: this.player.facing,
        mapId: overrideMapId || this.currentMapId,
      },
      inventory: this.inventorySystem.getSlots(),
      equipment: this.inventorySystem.getEquipment(),
      quests: this.questSystem.getSerialized(),
      openedChests: Array.from(this.openedChests),
      defeatedBoss: this.defeatedBoss,
      settings: this.settings,
    };

    const ok = this.saveSystem.saveGame(data);
    if (ok && !overrideMapId) {
      this.uiScene?.notifications?.show('Game Saved!', '#2ed573');
    }
    return ok;
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    this.combatSystem.updateSettings(settings);
  }

  private handleDebugInputs(): void {
    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF1)) {
      // Toggle physics debug
      const isDebug = !this.physics.world.drawDebug;
      this.physics.world.drawDebug = isDebug;
      if (!isDebug && this.physics.world.debugGraphic) {
        this.physics.world.debugGraphic.clear();
      }
      this.uiScene?.notifications?.show(`[DEBUG] Colliders ${isDebug ? 'ON' : 'OFF'}`, '#ffd32a');
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF2)) {
      this.player.gainExp(100);
      this.uiScene?.notifications?.show('[DEBUG] +100 EXP', '#ffd32a');
      this.syncStats();
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF3)) {
      this.player.gainCoins(100);
      this.uiScene?.notifications?.show('[DEBUG] +100 Coins', '#ffd32a');
      this.syncStats();
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF4)) {
      // Cycle maps
      const nextMap = this.currentMapId === 'whispering_meadow' ? 'moonlit_forest' : this.currentMapId === 'moonlit_forest' ? 'ancient_ruins' : 'whispering_meadow';
      this.transitionToMap(nextMap, 300, 400);
      this.uiScene?.notifications?.show(`[DEBUG] Teleported to ${nextMap}`, '#ffd32a');
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF5)) {
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.mp = this.player.stats.maxMp;
      this.uiScene?.notifications?.show('[DEBUG] Full HP & MP Restored', '#2ed573');
      this.syncStats();
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputSystem.keyF6)) {
      const e = new Enemy(this, `debug_slime_${Date.now()}`, 'slime', this.player.x + 80, this.player.y);
      this.enemies.push(e);
      this.physics.add.collider(e, this.obstaclesGroup);
      this.uiScene?.notifications?.show('[DEBUG] Spawned Slime', '#ffd32a');
    }
  }
}
