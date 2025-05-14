export abstract class CardId{
  static Random(){
    return `${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}`;
  }

  private static CompressOne(cardId: string){
    const num1 = 3 * parseInt(cardId[0]) + parseInt(cardId[1]);
    const num2 = 3 * parseInt(cardId[2]) + parseInt(cardId[3]);
    return String.fromCharCode(num1 + 49) + String.fromCharCode(num2 + 49); // '1' is the lowest
  }

  static Compress(cardIds: string[]): string{
    return cardIds.reduce((acc, curr) => acc + this.CompressOne(curr), '');
  }

  private static DeCompressChar(char: string){
    let x = char.charCodeAt(0) - 49; // '1' is the lowest
    let result = (x % 3).toString();
    x = Math.floor(x / 3);
    result = (x % 3).toString() + result;
    return result;
  }

  static DeCompress(str: string): string[]{
    const result = [];
    for(let i = 0; i < str.length / 2; i++){
      result.push(this.DeCompressChar(str[2 * i]) + this.DeCompressChar(str[2 * i + 1]));
    }
    return result;
  }
}