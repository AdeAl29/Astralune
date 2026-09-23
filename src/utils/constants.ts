import { GameSettings, PlayerStats } from '../types/game';

/**
 * Detect if the device is in portrait orientation.
 * This is checked once at boot time to set the game resolution.
 */
export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth;
}

/**
 * Detect if the device supports touch input (mobile/tablet).
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Fixed landscape widescreen resolution (16:9) like Mobile Legends / MOBA
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const IS_PORTRAIT = false;
export const IS_TOUCH = isTouchDevice();

export const TILE_SIZE = 48;

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: 'Aster',
  level: 1,
  hp: 100,
  maxHp: 100,
  mp: 100,
  maxMp: 100,
  attack: 15,
  defense: 5,
  speed: 220,
  exp: 0,
  requiredExp: 100,
  coins: 50,
  critChance: 0.10,
  critMultiplier: 1.5,
};

export const ARC_BURST_CONFIG = {
  name: 'Arc Burst',
  manaCost: 25,
  cooldownMs: 3500,
  radius: 125,
  damageMultiplier: 2.2,
};

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  screenShake: true,
  showDamageNumbers: true,
  virtualControls: IS_TOUCH, // Auto-enable on touch devices
};

export const SAVE_KEY = 'echoes_rpg_save_v1';
export const SETTINGS_KEY = 'echoes_rpg_settings_v1';
export const CURRENT_SAVE_VERSION = 1;

export const COLORS = {
  primary: 0x6c5ce7,
  accent: 0x00cec9,
  gold: 0xfdcb6e,
  healthRed: 0xff4757,
  manaBlue: 0x2ed573,
  expYellow: 0xeccc68,
  panelBg: 0x131124,
  panelBorder: 0x3d3567,
  textWhite: '#ffffff',
  textMuted: '#a4b0be',
  textGold: '#ffd32a',
  textGreen: '#2ed573',
  textRed: '#ff4757',
  textCyan: '#00d2d3',
};
