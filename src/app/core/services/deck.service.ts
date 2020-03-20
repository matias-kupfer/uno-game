import {Injectable} from '@angular/core';
import {Card} from '../../Class/card';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  public deck: Card[];

  constructor() {
    this.startGame();
  }

  public startGame() {
    this.deck = this.mixDeck(this.generateDeck());
  }

  public generateDeck() {
    this.deck = [];
    for (let cardsColor = 0; cardsColor < 4; cardsColor++) {
      for (let cardValue = 0; cardValue <= 14; cardValue++) {
        if (cardValue === 0) {
          const newCard = new Card(cardValue, cardsColor);
          this.deck.push(newCard);
        } else if (cardValue > 0 && cardValue <= 9) {
          const newCard = new Card(cardValue, cardsColor);
          this.deck.push(newCard);
          this.deck.push(newCard);
        } else if (cardValue > 9 && cardValue <= 12) {
          const newCard = new Card(cardValue, cardsColor);
          this.deck.push(newCard);
          this.deck.push(newCard);
        }
      }
    }

    for (let specialCards = 13; specialCards <= 14; specialCards++) {
      const newCard = new Card(specialCards, 4);
      for (let i = 0; i < 4; i++) {
        this.deck.push(newCard);
      }
    }
    return this.mixDeck(this.deck);
  }

  public mixDeck(deck: Card[]) {
    for (const card of deck) {
      const randomIndex = Math.floor(Math.random() * deck.length);
      const randomIndex2 = Math.floor(Math.random() * deck.length);
      const saveTempCard: Card = deck[randomIndex];
      deck[randomIndex] = deck[randomIndex2];
      deck[randomIndex2] = saveTempCard;
    }
    return deck;
  }

  public drawCards(quantity: number): Card[] {
    const cards = this.deck.slice(0, quantity);
    this.deck.splice(0, quantity);
    return cards;
  }
}
