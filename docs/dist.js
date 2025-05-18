'use strict';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Signal {
    constructor(initialValue) {
        this.value = initialValue;
        this.subscribers = [];
    }
    get() {
        return this.value;
    }
    set(newValue) {
        this.value = newValue;
        this.trigger();
    }
    trigger() {
        this.subscribers.forEach(fn => fn(this.value));
    }
    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(it => it !== callback);
        };
    }
    subscribeAndRun(callback) {
        this.subscribers.push(callback);
        callback(this.value);
        return () => {
            this.subscribers = this.subscribers.filter(it => it !== callback);
        };
    }
}

class Set {
    constructor(set) {
        if (set.length !== 3)
            throw new Error('Invalid set length');
        this.cards = set;
    }
    getCards() {
        return this.cards;
    }
    isValid() {
        for (let i = 0; i < 4; i++) {
            if (!this.areThreeCharactersAllEqualOrAllDifferent(this.cards[0][i], this.cards[1][i], this.cards[2][i]))
                return false;
        }
        return true;
    }
    areThreeCharactersAllEqualOrAllDifferent(ch1, ch2, ch3) {
        if (ch1 === ch2 && ch1 === ch3)
            return true;
        if (ch1 === ch2 || ch1 === ch3 || ch2 === ch3)
            return false;
        return true;
    }
    equals(other) {
        if (!other.cards.includes(this.cards[0]))
            return false;
        if (!other.cards.includes(this.cards[1]))
            return false;
        if (!other.cards.includes(this.cards[2]))
            return false;
        return true;
    }
}

class CardId {
    static Random() {
        return `${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}`;
    }
    static CompressOne(cardId) {
        const num1 = 3 * parseInt(cardId[0]) + parseInt(cardId[1]);
        const num2 = 3 * parseInt(cardId[2]) + parseInt(cardId[3]);
        return String.fromCharCode(num1 + 49) + String.fromCharCode(num2 + 49); // '1' is the lowest
    }
    static Compress(cardIds) {
        return cardIds.reduce((acc, curr) => acc + this.CompressOne(curr), '');
    }
    static DeCompressChar(char) {
        let x = char.charCodeAt(0) - 49; // '1' is the lowest
        let result = (x % 3).toString();
        x = Math.floor(x / 3);
        result = (x % 3).toString() + result;
        return result;
    }
    static DeCompress(str) {
        const result = [];
        for (let i = 0; i < str.length / 2; i++) {
            result.push(this.DeCompressChar(str[2 * i]) + this.DeCompressChar(str[2 * i + 1]));
        }
        return result;
    }
}

class GameManager {
    constructor(featuresManager, audioManager, errorManager) {
        this.updateFeatureFlag = () => {
            const cardIds = this.cards.get().map(it => it.get().id);
            const code = CardId.Compress(cardIds);
            this.featuresManager.setFeatureValue('GAME-ID', code);
        };
        this.featuresManager = featuresManager;
        this.audioManager = audioManager;
        this.errorManager = errorManager;
        this.cards = new Signal([]);
        this.sets = new Signal([]);
        this.foundSets = new Signal([]);
        this.cards.subscribe(this.updateFeatureFlag);
        const gameId = this.featuresManager.getFeatureValue('GAME-ID').get();
        if (gameId === '')
            this.initGame();
        else {
            const cards = CardId.DeCompress(gameId);
            this.loadGame(cards);
        }
    }
    onWindowLoad() {
    }
    initGame() {
        let cards = [];
        let solutions = [];
        const preventNoSolution = this.featuresManager.isFeatureEnabled('PREVENT-NO-SOLUTION').get();
        do {
            cards = [];
            while (cards.length < 12) {
                const cardId = CardId.Random();
                if (cards.every((id) => id !== cardId)) {
                    cards.push(cardId);
                }
            }
            solutions = this.calculateAllSets(cards);
        } while (preventNoSolution && solutions.length === 0);
        this.loadGame(cards, solutions);
    }
    loadGame(cardIds, solutions) {
        const cards = cardIds.map(id => new Signal({ id, isSelected: false }));
        solutions = solutions !== null && solutions !== void 0 ? solutions : this.calculateAllSets(cardIds);
        this.sets.set(solutions);
        this.foundSets.set([]);
        this.cards.set(cards);
    }
    getCards() {
        return this.cards;
    }
    getCard(id) {
        return this.cards.get().find(it => it.get().id === id);
    }
    getSets() {
        return this.sets;
    }
    getFoundSets() {
        return this.foundSets;
    }
    toggleCardSelected(cardId) {
        const card = this.cards.get().find(it => it.get().id === cardId);
        if (card === undefined)
            return;
        card.set({ id: cardId, isSelected: !card.get().isSelected });
        this.checkVictory();
    }
    checkVictory() {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((res) => setTimeout(res, 10));
            const selectedCards = this.cards
                .get()
                .filter(it => it.get().isSelected);
            const selectedIds = selectedCards.map(it => it.get().id);
            if (selectedIds.length !== 3)
                return;
            const set = new Set(selectedIds);
            selectedCards.forEach(it => it.set({ id: it.get().id, isSelected: false }));
            if (!set.isValid()) {
                this.audioManager.play('wrong');
                this.errorManager.displayError('Wrong', 'These cards do not form a set', selectedIds);
                return;
            }
            if (this.foundSets.get().some(it => it.equals(set))) {
                this.audioManager.play('wrong');
                this.errorManager.displayError('Already found', 'You have found these cards already', selectedIds);
                return;
            }
            this.foundSets.set([...this.foundSets.get(), set]);
            if (this.foundSets.get().length === this.sets.get().length) {
                this.audioManager.play('victory');
            }
            else {
                this.audioManager.play('correct');
            }
        });
    }
    calculateAllSets(cardIds) {
        const sets = [];
        for (let i = 0; i < cardIds.length - 2; i++) {
            for (let j = i + 1; j < cardIds.length - 1; j++) {
                for (let k = j + 1; k < cardIds.length; k++) {
                    const set = new Set([cardIds[i], cardIds[j], cardIds[k]]);
                    if (set.isValid()) {
                        sets.push(set);
                    }
                }
            }
        }
        return sets;
    }
}

const defaultValues = {
    'PREVENT-NO-SOLUTION': {
        value: 'TRUE',
        isTruthy: true
    },
    'AUDIO': {
        value: 'FALSE',
        isTruthy: false
    },
    'GAME-ID': {
        value: '',
        isTruthy: false
    }
};
class FeaturesManager {
    constructor() {
        this.updateUrl = () => {
            const title = document.title;
            const baseUrl = window.location.origin + window.location.pathname;
            const params = {};
            const dict = this.dictionary.get();
            const keys = Object.keys(dict);
            const diff = keys.filter(key => dict[key].get().value.get() !== defaultValues[key].value);
            diff.forEach(key => params[key] = dict[key].get().value.get());
            const serialParams = Object.entries(params).reduce((acc, curr, index) => {
                if (index !== 0)
                    acc += '&';
                acc += curr[0] + '=' + curr[1];
                return acc;
            }, '');
            const url = diff.length === 0 ? baseUrl : baseUrl + '?' + serialParams;
            window.history.replaceState({}, title, url);
        };
        const urlParams = new URLSearchParams(window.location.search);
        const entries = Object.entries(defaultValues);
        this.dictionary = new Signal(entries.reduce((acc, curr) => {
            const queryParam = urlParams.get(curr[0].toUpperCase());
            if (queryParam === null) {
                return Object.assign(Object.assign({}, acc), { [curr[0]]: new Signal({ value: new Signal(curr[1].value), isTruthy: new Signal(curr[1].isTruthy) }) });
            }
            const str = queryParam.toUpperCase();
            const isTrue = FeaturesManager.isStringTruthy.includes(str);
            return Object.assign(Object.assign({}, acc), { [curr[0]]: new Signal({ value: new Signal(str), isTruthy: new Signal(isTrue) }) });
        }, {}));
        this.dictionary.subscribe(this.updateUrl);
    }
    onWindowLoad() {
    }
    isFeatureEnabled(key) {
        return this.dictionary.get()[key].get().isTruthy;
    }
    getFeatureValue(key) {
        return this.dictionary.get()[key].get().value;
    }
    setFeatureValue(key, value) {
        let str;
        let isTruthy;
        if (typeof value === 'string') {
            str = value;
            isTruthy = FeaturesManager.isStringTruthy.includes(str);
        }
        else {
            isTruthy = value;
            str = isTruthy ? 'TRUE' : 'FALSE';
        }
        const dictSignal = this.dictionary;
        const featureSignal = dictSignal.get()[key];
        const { value: valueSignal, isTruthy: truthySignal } = featureSignal.get();
        valueSignal.set(str);
        truthySignal.set(isTruthy);
        featureSignal.trigger();
        dictSignal.trigger();
    }
}
FeaturesManager.isStringTruthy = ['T', 'TRUE', 'Y', 'YES', 'S', 'SI', 'SÍ'];

const clips = ['nice', 'wrong', 'correct', 'victory'];
const clipName = {
    'nice': ['nice.mp3'],
    'wrong': ['fweeng.wav'],
    'correct': ['success.wav'],
    'victory': ['victory-1.wav', 'victory-2.wav']
};
class AudioManager {
    constructor(featuresManager) {
        this.loadClip = (clip) => {
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
        this.featuresManager = featuresManager;
        // @ts-expect-error Not all clips are loaded yet
        this.audioClip = {};
        clips.forEach(clip => this.audioClip[clip] = []);
    }
    onWindowLoad() {
        clips.forEach(this.loadClip);
    }
    play(clip) {
        const isAudioEnabled = this.featuresManager.isFeatureEnabled('AUDIO').get();
        if (!isAudioEnabled)
            return;
        const audioArray = this.audioClip[clip];
        const index = Math.floor(audioArray.length * Math.random());
        const audioElement = audioArray[index];
        const copy = audioElement.cloneNode(true);
        document.body.appendChild(copy);
        copy.addEventListener('ended', () => {
            document.body.removeChild(copy);
        });
        copy.play();
    }
}

class ErrorManager {
    onWindowLoad() {
    }
    displayError(title, message, cards) {
        this.errorDialog = document.createElement('error-dialog');
        this.errorDialog.setAttribute('title', title);
        this.errorDialog.setAttribute('message', message);
        this.errorDialog.setAttribute('cards', cards.join(','));
        document.body.appendChild(this.errorDialog);
    }
    closeErrorDialog() {
        if (this.errorDialog === undefined)
            return;
        document.body.removeChild(this.errorDialog);
        this.errorDialog = undefined;
    }
}

class CardDisplayer extends HTMLElement {
    constructor() {
        var _a;
        super();
        this.onClick = () => {
            const cardId = this.getAttribute('card-id');
            if (cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
                return;
            const gameManager = getGameManager();
            gameManager.toggleCardSelected(cardId);
        };
        this.attributeChangedCallbackIsClicked = (card) => {
            if (card.isSelected)
                this.img.setAttribute('class', 'card clicked');
            else
                this.img.setAttribute('class', 'card');
        };
        this.attributeChangedCallbackClickable = (value) => {
            const isClickable = value === 'true';
            if (isClickable) {
                this.img.addEventListener('mouseup', this.onClick);
            }
            else {
                this.img.removeEventListener('mouseup', this.onClick);
            }
        };
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerText = CardDisplayer.styles;
        this.root.appendChild(style);
        this.img = document.createElement('img');
        this.img.setAttribute('class', 'card');
        this.img.setAttribute('alt', (_a = this.getAttribute('card-id')) !== null && _a !== void 0 ? _a : 'Invalid Card');
        this.root.appendChild(this.img);
    }
    connectedCallback() {
        const cardId = this.getAttribute('card-id');
        if (cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
            return;
        const gameManager = getGameManager();
        const card = gameManager.getCard(cardId);
        if (card === undefined)
            return;
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
        const subs = card.subscribeAndRun(this.attributeChangedCallbackIsClicked);
        this.subscriptions.push(subs);
    }
    disconnectedCallback() {
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        switch (property) {
            case 'card-id':
                this.attributeChangedCallbackCardId(newValue);
                break;
            case 'clickable':
                this.attributeChangedCallbackClickable(newValue);
        }
    }
    attributeChangedCallbackCardId(value) {
        if (value === null || !CardDisplayer.isIdValidRegex.test(value))
            return;
        this.img.src = `./img/${value}.png`;
        this.img.alt = value;
    }
}
CardDisplayer.observedAttributes = ['card-id', 'clickable'];
CardDisplayer.styles = `
  .card {
    width: var(--card-w);
    height: var(--card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
    cursor: pointer;
  }
  .clicked {
    filter: brightness(50%);
  }
  `.replaceAll('\n', '');
CardDisplayer.isIdValidRegex = /^[0-2]{4}$/;
customElements.define('card-displayer', CardDisplayer);

class BoardDisplayer extends HTMLElement {
    constructor() {
        super();
        this.renderAllCards = (cards) => {
            while (this.container.lastChild)
                this.container.removeChild(this.container.lastChild);
            cards.forEach((card) => {
                const cardDisplayer = document.createElement('card-displayer');
                cardDisplayer.setAttribute('card-id', card.id);
                cardDisplayer.setAttribute('clickable', 'true');
                this.container.appendChild(cardDisplayer);
            });
        };
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerText = BoardDisplayer.styles;
        this.root.appendChild(style);
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'container');
        this.root.appendChild(this.container);
    }
    connectedCallback() {
        const gameManager = getGameManager();
        const cards = gameManager.getCards();
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
        const unsubscribe = cards.subscribeAndRun(cards => {
            const cardArray = cards.map(it => it.get());
            this.renderAllCards(cardArray);
        });
        this.subscriptions.push(unsubscribe);
    }
    disconnectedCallBack() {
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
    }
}
BoardDisplayer.styles = `
  .container {
    display: grid;
    grid-template-columns: var(--card-w) var(--card-w) var(--card-w);
    grid-gap: 10px;
    padding: 10px;
  
  }
  `.replaceAll('\n', '');
customElements.define('board-displayer', BoardDisplayer);

class GameDisplayer extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerText = GameDisplayer.styles;
        this.root.appendChild(style);
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'container');
        this.root.appendChild(this.container);
        const board = document.createElement('board-displayer');
        this.container.appendChild(board);
        const menu = document.createElement('div');
        menu.setAttribute('class', 'menu');
        this.container.appendChild(menu);
        this.totalSetsP = document.createElement('p');
        menu.appendChild(this.totalSetsP);
        const foundSets = document.createElement('found-sets-displayer');
        menu.appendChild(foundSets);
        const playAgainButton = document.createElement('play-again-button');
        menu.appendChild(playAgainButton);
    }
    connectedCallback() {
        const gameManager = getGameManager();
        const totalSets = gameManager.getSets();
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
        const unsubTotalSets = totalSets.subscribeAndRun(sets => {
            this.totalSetsP.innerText = `${sets.length} SETS`;
        });
        this.subscriptions.push(unsubTotalSets);
    }
    disconnectedCallback() {
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
    }
}
GameDisplayer.styles = `
  * {
    font-family: MightySouly;
    font-size: 48px;

    margin: 0;
    padding: 0;
  }
  .container {
    display: flex;
    flex-direction: row;
  }
  p {
    margin: 5px;
    width: 100%;
    max-width: calc(3 * var(--mini-card-w));
    text-align: center;
  }
  `.replaceAll('\n', '');
customElements.define('game-displayer', GameDisplayer);

class FoundSetsDisplayer extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerHTML = FoundSetsDisplayer.styles;
        this.root.appendChild(style);
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'container');
        this.root.appendChild(this.container);
    }
    connectedCallback() {
        const gameManager = getGameManager();
        const foundSets = gameManager.getFoundSets();
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
        const subs = foundSets.subscribeAndRun((sets) => {
            while (this.container.lastChild !== null)
                this.container.removeChild(this.container.lastChild);
            sets.forEach(set => {
                const cards = set.getCards();
                cards.forEach(card => {
                    const cardDisplay = document.createElement('img');
                    cardDisplay.src = `./img/${card}R.png`;
                    cardDisplay.alt = card + 'R';
                    cardDisplay.setAttribute('class', 'card');
                    this.container.appendChild(cardDisplay);
                });
            });
        });
        this.subscriptions.push(subs);
    }
    disconnectedCallback() {
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue !== newValue)
            return;
    }
}
FoundSetsDisplayer.styles = `
  .container {
    display: grid;
    grid-template-columns: var(--mini-card-w) var(--mini-card-w) var(--mini-card-w);
    grid-gap: 3px;
    padding: 5px;
  }

  .card {
    width: var(--mini-card-w);
    height: var(--mini-card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
  }

  button{
    width: max-content;
    height: max-content;
  }
  `.replaceAll('\n', '');
customElements.define('found-sets-displayer', FoundSetsDisplayer);

class PlayAgainButton extends HTMLElement {
    constructor() {
        super();
        this.renderPlayAgainButton = () => {
            this.button = document.createElement('button');
            this.button.innerHTML = 'You won!<br>Start again?';
            this.button.className = 'play-button';
            this.button.onmouseup = () => {
                getGameManager().initGame();
            };
            this.root.appendChild(this.button);
        };
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerText = PlayAgainButton.styles;
        this.root.appendChild(style);
        const gameManager = getGameManager();
        const totalSets = gameManager.getSets();
        const foundSetsSignal = gameManager.getFoundSets();
        const unsub = foundSetsSignal.subscribeAndRun((foundSets) => {
            if (this.button !== undefined) {
                this.root.removeChild(this.button);
                this.button = undefined;
            }
            if (foundSets.length === totalSets.get().length)
                this.renderPlayAgainButton();
        });
        this.subscriptions.push(unsub);
    }
    connectedCallback() {
    }
    disconnectedCallback() {
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
    }
}
PlayAgainButton.styles = `
  * {
    font-family: MightySouly;
    font-size: 32px;

    margin: 0;
    padding: 0;
  }
  .play-button {
    background-color: #3DD1E7;
    border: 0 solid #E5E7EB;
    box-sizing: border-box;
    color: #000000;
    display: flex;
    font-family: ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
    font-size: 1rem;
    font-weight: 700;
    justify-content: center;
    line-height: 1.75rem;
    padding: .75rem 1.65rem;
    position: relative;
    text-align: center;
    text-decoration: none #000000 solid;
    text-decoration-thickness: auto;
    width: 100%;
    max-width: calc(3 * var(--mini-card-w));
    margin: 11px;
    position: relative;
    cursor: pointer;
    transform: rotate(-2deg);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }
  
  .play-button:focus {
    outline: 0;
  }
  
  .play-button:after {
    content: '';
    position: absolute;
    border: 1px solid #000000;
    bottom: 4px;
    left: 4px;
    width: calc(100% - 1px);
    height: calc(100% - 1px);
  }
  
  .play-button:hover:after {
    bottom: 2px;
    left: 2px;
  }
  
  @media (min-width: 768px) {
    .play-button {
      padding: .75rem 3rem;
      font-size: 1.25rem;
    }
  }
  `.replaceAll('\n', '');
customElements.define('play-again-button', PlayAgainButton);

class ErrorDialog extends HTMLElement {
    constructor() {
        var _a;
        super();
        this.onClick = () => {
            const errorManager = getErrorManager();
            errorManager.closeErrorDialog();
        };
        this.root = this.attachShadow({ mode: 'open' });
        const container = document.createElement('div');
        container.className = 'container';
        container.addEventListener('click', this.onClick);
        this.root.appendChild(container);
        const styles = document.createElement('style');
        styles.innerText = ErrorDialog.styles;
        this.root.appendChild(styles);
        this.dialog = document.createElement('dialog');
        this.dialog.innerHTML = (_a = this.getAttribute('error-message')) !== null && _a !== void 0 ? _a : '';
        this.dialog.setAttribute('open', 'true');
        this.dialog.addEventListener('click', this.onClick);
        this.root.appendChild(this.dialog);
    }
    connectedCallback() {
    }
    disconnectedCallback() {
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.renderDialog();
    }
    renderDialog() {
        var _a, _b, _c, _d;
        const title = (_a = this.getAttribute('title')) !== null && _a !== void 0 ? _a : '';
        const message = (_b = this.getAttribute('message')) !== null && _b !== void 0 ? _b : '';
        const cards = (_d = (_c = this.getAttribute('cards')) === null || _c === void 0 ? void 0 : _c.split(',')) !== null && _d !== void 0 ? _d : [];
        this.dialog.innerHTML = /* html */ `
      <h1 style="margin-bottom: 15px;">${title}</h1>
      ${cards.map(card => /* html */ `
        <img src = './img/${card}R.png' alt='${card}R' class='card'>
        `.replaceAll('\n', '')).join('')}
      <p style="margin-top: 10px;">${message}</p>
    `.replaceAll('\n', '');
    }
}
ErrorDialog.observedAttributes = ['title', 'message', 'cards'];
ErrorDialog.styles = `
  * {
    margin: 0;
    padding; 0;

    text-align: center;
  }
  .container{
    position: fixed;
    top: 0%;
    left: 0%;
    width: 100%;
    height: 100%;
    background-color: #00000050;
  }
  dialog{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .card {
    width: var(--mini-card-w);
    height: var(--mini-card-h);
    border: 1px black solid;
    border-radius: var(--card-border);
    box-shadow: 2px 1px 1px black;
  }
  `.replaceAll('\n', '');
customElements.define('error-dialog', ErrorDialog);

const featuresManager = new FeaturesManager();
globalThis.getFeaturesManager = () => featuresManager;
const audioManager = new AudioManager(featuresManager);
globalThis.getAudioManager = () => audioManager;
const errorManager = new ErrorManager();
globalThis.getErrorManager = () => errorManager;
const gameManager = new GameManager(featuresManager, audioManager, errorManager);
globalThis.getGameManager = () => gameManager;
window.onload = function () {
    featuresManager.onWindowLoad();
    audioManager.onWindowLoad();
    gameManager.onWindowLoad();
};
//# sourceMappingURL=dist.js.map
