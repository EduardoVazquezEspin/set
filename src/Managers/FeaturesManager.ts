type FeatureName = 'PREVENT-NO-SOLUTION'

export class FeaturesManager{
  private readonly dictionary: Map<FeatureName, boolean>;

  constructor(){
    this.dictionary = new Map<FeatureName, boolean>();

    this.dictionary.set('PREVENT-NO-SOLUTION', true);
  }

  isFeatureEnabled(key: FeatureName){
    return this.dictionary.get(key);
  }
}