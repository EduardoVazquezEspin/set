import {Signal} from '../Classes';
import {Card} from '../interfaces';

export class GameManager{
  private cards: Signal<Array<Signal<Card>>>;

  constructor(){
    this.cards = new Signal<Array<Signal<Card>>>([]);
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

  toggleCardSelected(cardId: string){
    const card = this.cards.get().find(it => it.get().id === cardId);
    if(card === undefined) return;

    card.set({id: cardId, isSelected: !card.get().isSelected});

    this.checkVictory();
  }

  private async checkVictory(){
    await new Promise((res) => setTimeout(res, 1));
    const selectedIds = this.cards
      .get()
      .map(it => it.get())
      .filter(it => it.isSelected)
      .map(it => it.id);

    if(selectedIds.length !== 3)
      return;

    if(this.isSet(selectedIds[0], selectedIds[1], selectedIds[2]))
      alert('You win!');
    else
      alert('You lose');
  }

  private isSet(card1: string, card2: string, card3: string): boolean{
    for(let i = 0; i < 4; i++){
      if(!this.areThreeCharactersAllEqualOrAllDifferent(card1[i], card2[i], card3[i]))
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