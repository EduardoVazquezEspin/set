import type {Card, IWebComponent} from '../interfaces';

export class CardDisplayer extends HTMLElement implements IWebComponent{
  static observedAttributes = ['card-id', 'vertical', 'highlighted'];

  readonly root: ShadowRoot;
  private img: HTMLImageElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  * {
    margin: 0;
    padding: 0;
  }
  .horizontal {
    width: var(--card-w);
    height: var(--card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
    cursor: pointer;
  }
  .vertical {
    width: var(--mini-card-w);
    height: var(--mini-card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
  }
  [highlighted] {
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
  }

  subscribeToGameManager(){
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

  setOnClick = (onClick: (this: GlobalEventHandlers, ev: MouseEvent) => any) => {
    this.img.onclick = onClick;
  };

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue) return;

    this.setCardSrc();
  }

  private attributeChangedCallbackIsClicked = (card: Card) => {
    if(card.isSelected)
      this.setAttribute('highlighted', 'highlighted');
    else
      this.removeAttribute('highlighted');
  };

  private setCardSrc(){
    const cardId = this.getAttribute('card-id');
    const isVertical = !!this.getAttribute('vertical');
    const isHighlighted = !!this.getAttribute('highlighted');

    if(cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
      return;

    const extendedId = cardId + (isVertical ? 'R' : '');
    const uri = `./img/${extendedId}.png`;
    if(this.img.src !== uri) this.img.src = uri;
    this.img.setAttribute('class', isVertical ? 'vertical' : 'horizontal');
    if(isHighlighted)
      this.img.setAttribute('highlighted', 'highlighted');
    else
      this.img.removeAttribute('highlighted');
    this.img.setAttribute('alt', extendedId);
  }
}

customElements.define('card-displayer', CardDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'card-displayer': CardDisplayer
  }
}