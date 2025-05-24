import {IWebComponent} from '../interfaces';

export class CustomDialog extends HTMLElement implements IWebComponent{
  static observedAttributes = ['title', 'message', 'cards', 'border-color'];

  private readonly root: ShadowRoot;
  private readonly dialog: HTMLDialogElement;

  static readonly styles = /* css */`
  * {
    margin: 0;
    padding; 0;

    text-align: center;
    font-family: MightySouly;
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
    border-radius: 10px;
    box-shadow: 0 15px 20px -10px rgba(1, 1, 1, 0.1);
  }
  h1 {
    font-size: 48px;
  }
  p {
    font-size: 28px;
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

    const container = document.createElement('div');
    container.className = 'container';
    container.addEventListener('click', this.onClick);
    this.root.appendChild(container);

    const styles = document.createElement('style');
    styles.innerText = CustomDialog.styles;
    this.root.appendChild(styles);

    this.dialog = document.createElement('dialog');
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
    const DialogManager = getDialogManager();
    DialogManager.closeCustomDialog();
  };

  private renderDialog(){
    while(this.dialog.lastElementChild !== null)
      this.dialog.removeChild(this.dialog.lastElementChild);

    const title = this.getAttribute('title') ?? '';
    const message = this.getAttribute('message') ?? '';
    const cards = this.getAttribute('cards')?.split(',') ?? [];
    const borderColor = this.getAttribute('border-color') ?? '';

    const titleElement = document.createElement('h1');
    titleElement.innerHTML = title;
    this.dialog.appendChild(titleElement);

    this.createDivider('15px');

    cards.forEach(cardId => {
      const cardDisplayer = document.createElement('card-displayer');
      cardDisplayer.setAttribute('vertical', 'vertical');
      cardDisplayer.setAttribute('card-id', cardId);
      this.dialog.append(cardDisplayer);
    });

    if(cards.length !== 0)
      this.createDivider('10px');

    const messageElement = document.createElement('p');
    messageElement.innerHTML = message;
    this.dialog.appendChild(messageElement);

    const dialogStyle = borderColor ? `border-color: ${borderColor};` : '';
    if(borderColor !== '')
      this.dialog.setAttribute('style', dialogStyle);
  }

  private createDivider(height: string){
    const divider = document.createElement('div');
    divider.setAttribute('style', `width: 0; height: ${height};`);
    this.dialog.appendChild(divider);
  }
}

customElements.define('custom-dialog', CustomDialog);

declare global {
  interface HTMLElementTagNameMap{
    'custom-dialog': CustomDialog
  }
}