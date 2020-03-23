import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';
import {DocumentData} from '@angular/fire/firestore';

import * as firebase from 'firebase';

import {BehaviorSubject} from 'rxjs';
// User defined
import {Game} from '../../interfaces';
import {DeckService} from './deck.service';
import {Collection, FirebaseDoc, UnoParams} from '../../enums';
import editable from '../../functions/editable.function';
import FieldValue = firebase.firestore.FieldValue;
import {Card} from '../../class/card';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public db = firebase.firestore();
  public $game: BehaviorSubject<Game> = new BehaviorSubject<Game>(null);
  public $timer: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public $playerDeck: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>(null);
  public player: string;
  public turnInterval: number;

  constructor(private deckService: DeckService, private snackBar: MatSnackBar, private router: Router) {
  }

  public connectGame(gameId: string, userName: string): DocumentData {
    return this.db.collection(Collection.Games).doc(gameId).onSnapshot((res) => {
      if (res.exists) {
        if (this.checkValidUser(res.data().players, userName)) {
          if (res.data().gameStarted === true && !this.$game.getValue().gameStarted) { // game started
            this.snackBar.open('game started', '', {
              duration: 3000
            });
            this.playerDeckSubscription();
          }
          if (res.data().gameFinished === true && !this.$game.getValue().gameFinished) { // game finished
            this.snackBar.open('game finished', '', {
              duration: 3000
            });
          }
          if (res.data().gameStarted && res.data().players[res.data().playerTurn] === this.player) { // user turn
            this.timer();
          }
          this.player = userName;
          this.$game.next(res.data() as Game);
        } else {
          this.snackBar.open('access denied for some fucking reason', '', {
            duration: 3000
          });
          this.router.navigate(['home']);
        }
      } else {
        this.snackBar.open('access denied (no exist)', '', {
          duration: 3000
        });
        this.router.navigate(['home']);
      }
    });
  }

  public startGame(gameId: string, game: Game) {
    this.generatePlayerDecks();
    const tableCard = this.drawCards(UnoParams.CardsDrawnIfNothing)[0];
    return this.db.collection(Collection.Games).doc(gameId).update(
      {
        gameStarted: true,
        playerTurn: Math.floor(Math.random() * game.players.length),
        tableCard: FieldValue.arrayUnion(editable(tableCard)),
        tableColor: tableCard.color,
        decksLength: this.deckLengthInit(game),
      });
  }

  public deckLengthInit(game: Game) {
    const decksLength = [];
    for (const player of game.players) {
      decksLength.push({
        player,
        length: 7
      });
    }
    return decksLength;
  }

  public timer() {
    clearInterval(this.turnInterval);
    this.$timer.next(20);
    this.turnInterval = setInterval(() => {
      this.$timer.next(this.$timer.getValue() - 1);
      if (this.$timer.getValue() === 0) {
        return;
      }
    }, 1000);
  }

  public updateGame() {
    this.db.collection(Collection.Games).doc(this.$game.getValue().gameId)
      .set(editable(this.$game.getValue()));
  }

  public playerDeckSubscription() {
    this.db.collection(Collection.Games).doc(this.$game.getValue().gameId).collection(this.player).doc(FirebaseDoc.PlayerDeck)
      .onSnapshot(updatedPlayerDeck => {
        this.$playerDeck.next(updatedPlayerDeck.data().playerDeck);
      });
  }

  public drawCards(quantity: number): Card[] {
    const cards = this.$game.getValue().deck.slice(0, quantity);
    this.$game.getValue().deck.splice(0, quantity);
    this.updateGame();
    return cards;
  }

  public generatePlayerDecks() {
    for (const player of this.$game.getValue().players) {
      this.db.collection(Collection.Games).doc(this.$game.getValue().gameId).collection(player).doc(FirebaseDoc.PlayerDeck)
        .set({
          player,
          playerDeck: this.drawCards(UnoParams.InitialCardsDrawn),
        });
    }
  }

  async updatePlayersDeck(playerDeck: Card[], player: string) {
    await this.db.collection(Collection.Games).doc(this.$game.getValue().gameId).collection(player).doc(FirebaseDoc.PlayerDeck)
      .set({
        playerDeck: editable(playerDeck),
      });
  }

  public checkValidUser(gamePlayersList: string[], userName: string) {
    for (const user of gamePlayersList) {
      if (user === userName) {
        return true;
      }
    }
    return false;
  }

  async getPlayersDeck(player: string) {
    return this.db.collection('games').doc(this.$game.getValue().gameId).collection(player).doc('playerDeck').get();
  }
}
