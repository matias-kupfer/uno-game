import {Injectable} from '@angular/core';
import * as firebase from 'firebase';
import {DocumentData} from '@angular/fire/firestore';
import {DeckService} from './deck.service';
import {Card} from '../../Class/card';
import {Game} from '../../interfaces/game';
import {BehaviorSubject} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import FieldValue = firebase.firestore.FieldValue;


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  public db = firebase.firestore();
  public $game: BehaviorSubject<Game> = new BehaviorSubject<Game>(null);
  public $playerDeck: BehaviorSubject<Card[]> = new BehaviorSubject<Card[]>(null);
  public player: string;
  public x = 0;

  constructor(private deckService: DeckService, private snackBar: MatSnackBar, private router: Router) {
  }

  public connectGame(gameId: string, userName: string): DocumentData {
    return this.db.collection('games').doc(gameId).onSnapshot((res) => {
      if (res.exists) {
        if (this.checkValidUser(res.data().players, userName)) {
          if (res.data().gameStarted === true && !this.$game.getValue().gameStarted) { // game started
            this.snackBar.open('game started', '', {
              duration: 3000
            });
            this.playerDeckSubscription();
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
    this.generatePlayerDecks().then(r => {
    });
    const tableCard = this.drawCards(1)[0];
    return this.db.collection('games').doc(gameId).update(
      {
        gameStarted: true,
        playerTurn: Math.floor(Math.random() * game.players.length),
        tableCard: FieldValue.arrayUnion(JSON.parse(JSON.stringify(tableCard))),
        tableColor: tableCard.color
      });
  }

  public updateGame(/*game: Game*/) {
    this.db.collection('games').doc(this.$game.getValue().gameId)
      .set(JSON.parse(JSON.stringify(this.$game.getValue())));
  }

  public playerDeckSubscription() {
    this.db.collection('games').doc(this.$game.getValue().gameId).collection(this.player).doc('playerDeck')
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

  async generatePlayerDecks() {
    for (const player of this.$game.getValue().players) {
      await this.db.collection('games').doc(this.$game.getValue().gameId).collection(player).doc('playerDeck')
        .set({
          playerDeck: this.drawCards(7),
        });
    }
  }

  async updatePlayersDeck(playerDeck: Card[], player: string) {
    await this.db.collection('games').doc(this.$game.getValue().gameId).collection(player).doc('playerDeck')
      .set({
        playerDeck: JSON.parse(JSON.stringify(playerDeck)),
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
}
