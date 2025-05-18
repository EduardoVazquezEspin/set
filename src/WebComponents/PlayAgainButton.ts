import {IWebComponent} from '../interfaces';

export class PlayAgainButton extends HTMLElement implements IWebComponent{
  private readonly root: ShadowRoot;
  private subscriptions: Array<() => void>;
  private button: HTMLButtonElement | undefined;

  private static styles = /* css */`
  * {
    font-family: MightySouly;
    font-size: 32px;

    margin: 0;
    padding: 0;
  }
  .play-button {
    background-color: #3DD1E7;
    border: 0 solid #E5E7EB;
    box-sizing: border-box;
    color: #000000;
    display: flex;
    font-family: MightySouly,ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: 1.25rem;
    font-weight: 700;
    justify-content: center;
    line-height: 1.75rem;
    padding: .75rem 3rem;
    position: relative;
    text-align: center;
    text-decoration: none #000000 solid;
    text-decoration-thickness: auto;
    width: 100%;
    max-width: calc(3 * var(--mini-card-w));
    margin: 11px;
    position: relative;
    cursor: pointer;
    transform: rotate(-2deg);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  
  .play-button:focus {
    outline: 0;
  }
  
  .play-button:after {
    content: '';
    position: absolute;
    border: 1px solid #000000;
    bottom: 4px;
    left: 4px;
    width: calc(100% - 1px);
    height: calc(100% - 1px);
  }
  
  .play-button:hover:after {
    bottom: 2px;
    left: 2px;
  }
  
  @font-face {
    font-family: 'MightySouly';
    src: url('MightySouly-lxggD.woff2') format('woff2');
    src: url('MightySouly-lxggD.ttf') format('ttf');
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});
    this.subscriptions = [];

    const style = document.createElement('style');
    style.innerText = PlayAgainButton.styles;
    this.root.appendChild(style);

    const gameManager = getGameManager();
    const totalSets = gameManager.getSets();

    const foundSetsSignal = gameManager.getFoundSets();
    const unsub = foundSetsSignal.subscribeAndRun((foundSets) =>{
      if(this.button !== undefined){
        this.root.removeChild(this.button);
        this.button = undefined;
      }
      if(foundSets.length === totalSets.get().length)
        this.renderPlayAgainButton();
    });

    this.subscriptions.push(unsub);
  }

  connectedCallback(){

  }

  disconnectedCallback(): void {
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue) return;
  }

  private renderPlayAgainButton = () => {
    this.button = document.createElement('button');
    this.button.innerHTML = 'You won!<br>Start again?';
    this.button.className = 'play-button';
    this.button.onmouseup = () => {
      getGameManager().initGame();
    };
    this.root.appendChild(this.button);
  };
}

customElements.define('play-again-button', PlayAgainButton);

declare global {
  interface HTMLElementTagNameMap{
    'play-again-button': PlayAgainButton;

  }
}