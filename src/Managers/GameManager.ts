import {Signal} from '../Classes';
import {Card, Set} from '../interfaces';

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

    const isSet = this.isSet([selectedIds[0], selectedIds[1], selectedIds[2]]);

    selectedCards.forEach(it => it.set({id: it.get().id, isSelected: false}));

    if(!isSet){
      alert('Wrong');
      return;
    }

    // Check if set is already found
    this.foundSets.set([...this.foundSets.get(), selectedIds as Set]);

  }

  private calculateAllSets(){
    const cards = this.cards.get().map(it => it.get());
    const sets: Set[] = [];
    for(let i = 0; i < cards.length - 2; i++){
      for(let j = i + 1; j < cards.length - 1; j++){
        for(let k = j + 1; k < cards.length; k++){
          const set: Set = [cards[i].id, cards[j].id, cards[k].id];
          if(this.isSet(set)){
            sets.push(set);

          }
        }
      }
    }
    this.sets.set(sets);
  }

  private isSet(set: Set): boolean{
    for(let i = 0; i < 4; i++){
      if(!this.areThreeCharactersAllEqualOrAllDifferent(set[0][i], set[1][i], set[2][i]))
        return false;
    }
    return true;
  }

  private areThreeCharactersAllEqualOrAllDifferent(ch1: string, ch2: string, ch3: string){
    if(ch1 === ch2 && ch1 === ch3)
      return true;
    if(ch1 === ch2 || ch1 === ch3 || ch2 === ch3)
      return false;
    return true;
  }
}