import { ITEMS } from '../data/items';
import { EquipmentSlots, InventorySlot, PlayerStats } from '../types/game';

export class InventorySystem {
  private slots: InventorySlot[] = [];
  private equipment: EquipmentSlots = {
    weapon: null,
    armor: null,
    accessory: null,
  };
  private maxSlots: number = 24;
  private onChangeCallbacks: (() => void)[] = [];

  constructor(initialSlots?: InventorySlot[], initialEquipment?: EquipmentSlots) {
    if (initialSlots) {
      this.slots = JSON.parse(JSON.stringify(initialSlots));
    } else {
      // Default starting inventory
      this.slots = [
        { itemId: 'health_potion', quantity: 3 },
        { itemId: 'mana_potion', quantity: 2 },
        { itemId: 'forest_herb', quantity: 2 },
      ];
    }
    if (initialEquipment) {
      this.equipment = { ...initialEquipment };
    }
  }

  public onChange(cb: () => void): void {
    this.onChangeCallbacks.push(cb);
  }

  private notify(): void {
    this.onChangeCallbacks.forEach((cb) => cb());
  }

  public getSlots(): InventorySlot[] {
    return this.slots;
  }

  public getEquipment(): EquipmentSlots {
    return this.equipment;
  }

  public addItem(itemId: string, quantity: number = 1): boolean {
    const def = ITEMS[itemId];
    if (!def) return false;

    if (def.stackable) {
      const existing = this.slots.find((s) => s.itemId === itemId);
      if (existing) {
        existing.quantity += quantity;
        this.notify();
        return true;
      }
    }

    if (this.slots.length >= this.maxSlots) {
      return false; // Inventory full
    }

    this.slots.push({ itemId, quantity });
    this.notify();
    return true;
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const idx = this.slots.findIndex((s) => s.itemId === itemId);
    if (idx === -1) return false;

    if (this.slots[idx].quantity > quantity) {
      this.slots[idx].quantity -= quantity;
    } else {
      this.slots.splice(idx, 1);
    }
    this.notify();
    return true;
  }

  public hasItem(itemId: string, quantity: number = 1): boolean {
    const found = this.slots.find((s) => s.itemId === itemId);
    return !!found && found.quantity >= quantity;
  }

  public useConsumable(itemId: string, player: PlayerStats): boolean {
    const def = ITEMS[itemId];
    if (!def || def.type !== 'consumable') return false;

    let applied = false;
    if (def.effect?.healHp && player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + def.effect.healHp);
      applied = true;
    }
    if (def.effect?.restoreMp && player.mp < player.maxMp) {
      player.mp = Math.min(player.maxMp, player.mp + def.effect.restoreMp);
      applied = true;
    }

    if (applied) {
      this.removeItem(itemId, 1);
      return true;
    }
    return false;
  }

  public equip(itemId: string): boolean {
    const def = ITEMS[itemId];
    if (!def) return false;

    if (def.type === 'weapon') {
      const current = this.equipment.weapon;
      this.equipment.weapon = itemId;
      this.removeItem(itemId, 1);
      if (current) this.addItem(current, 1);
      this.notify();
      return true;
    } else if (def.type === 'armor') {
      const current = this.equipment.armor;
      this.equipment.armor = itemId;
      this.removeItem(itemId, 1);
      if (current) this.addItem(current, 1);
      this.notify();
      return true;
    } else if (def.type === 'accessory') {
      const current = this.equipment.accessory;
      this.equipment.accessory = itemId;
      this.removeItem(itemId, 1);
      if (current) this.addItem(current, 1);
      this.notify();
      return true;
    }
    return false;
  }

  public unequip(slot: keyof EquipmentSlots): boolean {
    const current = this.equipment[slot];
    if (!current) return false;

    if (this.slots.length >= this.maxSlots) {
      return false; // No room to unequip
    }

    this.equipment[slot] = null;
    this.addItem(current, 1);
    this.notify();
    return true;
  }

  public getEquipmentBonus(): {
    attack: number;
    defense: number;
    critChance: number;
    speed: number;
  } {
    let attack = 0;
    let defense = 0;
    let critChance = 0;
    let speed = 0;

    const slots: (string | null)[] = [this.equipment.weapon, this.equipment.armor, this.equipment.accessory];
    for (const id of slots) {
      if (!id) continue;
      const def = ITEMS[id];
      if (def && def.effect) {
        if (def.effect.attackBonus) attack += def.effect.attackBonus;
        if (def.effect.defenseBonus) defense += def.effect.defenseBonus;
        if (def.effect.critBonus) critChance += def.effect.critBonus;
        if (def.effect.speedBonus) speed += def.effect.speedBonus;
      }
    }

    return { attack, defense, critChance, speed };
  }
}
