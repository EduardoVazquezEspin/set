import {FeaturesManager, GameManager, AudioManager, ErrorManager} from './Managers';
import './WebComponents';

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;

const audioManager = new AudioManager(featuresManager);
globalThis.getAudioManager = () => audioManager;

const errorManager = new ErrorManager();
globalThis.getErrorManager = () => errorManager;

const gameManager = new GameManager(featuresManager, audioManager, errorManager);
globalThis.getGameManager = () => gameManager;

window.onload = function(){
  featuresManager.onWindowLoad();
  audioManager.onWindowLoad();
  gameManager.onWindowLoad();
};