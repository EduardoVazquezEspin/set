import {FeaturesManager, GameManager} from './Managers';
import './WebComponents';

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;

const gameManager = new GameManager();
globalThis.getGameManager = () => gameManager;