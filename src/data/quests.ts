import { Quest } from '../types/game';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_1',
    title: 'First Steps',
    description: 'You awaken with hazy memories in Whispering Meadow. Seek out Mira, the village guide, for guidance.',
    state: 'ACTIVE',
    objective: 'Speak with Mira in Whispering Meadow',
    currentCount: 0,
    requiredCount: 1,
    targetId: 'mira',
    reward: {
      exp: 50,
      coins: 20,
    },
  },
  {
    id: 'quest_2',
    title: 'Slime Trouble',
    description: 'The meadow trails have been overrun by aggressive slimes. Thin their numbers to keep travelers safe.',
    state: 'LOCKED',
    objective: 'Defeat 5 Meadow Slimes',
    currentCount: 0,
    requiredCount: 5,
    targetId: 'slime',
    reward: {
      exp: 100,
      coins: 50,
      item: {
        itemId: 'health_potion',
        quantity: 2,
      },
    },
  },
  {
    id: 'quest_3',
    title: 'Into the Forest',
    description: 'Elder tells of an ominous presence gathering beyond the eastern gate. Travel into the Moonlit Forest.',
    state: 'LOCKED',
    objective: 'Reach Moonlit Forest',
    currentCount: 0,
    requiredCount: 1,
    targetId: 'moonlit_forest',
    reward: {
      exp: 150,
      coins: 75,
    },
  },
  {
    id: 'quest_4',
    title: 'Ancient Guardian',
    description: 'Deeper inside the Ancient Ruins rests the slumbering titan. Defeat the Ancient Guardian to restore balance.',
    state: 'LOCKED',
    objective: 'Defeat the Ancient Guardian in Ancient Ruins',
    currentCount: 0,
    requiredCount: 1,
    targetId: 'ancient_guardian',
    reward: {
      exp: 500,
      coins: 300,
      item: {
        itemId: 'moon_blade',
        quantity: 1,
      },
    },
  },
];
