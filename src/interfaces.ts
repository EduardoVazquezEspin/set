import type {AudioManager, DialogManager, FeaturesManager, GameManager, StatsManager} from './Managers';

export interface IWebComponent{
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void;
}

export interface Card{
    id: string;
    isSelected: boolean
}

declare global{
    function getGameManager(): GameManager;
    function getFeaturesManager(): FeaturesManager;
    function getDialogManager(): DialogManager;
    function getAudioManager(): AudioManager;
    function getStatsManager(): StatsManager;
    interface Window{
        webkitAudioContext: typeof AudioContext;
    }
}
