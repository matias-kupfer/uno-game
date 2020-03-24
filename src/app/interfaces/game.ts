import {Card} from '../class/card';
import {Deck} from '../class/deck';

export interface Game {
  gameId: string;
  password: string;
  players: string[];
  deck: Card[];
  gameStarted: boolean;
  gameFinished: boolean;
  nextPlayerCounter: number;
  winners: string[];
  tableCard: Card[];
  decksLength: [{
    player: string,
    length: number
  }];
  playerTurn: number;
  playerDrawCard: boolean;
  skipTurnCounter: number;
  drawCardsCounter: number;
  lastPlayerCard: Card;
  reverseDirection: boolean;
  tableColor: number;
}
