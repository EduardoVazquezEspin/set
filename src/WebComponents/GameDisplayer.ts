import {IWebComponent} from '../interfaces';

export class GameDisplayer extends HTMLElement implements IWebComponent{
  static observedAttributes = ['card-array'];

  private readonly root: ShadowRoot;
  private readonly container: HTMLDivElement;
  private readonly totalSetsP: HTMLParagraphElement;
  private readonly totalFoundP: HTMLParagraphElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  .container {
    display: flex;
    flex-direction: row;
  }
  .menu{
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

    this.totalFoundP = document.createElement('p');
    menu.appendChild(this.totalFoundP);
  }

  connectedCallback(){
    const gameManager = getGameManager();
    const totalSets = gameManager.getSets();
    const foundSets = gameManager.getFoundSets();

    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];

    const unsubTotalSets = totalSets.subscribeAndRun(sets => {
      this.totalSetsP.innerText = `Total sets: ${sets.length}`;
    });

    const unsubFoundSets = foundSets.subscribeAndRun(sets => {
      this.totalFoundP.innerText = `Found sets: ${JSON.stringify(sets.map(it => it.getCards()))}`;
    });

    this.subscriptions.push(unsubTotalSets, unsubFoundSets);
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