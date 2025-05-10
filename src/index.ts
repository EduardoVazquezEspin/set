import {GameManager} from './Managers/GameManager.ts';
import './WebComponents/index.ts';

const gameManager = new GameManager();

globalThis.getGameManager = () => gameManager;