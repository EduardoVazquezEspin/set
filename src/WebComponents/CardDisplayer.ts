import {Card, IWebComponent} from '../interfaces';

export class CardDisplayer extends HTMLElement implements IWebComponent{
  static observedAttributes = ['card-id', 'clickable'];

  readonly root: ShadowRoot;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  .card {
    width: var(--card-w);
    height: var(--card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
    cursor: pointer;
  }
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

    const img = document.createElement('img');
    img.setAttribute('class', 'card');
    this.root.appendChild(img);
  }

  connectedCallback(){
    const cardId = this.getAttribute('card-id');
    if(cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
      return;
    const gameManager = getGameManager();
    const card = gameManager.getCard(cardId);
    if(card === undefined) return;

    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];

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
    const img = this.root.querySelector('img');
    if(img === null) return;
    if(card.isSelected)
      img.setAttribute('class', 'card clicked');
    else
      img.setAttribute('class', 'card');
  };

  private attributeChangedCallbackCardId(value: string | null){
    if(value === null || !CardDisplayer.isIdValidRegex.test(value))
      return;

    const img = this.root.querySelector('img');
    if(img === null) return;
    img.src = `./public/${value}.png`;
  }

  private attributeChangedCallbackClickable = (value: string | null) => {
    const isClickable = value === 'true';
    const img = this.root.querySelector('img');
    if(img === null)
      return;

    if(isClickable){
      img.addEventListener('click', this.onClick);
    }
    else{
      img.removeEventListener('click', this.onClick);
    }
  };
}

customElements.define('card-displayer', CardDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'card-displayer': CardDisplayer
  }
}