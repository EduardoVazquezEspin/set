export abstract class CardId{
  private static hardcodedConversion = {
    '0120': '!',
    '1122': '$',
    '2221': '%',
    '2222': '-'
  };

  private static reverseHardcodedConversion = {
    '!': '0120',
    '$': '1122',
    '%': '2221',
    '-': '2222'
  };

  private static lowerCaseRegex = /'[A-Z]/ig;

  static Random(){
    return `${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}`;
  }

  private static CompressOne(cardId: string){
    const result = CardId.hardcodedConversion[cardId as keyof typeof CardId.hardcodedConversion];
    if(result !== undefined)
      return result;
    const num = 27 * parseInt(cardId[0]) + 9 * parseInt(cardId[1]) + 3 * parseInt(cardId[2]) + parseInt(cardId[3]);
    const char = String.fromCharCode(num + 48); // '0' is the lowest
    if(char === char.toUpperCase())
      return char;
    return '\'' + char;
  }

  static Compress(cardIds: string[]): string{
    return cardIds.reduce((acc, curr) => acc + this.CompressOne(curr), '');
  }

  private static DeCompressChar(char: string){
    const res = CardId.reverseHardcodedConversion[char as keyof typeof CardId.reverseHardcodedConversion];
    if(res !== undefined)
      return res;
    let x = char.charCodeAt(0) - 48; // '0' is the lowest
    let result = (x % 3).toString();
    x = Math.floor(x / 3);
    result = (x % 3).toString() + result;
    x = Math.floor(x / 3);
    result = (x % 3).toString() + result;
    x = Math.floor(x / 3);
    result = (x % 3).toString() + result;
    return result;
  }

  static DeCompress(str: string): string[]{
    const result = [];
    const lowerStr = str.replaceAll(CardId.lowerCaseRegex, it => it[1].toLowerCase());
    for(let i = 0; i < lowerStr.length; i++){
      result.push(this.DeCompressChar(lowerStr[i]));
    }
    return result;
  }
}