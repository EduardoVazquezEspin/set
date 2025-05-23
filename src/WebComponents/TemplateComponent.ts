import {IWebComponent} from '../interfaces';

export class TemplateComponent extends HTMLElement implements IWebComponent{
  static observedAttributes = [] as const;

  private readonly root: ShadowRoot;

  static readonly styles = /* css */`
  * {
    margin: 0;
    padding; 0;

    text-align: center;
    font-family: MightySouly;
  }
  @font-face {
    font-family: 'MightySouly';
    src: url('MightySouly-lxggD.woff2') format('woff2');
    src: url('MightySouly-lxggD.ttf') format('ttf');
  }
  `.replaceAll('\n', '');

  // Create html elements
  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});

    const styles = document.createElement('style');
    styles.innerText = TemplateComponent.styles;
    this.root.appendChild(styles);
  }

  connectedCallback(): void {
  }

  disconnectedCallback(): void {
  }

  attributeChangedCallback(
    property: typeof TemplateComponent.observedAttributes[number],
    oldValue: string | null,
    newValue: string | null
  ): void {
    if(oldValue === newValue)
      return;

    this.render();
  }

  // Modify values
  // If creating html elements, first remove previous render elements
  private render(){
  }
}

customElements.define('template-component', TemplateComponent);

declare global {
  interface HTMLElementTagNameMap{
    'template-component': TemplateComponent
  }
}