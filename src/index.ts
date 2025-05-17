import {FeaturesManager, GameManager, AudioManager} from './Managers';
import './WebComponents';

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;

const audioManager = new AudioManager(featuresManager);
globalThis.getAudioManager = () => audioManager;

const gameManager = new GameManager(featuresManager, audioManager);
globalThis.getGameManager = () => gameManager;

window.onload = function(){
  featuresManager.onWindowLoad();
  audioManager.onWindowLoad();
  gameManager.onWindowLoad();
};