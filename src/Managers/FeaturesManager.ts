import {Signal} from '../Classes';

const featureFlags = ['PREVENT-NO-SOLUTION'] as const;

type FeatureFlag = typeof featureFlags[number]

const defaultValues: Record<FeatureFlag, boolean> = {
  'PREVENT-NO-SOLUTION': true
} as const;

export class FeaturesManager{
  private readonly dictionary: Signal<Record<FeatureFlag, Signal<boolean>>>;

  private static readonly isStringTruthy = ['T', 'TRUE', 'Y', 'YES', 'S', 'SI', 'SÍ'];

  constructor(){
    const urlParams = new URLSearchParams(window.location.search);

    this.dictionary = new Signal(Object.entries(defaultValues).reduce((
      acc: Record<FeatureFlag, Signal<boolean>>,
      curr
    ): Record<FeatureFlag, Signal<boolean>> => {
      const queryParam = urlParams.get(curr[0].toUpperCase());
      if(queryParam === null){
        return {
          ...acc,
          [curr[0]]: new Signal(curr[1])
        };
      }
      const isTrue = FeaturesManager.isStringTruthy.includes(queryParam.toUpperCase());
      return {
        ...acc,
        [curr[0]]: new Signal(isTrue)
      };
    }
    , {} as Record<FeatureFlag, Signal<boolean>>));
  }

  isFeatureEnabled(key: FeatureFlag): Signal<boolean>{
    return this.dictionary.get()[key];
  }
}