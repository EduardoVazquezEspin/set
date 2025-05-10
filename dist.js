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
        this.subscribers.forEach(fn => fn(newValue));
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

class GameManager {
    constructor() {
        this.cards = new Signal([]);
        this.sets = new Signal([]);
        this.foundSets = new Signal([]);
        this.initGame();
    }
    initGame() {
        const cards = [];
        while (cards.length < 12) {
            const cardId = this.generateCardId();
            if (cards.every((card) => card.get().id !== cardId)) {
                cards.push(new Signal({ id: cardId, isSelected: false }));
            }
        }
        this.cards.set(cards);
        this.calculateAllSets();
        this.foundSets.set([]);
    }
    generateCardId() {
        return `${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}${Math.floor(Math.random() * 3)}`;
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
                alert('Wrong');
                return;
            }
            if (this.foundSets.get().some(it => it.equals(set))) {
                alert('Already found');
                return;
            }
            this.foundSets.set([...this.foundSets.get(), set]);
        });
    }
    calculateAllSets() {
        const cards = this.cards.get().map(it => it.get());
        const sets = [];
        for (let i = 0; i < cards.length - 2; i++) {
            for (let j = i + 1; j < cards.length - 1; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const set = new Set([cards[i].id, cards[j].id, cards[k].id]);
                    if (set.isValid()) {
                        sets.push(set);
                    }
                }
            }
        }
        this.sets.set(sets);
    }
}

class ColorSquare extends HTMLElement {
    constructor() {
        super();
        this.color = 'red';
        this.root = this.attachShadow({ mode: 'open' });
        const box = document.createElement('div');
        box.setAttribute('class', 'box');
        this.root.appendChild(box);
        this.setColor('red');
        const style = document.createElement('style');
        style.innerText = ColorSquare.styles;
        this.root.appendChild(style);
    }
    NextColor() {
        const currentIndex = ColorSquare.colors.indexOf(this.color);
        const nextIndex = (currentIndex + 1) % ColorSquare.colors.length;
        this.setColor(ColorSquare.colors[nextIndex]);
    }
    setColor(color) {
        var _a;
        this.color = color;
        const box = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('div');
        box === null || box === void 0 ? void 0 : box.setAttribute('class', `box ${color}`);
    }
    connectedCallback() {
        setInterval(() => this.NextColor(), 2000);
    }
}
ColorSquare.colors = ['red', 'blue', 'green'];
ColorSquare.styles = `
  .red {
    background-color: red;
  }

  .blue {
    background-color: blue;
  }

  .green {
    background-color: green;
  }

  .box {
    width: 100px;
    height: 100px;
  }
  `.replaceAll('\n', '');
customElements.define('color-square', ColorSquare);

class CardDisplayer extends HTMLElement {
    constructor() {
        super();
        this.onClick = () => {
            const cardId = this.getAttribute('card-id');
            if (cardId === null || !CardDisplayer.isIdValidRegex.test(cardId))
                return;
            const gameManager = getGameManager();
            gameManager.toggleCardSelected(cardId);
        };
        this.attributeChangedCallbackIsClicked = (card) => {
            const img = this.root.querySelector('img');
            if (img === null)
                return;
            if (card.isSelected)
                img.setAttribute('class', 'card clicked');
            else
                img.setAttribute('class', 'card');
        };
        this.attributeChangedCallbackClickable = (value) => {
            const isClickable = value === 'true';
            const img = this.root.querySelector('img');
            if (img === null)
                return;
            if (isClickable) {
                img.addEventListener('click', this.onClick);
            }
            else {
                img.removeEventListener('click', this.onClick);
            }
        };
        this.root = this.attachShadow({ mode: 'open' });
        this.subscriptions = [];
        const style = document.createElement('style');
        style.innerText = CardDisplayer.styles;
        this.root.appendChild(style);
        const img = document.createElement('img');
        img.setAttribute('class', 'card');
        this.root.appendChild(img);
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
        const img = this.root.querySelector('img');
        if (img === null)
            return;
        img.src = `./public/${value}.png`;
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
            while (this.lastChild)
                this.removeChild(this.lastChild);
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
        this.totalFoundP = document.createElement('p');
        menu.appendChild(this.totalFoundP);
    }
    connectedCallback() {
        const gameManager = getGameManager();
        const totalSets = gameManager.getSets();
        const foundSets = gameManager.getFoundSets();
        this.subscriptions.forEach(cb => cb());
        this.subscriptions = [];
        const unsubTotalSets = totalSets.subscribeAndRun(sets => {
            this.totalSetsP.innerText = `Total sets: ${sets.length}`;
        });
        const unsubFoundSets = foundSets.subscribeAndRun(sets => {
            this.totalFoundP.innerText = `Found sets: ${JSON.stringify(sets.map(it => it.getCards()))}`;
        });
        this.subscriptions.push(unsubTotalSets, unsubFoundSets);
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
GameDisplayer.observedAttributes = ['card-array'];
GameDisplayer.styles = `
  .container {
    display: flex;
    flex-direction: row;
  }
  .menu{
  }
  `.replaceAll('\n', '');
customElements.define('game-displayer', GameDisplayer);

const gameManager = new GameManager();
globalThis.getGameManager = () => gameManager;
//# sourceMappingURL=dist.js.map
