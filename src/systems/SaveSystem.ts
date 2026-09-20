import { GameSettings, SaveData } from '../types/game';
import { CURRENT_SAVE_VERSION, DEFAULT_SETTINGS, SAVE_KEY, SETTINGS_KEY } from '../utils/constants';

/**
 * Save System
 * Handles versioned localStorage serialization, deserialization,
 * corrupted data recovery, and game settings persistence.
 */
export class SaveSystem {
  private static instance: SaveSystem;

  private constructor() {}

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  public hasSave(): boolean {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      return data !== null && data.length > 0;
    } catch {
      return false;
    }
  }

  public saveGame(data: SaveData): boolean {
    try {
      const payload: SaveData = {
        ...data,
        version: CURRENT_SAVE_VERSION,
        timestamp: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Failed to save game to localStorage:', e);
      return false;
    }
  }

  public loadGame(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as SaveData;
      if (!parsed || parsed.version !== CURRENT_SAVE_VERSION) {
        console.warn('Incompatible or invalid save data version.');
        return null;
      }

      // Validate core required fields
      if (!parsed.player || !parsed.player.stats || !Array.isArray(parsed.inventory)) {
        console.warn('Corrupted save data structure.');
        return null;
      }

      return parsed;
    } catch (e) {
      console.warn('Error reading save data:', e);
      return null;
    }
  }

  public deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      console.warn('Failed to delete save data:', e);
    }
  }

  public saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  public loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }
}
