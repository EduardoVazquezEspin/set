import {CardImg} from '../Classes';
import type {Card, IWebComponent} from '../interfaces';

export class CardDisplayer extends HTMLElement implements IWebComponent{
  static observedAttributes = ['card-id', 'clickable'];

  readonly root: ShadowRoot;
  private img: HTMLImageElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  * {
    margin: 0;
    padding: 0;
  }
  ${CardImg.CardImgStyle}
  .clicked {
    filter: brightness(50%);
  }
  `.replaceAll('\n', '');

  private static isIdValidRegex = /^[0-2]{4}$/;

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.subscriptions = [];

    const style = document.createElement('style');
    style.innerText = CardDisplayer.styles;
    this.root.appendChild(style);

    this.img = document.createElement('img');
    this.root.appendChild(this.img);
  }

  connectedCallback(){
    const cardId = this.getAttribute('card-id');
    if(cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
      return;
    const gameManager = getGameManager();
    const card = gameManager.getCard(cardId);
    if(card === undefined) return;

    const subs = card.subscribeAndRun(this.attributeChangedCallbackIsClicked);
    this.subscriptions.push(subs);
  }
  disconnectedCallback(): void {
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  private onClick = () => {
    const cardId = this.getAttribute('card-id');
    if(cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
      return;
    const gameManager = getGameManager();
    gameManager.toggleCardSelected(cardId);
  };

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue) return;
    switch(property){
      case 'card-id':
        this.attributeChangedCallbackCardId(newValue);
        break;
      case 'clickable':
        this.attributeChangedCallbackClickable(newValue);
    }
  }

  private attributeChangedCallbackIsClicked = (card: Card) => {
    if(card.isSelected)
      this.img.setAttribute('class', 'card clicked');
    else
      this.img.setAttribute('class', 'card');
  };

  private attributeChangedCallbackCardId(value: string | null){
    if(value === null || !CardDisplayer.isIdValidRegex.test(value))
      return;

    CardImg.UpdateCardImg(this.img, value);
  }

  private attributeChangedCallbackClickable = (value: string | null) => {
    const isClickable = value === 'true';

    if(isClickable){
      this.img.addEventListener('mouseup', this.onClick);
    }
    else{
      this.img.removeEventListener('mouseup', this.onClick);
    }
  };
}

customElements.define('card-displayer', CardDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'card-displayer': CardDisplayer
  }
}