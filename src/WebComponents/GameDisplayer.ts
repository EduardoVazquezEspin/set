import {IWebComponent} from '../interfaces';

export class GameDisplayer extends HTMLElement implements IWebComponent{
  private readonly root: ShadowRoot;
  private readonly container: HTMLDivElement;
  private readonly totalSetsP: HTMLParagraphElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  * {
    font-family: MightySouly;
    font-size: 48px;

    margin: 0;
    padding: 0;
  }
  .container {
    display: flex;
    flex-direction: row;
  }
  p {
    margin: 5px;
    width: 100%;
    max-width: calc(3 * var(--mini-card-w));
    text-align: center;
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.subscriptions = [];

    const style = document.createElement('style');
    style.innerText = GameDisplayer.styles;
    this.root.appendChild(style);

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'container');
    this.root.appendChild(this.container);

    const board = document.createElement('board-displayer');
    this.container.appendChild(board);

    const menu = document.createElement('div');
    menu.setAttribute('class', 'menu');
    this.container.appendChild(menu);

    this.totalSetsP = document.createElement('p');
    menu.appendChild(this.totalSetsP);

    const foundSets = document.createElement('found-sets-displayer');
    menu.appendChild(foundSets);

    const playAgainButton = document.createElement('play-again-button');
    menu.appendChild(playAgainButton);
  }

  connectedCallback(){
    const gameManager = getGameManager();
    const totalSets = gameManager.getSets();

    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];

    const unsubTotalSets = totalSets.subscribeAndRun(sets => {
      this.totalSetsP.innerText = `${sets.length} SETS`;
    });

    this.subscriptions.push(unsubTotalSets);
  }

  disconnectedCallback(): void {
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue) return;
  }
}

customElements.define('game-displayer', GameDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'game-displayer': GameDisplayer
  }
}