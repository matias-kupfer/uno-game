import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {MatSnackBar} from '@angular/material';

import * as firebase from 'firebase';

import {BehaviorSubject} from 'rxjs';
import {Game} from '../../interfaces';
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
  public $unsubscribe: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public player: string;
  public turnInterval: number;

  constructor(private snackBar: MatSnackBar, private router: Router) {
  }

  public connectGame(gameId: string, player: string) {
    const unsubscribe = this.db.collection(Collection.Games).doc(gameId).onSnapshot((res) => {
      if (res.exists) {
        if (this.$game.getValue() === null && this.checkValidPlayer(res.data().players, player) ||
          this.$game.getValue() !== null) { // the player is on the list
          // game started
          if (res.data().gameStarted === true && !this.$game.getValue().gameStarted) {
            this.snackBar.open('Game started', '', {duration: 3000});
            this.playerDeckSubscription();
          }
          // game finished
          if (res.data().gameFinished === true && !this.$game.getValue().gameFinished) {
            this.snackBar.open('Game ended', '', {duration: 3000});
          }
          // player turn
          if (res.data().gameStarted && res.data().players[res.data().playerTurn] === this.player &&
            res.data().playerTurn !== this.$game.getValue().playerTurn) {
            this.timer();
          }
          this.player = player;
          this.$game.next(res.data() as Game);
        } else {
          this.snackBar.open('access denied', '', {duration: 3000});
          this.router.navigate(['home']);
        }
      } else {
        this.snackBar.open('Game does not exist', '', {duration: 3000});
        this.router.navigate(['home']);
      }
    });
    this.$unsubscribe.subscribe(unsubscribeValue => {
      if (unsubscribeValue) {
        unsubscribe();
      }
    });
  }

  public startGame(gameId: string, game: Game) {
    const tableCard = this.drawCards(UnoParams.CardsDrawnIfNothing)[0];
    this.generatePlayerDecks();
    return this.db.collection(Collection.Games).doc(gameId).update(
      {
        gameStarted: true,
        playerTurn: Math.floor(Math.random() * game.players.length),
        tableCard: FieldValue.arrayUnion(editable(tableCard)),
        tableColor: tableCard.color,
        decksLength: this.deckLengthInit(game),
      });
  }

  public updateGame() {
    this.db.collection(Collection.Games).doc(this.$game.getValue().gameId)
      .set(editable(this.$game.getValue()));
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

  public checkValidPlayer(gamePlayersList: string[], newPlayer: string) {
    for (const player of gamePlayersList) {
      if (player === newPlayer) {
        return true;
      }
    }
    return false;
  }


  // Deck
  public playerDeckSubscription() {
    const unsubscribe =
      this.db.collection(Collection.Games).doc(this.$game.getValue().gameId).collection(this.player).doc(FirebaseDoc.PlayerDeck)
        .onSnapshot(updatedPlayerDeck => {
            if (updatedPlayerDeck.exists) {
              this.$playerDeck.next(updatedPlayerDeck.data().playerDeck);
            }
          }
        );
    this.$unsubscribe.subscribe(unsubscribeValue => {
      if (unsubscribeValue) {
        unsubscribe();
      }
    });
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

  async updatePlayersDeck(playerDeck: Card[], player: string) {
    await this.db.collection(Collection.Games).doc(this.$game.getValue().gameId).collection(player).doc(FirebaseDoc.PlayerDeck)
      .set({
        playerDeck: editable(playerDeck),
      });
  }

  public drawCards(quantity: number): Card[] {
    const cards = this.$game.getValue().deck.slice(0, quantity);
    this.$game.getValue().deck.splice(0, quantity);
    this.updateGame();
    return cards;
  }
}
