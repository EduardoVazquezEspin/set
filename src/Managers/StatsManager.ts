import {Signal} from '../Classes';

export interface HourMinuteSeconds{
    hours: number;
    minutes: number;
    seconds: number;
}

export class StatsManager{
  private time: Signal<number>;
  private timeInterval: ReturnType<typeof setInterval> | null;
  private isPenalized: Signal<boolean>;
  private previousIsPenalized: ReturnType<typeof setTimeout> | null;
  static readonly PENALIZATION_TIME = 15;

  constructor() {
    this.time = new Signal<number>(0);
    this.isPenalized = new Signal<boolean>(false);
    this.timeInterval = null;
    this.previousIsPenalized = null;
  }

  onWindowLoad(){
  }

  resetStats(){
    this.time.set(0);
    this.timeInterval = setInterval(() => {this.time.set(this.time.get() + 1);}, 1000);
  }

  stopTime(){
    if(this.timeInterval !== null){
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  getTime(){
    return this.time;
  }

  getIsPenalized(){
    return this.isPenalized;
  }

  penalize(){
    if(this.previousIsPenalized !== null){
      clearTimeout(this.previousIsPenalized);
      this.previousIsPenalized = null;
    }
    this.time.set(this.time.get() + StatsManager.PENALIZATION_TIME);
    this.isPenalized.set(true);
    this.previousIsPenalized = setTimeout(() => this.isPenalized.set(false), 3000);
  }
}