import type {Card} from '../interfaces';

export class BoardDisplayer extends HTMLElement{
  private readonly root: ShadowRoot;
  private readonly container: HTMLDivElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  .container {
    display: grid;
    grid-template-columns: var(--card-w) var(--card-w) var(--card-w);
    grid-gap: 10px;
    padding: 10px;
  
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.subscriptions = [];

    const style = document.createElement('style');
    style.innerText = BoardDisplayer.styles;
    this.root.appendChild(style);

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'container');
    this.root.appendChild(this.container);
  }

  connectedCallback(){
    const gameManager = getGameManager();
    const cards = gameManager.getCards();

    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];

    const unsubscribe = cards.subscribeAndRun(cards => {
      const cardArray = cards.map(it => it.get());
      this.renderAllCards(cardArray);
    });

    this.subscriptions.push(unsubscribe);
  }

  disconnectedCallBack(){
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  private renderAllCards = (cards: Card[]) =>{
    while(this.container.lastChild)
      this.container.removeChild(this.container.lastChild);

    cards.forEach((card) => {
      const cardDisplayer = document.createElement('card-displayer');
      cardDisplayer.setAttribute('card-id', card.id);
      cardDisplayer.setAttribute('clickable', 'true');
      this.container.appendChild(cardDisplayer);
    });
  };
}

customElements.define('board-displayer', BoardDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'board-displayer': BoardDisplayer
  }
}