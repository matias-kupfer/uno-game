import {Card} from '../Class/card';
import {Deck} from '../Class/deck';

export interface Game {
  gameId: string;
  password: string;
  players: string[];
  deck: Card[];
  playersDeck: [Card[]];
  gameStarted: boolean;
  tableCard: Card[];
  playerTurn: number;
  userDrawCard: boolean;
  skipTurnCounter: number;
  drawCardsCounter: number;
  lastUserCard: Card;
  reverseDirection: boolean;
  tableColor: number;
}
