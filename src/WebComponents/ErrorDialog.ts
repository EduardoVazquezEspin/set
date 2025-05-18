import {IWebComponent} from '../interfaces';

export class ErrorDialog extends HTMLElement implements IWebComponent{
  static observedAttributes = ['title', 'message', 'cards'];

  private readonly root: ShadowRoot;
  private readonly dialog: HTMLDialogElement;

  static readonly styles = /* css */`
  * {
    margin: 0;
    padding; 0;

    text-align: center;
  }
  .container{
    position: fixed;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    background-color: #00000050;
  }
  dialog{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .card {
    width: var(--mini-card-w);
    height: var(--mini-card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});

    const container = document.createElement('div');
    container.className = 'container';
    container.addEventListener('click', this.onClick);
    this.root.appendChild(container);

    const styles = document.createElement('style');
    styles.innerText = ErrorDialog.styles;
    this.root.appendChild(styles);

    this.dialog = document.createElement('dialog');
    this.dialog.innerHTML = this.getAttribute('error-message') ?? '';
    this.dialog.setAttribute('open', 'true');
    this.dialog.addEventListener('click', this.onClick);
    this.root.appendChild(this.dialog);
  }

  connectedCallback(): void {
  }

  disconnectedCallback(): void {
  }

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue)
      return;

    this.renderDialog();
  }

  private onClick = () => {
    const errorManager = getErrorManager();
    errorManager.closeErrorDialog();
  };

  private renderDialog(){
    const title = this.getAttribute('title') ?? '';
    const message = this.getAttribute('message') ?? '';
    const cards = this.getAttribute('cards')?.split(',') ?? [];

    this.dialog.innerHTML = /* html */`
      <h1 style="margin-bottom: 15px;">${title}</h1>
      ${cards.map(card => /* html */`
        <img src = './img/${card}R.png' alt='${card}R' class='card'>
        `.replaceAll('\n', '')).join('')}
      <p style="margin-top: 10px;">${message}</p>
    `.replaceAll('\n', '');
  }
}

customElements.define('error-dialog', ErrorDialog);

declare global {
  interface HTMLElementTagNameMap{
    'error-dialog': ErrorDialog
  }
}