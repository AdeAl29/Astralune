export type Direction = 'up' | 'down' | 'left' | 'right';

export interface PlayerStats {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  requiredExp: number;
  coins: number;
  critChance: number;
  critMultiplier: number;
}

export type ItemType = 'consumable' | 'weapon' | 'armor' | 'accessory' | 'material';

export interface ItemEffect {
  healHp?: number;
  restoreMp?: number;
  attackBonus?: number;
  defenseBonus?: number;
  critBonus?: number;
  speedBonus?: number;
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  iconKey: string;
  stackable: boolean;
  maxStack?: number;
  value: number;
  effect?: ItemEffect;
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
}

export interface EquipmentSlots {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}

export interface EnemyStats {
  id: string;
  name: string;
  textureKey: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  exp: number;
  coins: number;
  detectionRadius: number;
  attackRadius: number;
  attackCooldown: number;
  isBoss?: boolean;
}

export type QuestState = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';

export interface QuestReward {
  exp: number;
  coins: number;
  item?: {
    itemId: string;
    quantity: number;
  };
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  state: QuestState;
  objective: string;
  currentCount: number;
  requiredCount: number;
  targetId?: string;
  reward: QuestReward;
}

export interface DialogueLine {
  speaker: string;
  portraitKey: string;
  text: string;
  triggerQuestId?: string;
  completeQuestId?: string;
}

export interface MapTransition {
  x: number;
  y: number;
  width: number;
  height: number;
  targetMap: string;
  targetX: number;
  targetY: number;
  label: string;
}

export interface ChestData {
  id: string;
  x: number;
  y: number;
  itemId: string;
  quantity: number;
  isOpened?: boolean;
}

export interface NPCData {
  id: string;
  name: string;
  x: number;
  y: number;
  spriteKey: string;
  portraitKey: string;
  dialogueId: string;
  role: string;
}

export interface EnemySpawnData {
  id: string;
  type: 'slime' | 'shadow_wolf' | 'ancient_guardian';
  x: number;
  y: number;
}

export interface ObstacleData {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tree' | 'rock' | 'house' | 'pillar' | 'wall' | 'water';
  spriteKey?: string;
}

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  theme: 'meadow' | 'forest' | 'ruins';
  bgColor: number;
  ambientLight: number;
  transitions: MapTransition[];
  chests: ChestData[];
  npcs: NPCData[];
  enemies: EnemySpawnData[];
  obstacles: ObstacleData[];
  spawnPoint: { x: number; y: number };
}

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  screenShake: boolean;
  showDamageNumbers: boolean;
  virtualControls: boolean;
}

export interface SaveData {
  version: number;
  timestamp: number;
  player: {
    stats: PlayerStats;
    x: number;
    y: number;
    facing: Direction;
    mapId: string;
  };
  inventory: InventorySlot[];
  equipment: EquipmentSlots;
  quests: {
    id: string;
    state: QuestState;
    currentCount: number;
  }[];
  openedChests: string[];
  defeatedBoss: boolean;
  settings: GameSettings;
}
