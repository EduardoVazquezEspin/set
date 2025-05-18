import {FeaturesManager, GameManager, AudioManager, DialogManager} from './Managers';
import './WebComponents';

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;

const audioManager = new AudioManager(featuresManager);
globalThis.getAudioManager = () => audioManager;

const dialogManager = new DialogManager();
globalThis.getDialogManager = () => dialogManager;

const gameManager = new GameManager(featuresManager, audioManager, dialogManager);
globalThis.getGameManager = () => gameManager;

window.onload = function(){
  featuresManager.onWindowLoad();
  audioManager.onWindowLoad();
  gameManager.onWindowLoad();
};