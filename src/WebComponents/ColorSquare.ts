type Color = 'red' | 'blue' | 'green'

export class ColorSquare extends HTMLElement{
  private color: Color = 'red';
  private static colors: Color[] = ['red', 'blue', 'green'];
  readonly root: ShadowRoot;

  private static styles = /* css */`
  .red {
    background-color: red;
  }

  .blue {
    background-color: blue;
  }

  .green {
    background-color: green;
  }

  .box {
    width: 100px;
    height: 100px;
  }
  `.replaceAll('\n', '');

  constructor(){
    super();

    this.root = this.attachShadow({mode: 'open'});

    const box = document.createElement('div');
    box.setAttribute('class', 'box');
    this.root.appendChild(box);
    this.setColor('red');

    const style = document.createElement('style');
    style.innerText = ColorSquare.styles;
    this.root.appendChild(style);
  }

  private NextColor(){
    const currentIndex = ColorSquare.colors.indexOf(this.color);
    const nextIndex = (currentIndex + 1) % ColorSquare.colors.length;
    this.setColor(ColorSquare.colors[nextIndex]);
  }

  private setColor(color: Color){
    this.color = color;
    const box = this.shadowRoot?.querySelector('div');
    box?.setAttribute('class', `box ${color}`);
  }

  connectedCallback(){
    setInterval(() => this.NextColor(), 2000);
  }
}

customElements.define('color-square', ColorSquare);

declare global {
  interface HTMLElementTagNameMap{
    'color-square': ColorSquare
  }
}