interface CreateCardImgOptions{
    isReversed?: boolean;
  }

export abstract class CardImg{
  static CardImgStyle = /* css */`
  .card {
    width: var(--card-w);
    height: var(--card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
    cursor: pointer;
  }
    `.replaceAll('\n', '');

  static ReversedCardImgStyle = (factor: number = 1) => /* css */`
  .card {
    width: calc(${factor} * var(--mini-card-w));
    height: calc(${factor} * var(--mini-card-h));
    border: 1px black solid;
    border-radius: calc(${factor} * var(--card-border));
    box-shadow: 2px 1px 1px black;
  }
    `.replaceAll('\n', '');

  static CreateCardImg(
    cardId: string,
    {
      isReversed = false
    }: CreateCardImgOptions = {}
  ): HTMLImageElement{
    const img = document.createElement('img');
    CardImg.UpdateCardImg(img, cardId, {isReversed});
    return img;
  }

  static UpdateCardImg(
    img: HTMLImageElement,
    cardId: string,
    {
      isReversed = false
    }: CreateCardImgOptions = {}
  ) {
    const extendedId = cardId + (isReversed ? 'R' : '');
    const uri = `./img/${extendedId}.png`;
    img.src = uri;
    img.setAttribute('class', 'card');
    img.setAttribute('alt', extendedId);
  }
}