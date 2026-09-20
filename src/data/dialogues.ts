import { DialogueLine } from '../types/game';

export interface DialogueTree {
  [dialogueId: string]: DialogueLine[];
}

export const DIALOGUES: DialogueTree = {
  mira_intro: [
    {
      speaker: 'Mira',
      portraitKey: 'portrait_mira',
      text: 'Aster! You are finally awake. You collapsed near the meadow spring with no memory of how you arrived.',
      completeQuestId: 'quest_1',
    },
    {
      speaker: 'Mira',
      portraitKey: 'portrait_mira',
      text: 'The forest has been strange lately... wild beasts and wandering slimes are growing more aggressive by the hour.',
    },
    {
      speaker: 'Mira',
      portraitKey: 'portrait_mira',
      text: 'Press [W][A][S][D] or Arrow keys to move, [J] to swing your blade, and [K] to unleash Arc Burst!',
    },
    {
      speaker: 'Mira',
      portraitKey: 'portrait_mira',
      text: 'Rowan, the village sentry standing near the northern bridge, urgently needs someone capable. Please talk to him!',
      triggerQuestId: 'quest_2',
    },
  ],
  mira_default: [
    {
      speaker: 'Mira',
      portraitKey: 'portrait_mira',
      text: 'Stay vigilant, Aster! Remember to check your inventory with [I] to equip any gear or use healing potions you find.',
    },
  ],
  rowan_intro: [
    {
      speaker: 'Rowan',
      portraitKey: 'portrait_rowan',
      text: 'Halt, traveler! Beyond this clearing, the meadow is infested with bouncy Meadow Slimes blocking our trade path.',
    },
    {
      speaker: 'Rowan',
      portraitKey: 'portrait_rowan',
      text: 'Could you defeat 5 Meadow Slimes? I will reward you with cold coins and healing draughts from our armory!',
      triggerQuestId: 'quest_2',
    },
  ],
  rowan_complete: [
    {
      speaker: 'Rowan',
      portraitKey: 'portrait_rowan',
      text: 'Impressive swordplay! The meadow paths are clear once again. Here is your well-earned reward!',
      completeQuestId: 'quest_2',
    },
    {
      speaker: 'Rowan',
      portraitKey: 'portrait_rowan',
      text: 'The Village Elder by the east shrine wants to speak with you regarding ancient echoes stirring in the forest.',
      triggerQuestId: 'quest_3',
    },
  ],
  rowan_default: [
    {
      speaker: 'Rowan',
      portraitKey: 'portrait_rowan',
      text: 'Keep your blade sharp and your wits sharper. The creatures only get fiercer the further you wander from town.',
    },
  ],
  elder_intro: [
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'Ah, child of the forgotten realm... The star rune upon your hand confirms what the prophecies foretold.',
      triggerQuestId: 'quest_3',
    },
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'To the east lies the Moonlit Forest, and beyond that, the Ancient Ruins where the slumbering colossus stirs.',
    },
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'Tread carefully in the Moonlit Forest. Shadow wolves stalk the shadows, guarding sacred chests of old.',
    },
  ],
  elder_ruins: [
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'You have pierced the heart of the Moonlit Forest! The final trial awaits in the Ancient Ruins.',
      triggerQuestId: 'quest_4',
    },
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'The Ancient Guardian guards the Realm Core. Defeat it, and the veil of forgotten memories will finally lift!',
    },
  ],
  elder_victory: [
    {
      speaker: 'Elder Oron',
      portraitKey: 'portrait_elder',
      text: 'The skies clear and the stars glow bright! You have defeated the Ancient Guardian and restored the realm!',
    },
  ],
};
