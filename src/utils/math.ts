export function calculateRequiredExp(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.35));
}

export function calculateDamage(
  attackerAttack: number,
  targetDefense: number,
  critChance: number = 0.1,
  critMultiplier: number = 1.5,
  bonusMultiplier: number = 1.0
): { damage: number; isCrit: boolean } {
  const baseDiff = attackerAttack * bonusMultiplier - targetDefense;
  const rawDamage = Math.max(1, Math.round(baseDiff));
  
  // Random variance +/- 10%
  const variance = (Math.random() * 0.2 - 0.1) * rawDamage;
  let finalDamage = Math.max(1, Math.round(rawDamage + variance));

  const isCrit = Math.random() < critChance;
  if (isCrit) {
    finalDamage = Math.round(finalDamage * critMultiplier);
  }

  return { damage: finalDamage, isCrit };
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function randomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
