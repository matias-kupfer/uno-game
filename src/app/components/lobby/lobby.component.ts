import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../core/services/api.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FirestoreService} from '../../core/services/firestore.service';
import {MatSnackBar} from '@angular/material';
import {Game} from '../../interfaces';
import {Card} from '../../class/card';


@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  public game: Game = null;
  public playerDeck: Card[] = null;
  public gameId: string = this.route.snapshot.paramMap.get('gameId');
  public player: string = this.route.snapshot.paramMap.get('player');
  public timer: number = null;

  constructor(
    private apiService: ApiService,
    private firestoreService: FirestoreService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    this.firestoreService.connectGame(this.gameId, this.player);
    this.firestoreService.$game.subscribe(game => this.game = game);
    this.firestoreService.$playerDeck.subscribe(updatedPlayerDeck => {
      this.playerDeck = updatedPlayerDeck;
    });
    this.timerSubscription();
  }

  public startGame() {
    this.firestoreService.startGame(this.gameId, this.game).catch((e) => {
      this.snackBar.open('error starting the game', '', {
        duration: 3000
      });
      console.log(e);
    });
  }

  public timerSubscription() {
    this.firestoreService.$timer.subscribe(timer => {
      this.timer = timer;
      if (timer === 0) {
        this.drawCard();
        this.drawCard();
        this.drawCounterCards();
        this.nextPlayer();
      }
    });
  }

  // CARD ACTIONS
  public cardToTable(cardPosition: number) {
    const card: Card = this.playerDeck[cardPosition];
    if (this.game.lastPlayerCard !== null && this.game.lastPlayerCard.value !== card.value ||
      this.game.drawCardsCounter !== 0 && this.game.tableCard[this.game.tableCard.length - 1].value === 14 && card.value !== 14 ||
      this.game.drawCardsCounter !== 0 && this.game.tableCard[this.game.tableCard.length - 1].value === 10 && card.value !== 10) {
      return;
    }
    if (this.isValidMove(card)) {
      this.game.nextPlayerCounter = 0;
      switch (card.value) {
        case 0 - 9:
          break;
        case 10: // +2
          this.game.drawCardsCounter += 2;
          this.game.playerDrawCard = true;
          break;
        case 11: // reverse
          this.game.reverseDirection = !this.game.reverseDirection;
          break;
        case 12: // skip
          this.game.skipTurnCounter++;
          break;
        case 13:
          this.game.tableColor = null;
          break;
        case 14: // +4
          this.game.tableColor = null;
          this.game.drawCardsCounter += 4;
          this.game.playerDrawCard = true;
          break;
      }
      this.onValidMove(cardPosition, card);
      this.firestoreService.updateGame();
    }

  }

  public onValidMove(cardPosition: number, card: Card) {
    this.game.tableCard.push(card);
    this.game.lastPlayerCard = card;
    if (card.color !== 4) {
      this.game.tableColor = card.color;
    }
    this.removeCardFromPlayer(cardPosition);
  }

  public isValidMove(card: Card): boolean {
    return (this.game.lastPlayerCard === null && this.isSameColor(card)) || this.isSameNumber(card) || card.color === 4;
  }

  public isSameColor(card: Card) {
    return this.game.tableColor === card.color;
  }

  public isSameNumber(card: Card) {
    return this.game.tableCard[this.game.tableCard.length - 1].value === card.value;
  }

  public removeCardFromPlayer(cardPosition: number) {
    this.playerDeck.splice(cardPosition, 1);
  }

  // PLAYER ACTIONS
  public drawCard() {
    if (this.game.deck.length === 0) {
      this.snackBar.open('No more cards', '', {
        duration: 3000
      });
      this.game.drawCardsCounter = 0;
      return;
    }
    this.game.playerDrawCard = true;
    this.playerDeck.push(this.firestoreService.drawCards(1)[0]);
  }

  public drawCounterCards() {
    for (let i = 0; i < this.game.drawCardsCounter; i++) {
      this.drawCard();
    }
    this.game.drawCardsCounter = 0;
    this.game.nextPlayerCounter = 0;
  }

  public changeColor() {
    this.nextPlayer();
  }

  public nextPlayer() {
    if (this.game.nextPlayerCounter === this.game.players.length - 1) {
      this.game.gameFinished = true; // game finished
      this.setWinners();
    }
    if (!this.game.playerDrawCard) {
      if (this.game.drawCardsCounter !== 0) {
        this.drawCounterCards();
      } else if (!this.game.lastPlayerCard) {
        this.game.nextPlayerCounter++;
      }
    }
    this.game.decksLength[this.game.playerTurn] = {player: this.player, length: this.playerDeck.length};
    if (this.game.drawCardsCounter === 0) {
      this.checkForWinner();
    }
    if (this.game.skipTurnCounter === 0 && (this.game.players.length > 2 ||
      this.game.lastPlayerCard === null || this.game.lastPlayerCard.value !== 11)) {
      this.increasePlayerTurn();
    } else if (this.game.players.length > 2) {
      for (let i = 0; i <= this.game.skipTurnCounter; i++) {
        this.increasePlayerTurn();
      }
    }
    this.game.playerDrawCard = false;
    this.game.lastPlayerCard = null;
    this.game.skipTurnCounter = 0;
    this.firestoreService.updatePlayersDeck(this.playerDeck, this.player);
    this.firestoreService.$game.next(this.game);
    this.firestoreService.updateGame();
  }

  public increasePlayerTurn() {
    if (!this.game.reverseDirection && this.game.playerTurn === this.game.players.length - 1) {
      this.game.playerTurn = 0;
    } else if (this.game.reverseDirection && this.game.playerTurn === 0) {
      this.game.playerTurn = this.game.players.length - 1;
    } else {
      !this.game.reverseDirection ? this.game.playerTurn++ : this.game.playerTurn--;
    }
  }

  public checkForWinner() {
    for (const playerDeck of this.game.decksLength) {
      if (playerDeck.length === 0) {
        this.game.gameFinished = true;
        this.game.winners.push(playerDeck.player);
        break;
      }
    }
  }

  public setWinners() {
    let winners = [this.game.decksLength[0]];
    for (let i = 1; i < this.game.decksLength.length; i++) {
      if (this.game.decksLength[i].length < winners[0].length) {
        winners = [this.game.decksLength[i]];
      } else if (this.game.decksLength[i].length === winners[0].length) {
        winners.push(this.game.decksLength[i]);
      }
    }
    for (const winner of winners) {
      this.game.winners.push(winner.player);
    }
  }
}
