import {Component, OnInit} from '@angular/core';
import {DeckService} from '../../core/services/deck.service';
import {Card} from '../../Class/card';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  playersNames: string[] = ['first_player', 'second_player', 'third_player', 'fourth_player'];
  players = 4;
  gameStarted = false;
  playersDeck: Card[][] = [];
  tableCard: Card[] = [];
  playerTurn = 0;
  skipTurnCounter = 0;
  drawCardsCounter = 0;
  lastUserCard: Card = null;
  reverseDirection = false;
  tableColor: number;
  userUsedDrawCard = false;

  constructor(private deckService: DeckService) {
  }

  ngOnInit() {
    this.startGame();
  }


  public startGame() {
    this.gameStarted = true;
    for (let i = 0; i < this.players; i++) {
      this.playersDeck.push(this.drawCards(7));
    }
    this.tableCard.push(this.drawCards(1)[0]);
    this.tableColor = this.tableCard[0].color;
  }

  public numberOfPlayers() {
    this.playersNames = [];
    for (let i = 0; i < this.players; i++) {
      this.playersNames.push('');
    }
  }

  public onDrawClick(deckPosition: number) {
    if (this.drawCardsCounter !== 0 || !this.lastUserCard === null) {
      return;
    }
    this.playersDeck[deckPosition].push(this.drawCards(1)[0]);
  }

  public drawCards(quantity: number): Card[] {
    return this.deckService.drawCards(quantity);
  }

  public changeColor() {
    this.nextPlayer();
  }

  // THROW CARD
  public cardToTable(deckPosition: number, cardPosition: number) {
    const card: Card = this.playersDeck[deckPosition][cardPosition];
    if (this.lastUserCard !== null && this.lastUserCard.value !== card.value) {
      return; // not same card as before
    }
    const isValidMove = this.isValidMove(card);
    if (isValidMove) {
      switch (card.value) {
        case 0 - 9:
          break;
        case 10: // +2
          this.drawCardsCounter += 2;
          this.userUsedDrawCard = true;
          break;
        case 11: // reverse
          this.reverseDirection = !this.reverseDirection;
          break;
        case 12: // skip
          this.skipTurnCounter++;
          break;
        case 13:
          this.tableColor = null;
          break;
        case 14: // +4
          this.tableColor = null;
          this.drawCardsCounter += 4;
          this.userUsedDrawCard = true;
          break;
      }
      this.onValidMove(deckPosition, cardPosition, card);
    }

  }

  public onValidMove(deckPosition: number, cardPosition: number, card: Card) {
    this.tableCard.push(card);
    this.lastUserCard = card;
    if (card.color !== 4) {
      this.tableColor = card.color;
    }
    this.removeCardFromPlayer(deckPosition, cardPosition);
  }

  public isValidMove(card: Card): boolean {
    return (this.lastUserCard === null && this.isSameColor(card)) || this.isSameNumber(card) || card.color === 4;
  }

  public isSameColor(card: Card) {
    return this.tableColor === card.color;
    // return this.tableCard[this.tableCard.length - 1].color === card.color;
  }

  public isSameNumber(card: Card) {
    return this.tableCard[this.tableCard.length - 1].value === card.value;
  }


  // PLAYER ACTIONS
  public nextPlayer() {
    if (!this.userUsedDrawCard) {
      for (let i = 0; i < this.drawCardsCounter; i++) {
        this.playersDeck[this.playerTurn].push(this.drawCards(this.drawCardsCounter)[0]);
      }
      this.drawCardsCounter = 0;
    }
    if (this.skipTurnCounter === 0) {
      this.increasePlayerTurn();
    } else {
      for (let i = 0; i <= this.skipTurnCounter; i++) {
        this.increasePlayerTurn();
      }
    }
    this.userUsedDrawCard = false;
    this.lastUserCard = null;
    this.skipTurnCounter = 0;
  }

  public increasePlayerTurn() {
    if (!this.reverseDirection && this.playerTurn === this.playersNames.length - 1) {
      this.playerTurn = 0;
    } else if (this.reverseDirection && this.playerTurn === 0) {
      this.playerTurn = this.playersNames.length - 1;
    } else {
      !this.reverseDirection ? this.playerTurn++ : this.playerTurn--;
    }
  }

  public removeCardFromPlayer(deckPosition: number, cardPosition: number) {
    this.playersDeck[deckPosition].splice(cardPosition, 1);
  }

  public restart() {
    this.playersDeck = [];
    this.gameStarted = false;
    this.playerTurn = 0;
    this.skipTurnCounter = 0;
    this.lastUserCard = null;
    this.reverseDirection = false;
    this.tableColor = undefined;
    this.deckService.startGame();
  }

}
