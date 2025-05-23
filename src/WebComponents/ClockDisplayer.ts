import {StatsManager} from '../Managers';
import {IWebComponent} from '../interfaces';

interface TimeByCategory{
    hours: string;
    minutes: string;
    seconds: string;
}

export class ClockDisplayer extends HTMLElement implements IWebComponent{
  private readonly root: ShadowRoot;
  private subscriptions: CallableFunction[];

  private readonly statsManager: StatsManager;
  private readonly paragraph: HTMLParagraphElement;
  private readonly error: HTMLParagraphElement;

  static readonly styles = /* css */`
  * {
    margin: 0;
    padding; 0;

    text-align: center;
    font-family: MightySouly;
  }
  p {
    font-size: 20px;
  }
  p:empty::before {
    content:"";
    display:inline-block;
  }
  @font-face {
    font-family: 'MightySouly';
    src: url('MightySouly-lxggD.woff2') format('woff2');
    src: url('MightySouly-lxggD.ttf') format('ttf');
  }
  `.replaceAll('\n', '');

  constructor(){
    super();
    this.subscriptions = [];
    this.statsManager = getStatsManager();

    this.root = this.attachShadow({mode: 'open'});

    const styles = document.createElement('style');
    styles.innerText = ClockDisplayer.styles;
    this.root.appendChild(styles);

    this.paragraph = document.createElement('p');
    this.root.appendChild(this.paragraph);

    this.error = document.createElement('p');
    this.error.setAttribute('style', 'color: red;');
    this.root.appendChild(this.error);

    const subTime = this.statsManager.getTime().subscribeAndRun(this.renderParagraph);
    const subIsError = this.statsManager.getIsPenalized().subscribeAndRun(this.renderParagraph);
    this.subscriptions.push(subTime, subIsError);
  }

  connectedCallback(): void {
  }

  disconnectedCallback(): void {
    this.subscriptions.forEach(cb => cb());
    this.subscriptions = [];
  }

  attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void {
    if(oldValue === newValue)
      return;
  }

  private renderParagraph = () => {
    {
      const time = this.statsManager.getTime().get();
      const isError = this.statsManager.getIsPenalized().get();
      const {hours, minutes, seconds} = this.getTimeByCategory(time);
      this.paragraph.innerText = `${hours}:${minutes}:${seconds}`;
      this.error.innerText = isError ? ` +${StatsManager.PENALIZATION_TIME} sec` : '';
    }
  };

  private getTimeByCategory(time: number): TimeByCategory{
    const seconds = this.timeToString(time % 60);
    time = Math.floor(time / 60);
    const minutes = this.timeToString(time % 60);
    time = Math.floor(time / 60);
    const hours = this.timeToString(time);
    return {seconds, minutes, hours};
  }

  private timeToString(time: number){
    let str = time.toString();
    if(str.length < 2)
      str = '0' + str;
    return str;
  }
}

customElements.define('clock-displayer', ClockDisplayer);

declare global {
  interface HTMLElementTagNameMap{
    'clock-displayer': ClockDisplayer
  }
}