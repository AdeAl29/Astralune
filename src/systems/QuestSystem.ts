import { INITIAL_QUESTS } from '../data/quests';
import { Quest, QuestState } from '../types/game';

export class QuestSystem {
  private quests: Quest[] = [];
  private onQuestChangeCallbacks: ((quest: Quest, event: 'started' | 'updated' | 'completed') => void)[] = [];

  constructor(initialState?: { id: string; state: QuestState; currentCount: number }[]) {
    // Clone initial template
    this.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));

    if (initialState) {
      initialState.forEach((saved) => {
        const match = this.quests.find((q) => q.id === saved.id);
        if (match) {
          match.state = saved.state;
          match.currentCount = saved.currentCount;
        }
      });
    }
  }

  public onQuestChange(cb: (quest: Quest, event: 'started' | 'updated' | 'completed') => void): void {
    this.onQuestChangeCallbacks.push(cb);
  }

  private notify(quest: Quest, event: 'started' | 'updated' | 'completed'): void {
    this.onQuestChangeCallbacks.forEach((cb) => cb(quest, event));
  }

  public getQuests(): Quest[] {
    return this.quests;
  }

  public getQuest(id: string): Quest | undefined {
    return this.quests.find((q) => q.id === id);
  }

  public getActiveQuests(): Quest[] {
    return this.quests.filter((q) => q.state === 'ACTIVE');
  }

  public startQuest(id: string): boolean {
    const quest = this.getQuest(id);
    if (!quest) return false;
    if (quest.state === 'LOCKED' || quest.state === 'AVAILABLE') {
      quest.state = 'ACTIVE';
      this.notify(quest, 'started');
      return true;
    }
    return false;
  }

  public advanceObjective(targetId: string, amount: number = 1): Quest[] {
    const completedQuests: Quest[] = [];

    for (const quest of this.quests) {
      if (quest.state === 'ACTIVE' && quest.targetId === targetId) {
        quest.currentCount = Math.min(quest.requiredCount, quest.currentCount + amount);
        this.notify(quest, 'updated');

        if (quest.currentCount >= quest.requiredCount) {
          quest.state = 'COMPLETED';
          completedQuests.push(quest);
          this.notify(quest, 'completed');
        }
      }
    }

    return completedQuests;
  }

  public completeQuest(id: string): Quest | null {
    const quest = this.getQuest(id);
    if (quest && quest.state === 'ACTIVE') {
      quest.currentCount = quest.requiredCount;
      quest.state = 'COMPLETED';
      this.notify(quest, 'completed');
      return quest;
    }
    return null;
  }

  public isCompleted(id: string): boolean {
    const q = this.getQuest(id);
    return !!q && q.state === 'COMPLETED';
  }

  public getSerialized(): { id: string; state: QuestState; currentCount: number }[] {
    return this.quests.map((q) => ({
      id: q.id,
      state: q.state,
      currentCount: q.currentCount,
    }));
  }
}
