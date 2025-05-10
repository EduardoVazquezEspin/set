import type {GameManager} from './Managers';

export interface IWebComponent{
    connectedCallback(): void;
    disconnectedCallback(): void;
    attributeChangedCallback(property: string, oldValue: string | null, newValue: string | null): void;
}

export interface Card{
    id: string;
    isSelected: boolean
}

export type Set = [string, string, string];

declare global{
    function getGameManager(): GameManager;
}