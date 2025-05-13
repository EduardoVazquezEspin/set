export class Signal<T> {
  private value: T;
  private subscribers: Array<(value: T) => void>;

  constructor(initialValue: T) {
    this.value = initialValue;
    this.subscribers = [];
  }

  get() {
    return this.value;
  }

  set(newValue: T) {
    this.value = newValue;
    this.trigger();
  }

  trigger(){
    this.subscribers.forEach(fn => fn(this.value));
  }

  subscribe(callback: (value: T) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(it => it !== callback);
    };
  }

  subscribeAndRun(callback: (value: T) => void): () => void {
    this.subscribers.push(callback);
    callback(this.value);
    return () => {
      this.subscribers = this.subscribers.filter(it => it !== callback);
    };
  }
}