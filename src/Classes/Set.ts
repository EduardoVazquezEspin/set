export class Set{
  private cards: [string, string, string];

  constructor(set: Array<string>){
    if(set.length !== 3)
      throw new Error('Invalid set length');

    this.cards = set as [string, string, string];
  }

  public getCards(){
    return this.cards;
  }

  public isValid(): boolean{
    for(let i = 0; i < 4; i++){
      if(!this.areThreeCharactersAllEqualOrAllDifferent(this.cards[0][i], this.cards[1][i], this.cards[2][i]))
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

  public equals(other: Set){
    if(!other.cards.includes(this.cards[0]))
      return false;
    if(!other.cards.includes(this.cards[1]))
      return false;
    if(!other.cards.includes(this.cards[2]))
      return false;
    return true;
  }
}