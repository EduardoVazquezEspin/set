import {FeaturesManager, GameManager, AudioManager, DialogManager, StatsManager} from './Managers';
import './WebComponents';

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;

const audioManager = new AudioManager(featuresManager);
globalThis.getAudioManager = () => audioManager;

const dialogManager = new DialogManager();
globalThis.getDialogManager = () => dialogManager;

const statsManager = new StatsManager();
globalThis.getStatsManager = () => statsManager;

const gameManager = new GameManager(featuresManager, audioManager, dialogManager, statsManager);
globalThis.getGameManager = () => gameManager;

window.onload = function(){
  featuresManager.onWindowLoad();
  audioManager.onWindowLoad();
  dialogManager.onWindowLoad();
  statsManager.onWindowLoad();
  gameManager.onWindowLoad();
};

const gameDisplayer = document.createElement('game-displayer');
document.body.appendChild(gameDisplayer);