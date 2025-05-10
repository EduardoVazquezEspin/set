import {Signal, Set} from '../Classes';
import type {Card} from '../interfaces';

export class GameManager{
  private cards: Signal<Array<Signal<Card>>>;
  private sets: Signal<Array<Set>>;
  private foundSets: Signal<Array<Set>>;

  constructor(){
    this.cards = new Signal<Array<Signal<Card>>>([]);
    this.sets = new Signal<Array<Set>>([]);
    this.foundSets = new Signal<Array<Set>>([]);
    this.initGame();
  }

  private initGame(){
    const cards : Array<Signal<Card>> = [];
    while(cards.length < 12){
      const cardId = this.generateCardId();
      if(cards.every((card) => card.get().id !== cardId)){
        cards.push(new Signal<Card>({id: cardId, isSelected: false}));
      }
    }
    this.cards.set(cards);
    this.calculateAllSets();
    this.foundSets.set([]);
  }

  private generateCardId(){
    return `${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}`;
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
      alert('Wrong');
      return;
    }

    if(this.foundSets.get().some(it => it.equals(set))){
      alert('Already found');
      return;
    }

    this.foundSets.set([...this.foundSets.get(), set]);
  }

  private calculateAllSets(){
    const cards = this.cards.get().map(it => it.get());
    const sets: Set[] = [];
    for(let i = 0; i < cards.length - 2; i++){
      for(let j = i + 1; j < cards.length - 1; j++){
        for(let k = j + 1; k < cards.length; k++){
          const set = new Set([cards[i].id, cards[j].id, cards[k].id]);
          if(set.isValid()){
            sets.push(set);
          }
        }
      }
    }
    this.sets.set(sets);
  }
}