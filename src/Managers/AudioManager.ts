import type {FeaturesManager} from './FeaturesManager';

const clips = ['nice', 'wrong', 'correct', 'victory'] as const;

type Clip = typeof clips[number];

const clipName : Record<Clip, string[]> = {
  'nice': ['nice.mp3'],
  'wrong': ['fweeng.wav'],
  'correct': ['success.wav'],
  'victory': ['victory-1.wav', 'victory-2.wav']
};

export class AudioManager{
  private audioClip: Record<Clip, Array<HTMLAudioElement>>;
  private featuresManager: FeaturesManager;

  constructor(featuresManager: FeaturesManager){
    this.featuresManager = featuresManager;
    // @ts-expect-error Not all clips are loaded yet
    this.audioClip = {};
    clips.forEach(clip => this.audioClip[clip] = []);
  }

  onWindowLoad(){
    clips.forEach(this.loadClip);
  }

  private loadClip = (clip: Clip) => {
    const audioFileNames = clipName[clip];

    audioFileNames.forEach((audioFileName) => {
      const audioElement = document.createElement('audio');
      const sourceElement = document.createElement('source');
      sourceElement.setAttribute('src', 'audio/' + audioFileName);
      sourceElement.setAttribute('type', 'audio/mpeg');
      audioElement.appendChild(sourceElement);
      document.body.appendChild(audioElement);

      this.audioClip[clip].push(audioElement);
    });
  };

  play(clip: Clip){
    const isAudioEnabled = this.featuresManager.isFeatureEnabled('AUDIO').get();
    if(!isAudioEnabled)
      return;

    const audioArray = this.audioClip[clip];
    const index = Math.floor(audioArray.length * Math.random());
    const audioElement = audioArray[index];
    const copy = audioElement.cloneNode(true) as HTMLAudioElement;
    document.body.appendChild(copy);
    copy.addEventListener('ended', () => {
      document.body.removeChild(copy);
    });
    copy.play();
  }
}