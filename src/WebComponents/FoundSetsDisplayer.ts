import {IWebComponent} from '../interfaces';

export class FoundSetsDisplayer extends HTMLElement implements IWebComponent{
  private readonly root: ShadowRoot;
  private readonly container: HTMLDivElement;
  private subscriptions: Array<() => void>;

  private static styles = /* css */`
  .container {
    display: grid;
    grid-template-columns: var(--mini-card-w) var(--mini-card-w) var(--mini-card-w);
    grid-gap: 3px;
    padding: 5px;
  }

  .card {
    width: var(--mini-card-w);
    height: var(--mini-card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
  }

  button{
    width: max-content;
    height: max-content;
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.subscriptions = [];

    const style = document.createElement('style');
    style.innerHTML = FoundSetsDisplayer.styles;
    this.root.appendChild(style);

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'container');
    this.root.appendChild(this.container);
  }

  connectedCallback(): void {
    const gameManager = getGameManager();
    const foundSets = gameManager.getFoundSets();

    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];

    const subs = foundSets.subscribeAndRun((sets) => {
      while(this.container.lastChild !== null)
        this.container.removeChild(this.container.lastChild);

      sets.forEach(set => {
        const cards = set.getCards();
        cards.forEach(card => {
          const cardDisplay = document.createElement('img');
          cardDisplay.src = `./img/${card}R.png`;
          cardDisplay.setAttribute('class', 'card');
          this.container.appendChild(cardDisplay);
        });
      });

      const totalSets = gameManager.getSets().get().length;
      if(sets.length === totalSets){
        const youWonButton = document.createElement('button');
        youWonButton.innerHTML = 'You won!<br>Start again?';
        youWonButton.onclick = () => {
          gameManager.initGame();
        };
        this.container.appendChild(youWonButton);
      }
    });

    this.subscriptions.push(subs);
  }

  disconnectedCallback(): void {
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue !== newValue) return;
  }
}

customElements.define('found-sets-displayer', FoundSetsDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'found-sets-displayer': FoundSetsDisplayer
  }
}