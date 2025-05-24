import {Signal, Set, CardId} from '../Classes';
import type {Card} from '../interfaces';
import type {AudioManager} from './AudioManager';
import type {DialogManager} from './DialogManager';
import type {FeaturesManager} from './FeaturesManager';
import {StatsManager} from './StatsManager';

type ErrorType = 'Already Found' | 'Wrong Set'

export class GameManager{
  private cards: Signal<Array<Signal<Card>>>;
  private sets: Signal<Array<Set>>;
  private foundSets: Signal<Array<Set>>;
  private featuresManager: FeaturesManager;
  private audioManager: AudioManager;
  private dialogManager: DialogManager;
  private statsManager: StatsManager;

  constructor(
    featuresManager: FeaturesManager,
    audioManager: AudioManager,
    dialogManager: DialogManager,
    statsManager: StatsManager
  ){
    this.featuresManager = featuresManager;
    this.audioManager = audioManager;
    this.dialogManager = dialogManager;
    this.statsManager = statsManager;

    this.cards = new Signal<Array<Signal<Card>>>([]);
    this.sets = new Signal<Array<Set>>([]);
    this.foundSets = new Signal<Array<Set>>([]);

    this.cards.subscribe(this.updateFeatureFlag);

    const gameId = this.featuresManager.getFeatureValue('GAME-ID').get();
    if(gameId === '')
      this.initGame();
    else{
      const cards = CardId.DeCompress(gameId);
      this.loadGame(cards);
    }
  }

  onWindowLoad(){
  }

  initGame(){
    let cards: string[] = [];
    let solutions: Set[] = [];
    const preventNoSolution: boolean = this.featuresManager.isFeatureEnabled('PREVENT-NO-SOLUTION').get();
    do{
      cards = [];
      while(cards.length < 12){
        const cardId = CardId.Random();
        if(cards.every((id) => id !== cardId)){
          cards.push(cardId);
        }
      }
      solutions = this.calculateAllSets(cards);
    } while(preventNoSolution && solutions.length === 0);
    this.loadGame(cards, solutions);
  }

  private loadGame(cardIds: string[], solutions?: Set[]){
    const cards = cardIds.map(id => new Signal({id, isSelected: false}));
    solutions = solutions ?? this.calculateAllSets(cardIds);
    this.sets.set(solutions);
    this.foundSets.set([]);
    this.cards.set(cards);
    this.statsManager.resetStats();
  }

  getCards(){
    return this.cards;
  }

  getCard(id: string): Signal<Card> | undefined{
    return this.cards.get().find(it => it.get().id === id);
  }

  getSets(): Signal<Set[]>{
    return this.sets;
  }

  getFoundSets(): Signal<Set[]>{
    return this.foundSets;
  }

  toggleCardSelected(cardId: string){
    const card = this.cards.get().find(it => it.get().id === cardId);
    if(card === undefined) return;

    card.set({id: cardId, isSelected: !card.get().isSelected});

    this.checkVictory();
  }

  private async checkVictory(){
    await new Promise((res) => setTimeout(res, 10));
    const selectedCards = this.cards
      .get()
      .filter(it => it.get().isSelected);

    const selectedIds = selectedCards.map(it => it.get().id);

    if(selectedIds.length !== 3)
      return;

    const set = new Set(selectedIds);

    selectedCards.forEach(it => it.set({id: it.get().id, isSelected: false}));

    if(!set.isValid()){
      this.onPlayerError('Wrong Set', selectedIds);
      return;
    }

    if(this.foundSets.get().some(it => it.equals(set))){
      this.onPlayerError('Already Found', selectedIds);
      return;
    }

    this.foundSets.set([...this.foundSets.get(), set]);

    if(this.foundSets.get().length === this.sets.get().length){
      this.onGameEnd();
    }else {
      this.audioManager.play('correct');
    }
  }

  private onGameEnd(){
    this.statsManager.stopTime();
    this.audioManager.play('victory');
  }

  private onPlayerError(error: ErrorType, selectedIds: string[]){
    const title = error === 'Already Found' ? 'Already found' : 'Wrong';
    const message = error === 'Already Found' ? 'You have found these cards already' : 'These cards do not form a set';
    this.audioManager.play('wrong');
    this.dialogManager.displayError(title, message, selectedIds);
    this.statsManager.penalize();
  }

  private calculateAllSets(cardIds: string[]): Set[]{
    const sets: Set[] = [];
    for(let i = 0; i < cardIds.length - 2; i++){
      for(let j = i + 1; j < cardIds.length - 1; j++){
        for(let k = j + 1; k < cardIds.length; k++){
          const set = new Set([cardIds[i], cardIds[j], cardIds[k]]);
          if(set.isValid()){
            sets.push(set);
          }
        }
      }
    }
    return sets;
  }

  private updateFeatureFlag = () => {
    const cardIds = this.cards.get().map(it => it.get().id);
    const code = CardId.Compress(cardIds);
    this.featuresManager.setFeatureValue('GAME-ID', code);
  };
}