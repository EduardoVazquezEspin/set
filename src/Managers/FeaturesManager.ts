import {Signal} from '../Classes';

const featureFlags = ['PREVENT-NO-SOLUTION', 'GAME-ID'] as const;

type FeatureFlag = typeof featureFlags[number];

interface FeatureFlagValue{
  value: string;
  isTruthy: boolean;
}

interface SignalFeatureFlagValue{
  value: Signal<string>;
  isTruthy: Signal<boolean>;
}

const defaultValues: Record<FeatureFlag, FeatureFlagValue> = {
  'PREVENT-NO-SOLUTION': {
    value: 'TRUE',
    isTruthy: true
  },
  'GAME-ID': {
    value: '',
    isTruthy: false
  }
} as const;

export class FeaturesManager{
  private readonly dictionary: Signal<Record<FeatureFlag, Signal<SignalFeatureFlagValue>>>;

  private static readonly isStringTruthy = ['T', 'TRUE', 'Y', 'YES', 'S', 'SI', 'SÍ'];

  constructor(){
    const urlParams = new URLSearchParams(window.location.search);

    const entries: Array<[FeatureFlag, FeatureFlagValue]> = Object.entries(defaultValues) as Array<[FeatureFlag, FeatureFlagValue]>;

    this.dictionary = new Signal(entries.reduce((
      acc: Record<FeatureFlag, Signal<SignalFeatureFlagValue>>,
      curr: [FeatureFlag, FeatureFlagValue]
    ): Record<FeatureFlag, Signal<SignalFeatureFlagValue>> => {
      const queryParam = urlParams.get(curr[0].toUpperCase());
      if(queryParam === null){
        return {
          ...acc,
          [curr[0]]: new Signal({value: new Signal(curr[1].value), isTruthy: new Signal(curr[1].isTruthy)})
        };
      }
      const str = queryParam.toUpperCase();
      const isTrue = FeaturesManager.isStringTruthy.includes(str);
      return {
        ...acc,
        [curr[0]]: new Signal({value: new Signal(str), isTruthy: new Signal(isTrue)})
      };
    }
    , {} as Record<FeatureFlag, Signal<SignalFeatureFlagValue>>));

    this.dictionary.subscribe(this.updateUrl);
  }

  isFeatureEnabled(key: FeatureFlag): Signal<boolean>{
    return this.dictionary.get()[key].get().isTruthy;
  }

  getFeatureValue(key: FeatureFlag): Signal<string> {
    return this.dictionary.get()[key].get().value;
  }

  setFeatureValue(key: FeatureFlag, value: string | boolean) {
    let str: string;
    let isTruthy: boolean;
    if(typeof value === 'string'){
      str = value;
      isTruthy = FeaturesManager.isStringTruthy.includes(str);
    }
    else {
      isTruthy = value;
      str = isTruthy ? 'TRUE' : 'FALSE';
    }

    const dictSignal = this.dictionary;
    const featureSignal = dictSignal.get()[key];
    const {value: valueSignal, isTruthy: truthySignal} = featureSignal.get();
    valueSignal.set(str);
    truthySignal.set(isTruthy);
    featureSignal.trigger();
    dictSignal.trigger();
  }

  private updateUrl = () => {
    const title = document.title;

    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    const dict = this.dictionary.get();
    const keys = Object.keys(dict) as FeatureFlag[];
    const diff = keys.filter(key => dict[key].get().value.get() !== defaultValues[key].value);
    diff.forEach(key => params.set(key, dict[key].get().value.get()));

    const url = diff.length === 0 ? baseUrl : baseUrl + '?' + params.toString();

    window.history.replaceState({}, title, url);
  };
}